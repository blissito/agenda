import { getPayment, validateWebhookSignature } from "~/.server/mercadopago"
import { incrementCouponRedemption } from "~/lib/coupons.server"
import { createMeetLink } from "~/lib/google-meet.server"
import { awardPoints } from "~/lib/loyalty.server"
import {
  branchIdFilter,
  createEventInFreeSlot,
} from "~/lib/slot-capacity.server"
import { createZoomMeeting } from "~/lib/zoom.server"
import { db } from "~/utils/db.server"
import {
  sendAppointmentToCustomer,
  sendAppointmentToOwner,
} from "~/utils/emails/sendAppointment"
import { sendPaymentFailedEmail } from "~/utils/emails/sendPaymentFailed"
import { resolveVideoProvider } from "~/utils/videoProvider.server"
import type { Route } from "./+types/mercadopago.webhook"

export const action = async ({ request }: Route.ActionArgs) => {
  // Requerir MP_WEBHOOK_SECRET en producción por seguridad
  if (!process.env.MP_WEBHOOK_SECRET) {
    console.error("MP_WEBHOOK_SECRET not configured")
    return new Response("Webhook not configured", { status: 500 })
  }

  const body = await request.json()

  // Validar firma del webhook
  {
    const xSignature = request.headers.get("x-signature")
    const xRequestId = request.headers.get("x-request-id")
    const dataId = body.data?.id?.toString() || ""

    if (!validateWebhookSignature(xSignature, xRequestId, dataId)) {
      console.error("MP Webhook: Invalid signature")
      return new Response("Unauthorized", { status: 401 })
    }
  }

  // IPN de Mercado Pago
  if (body.type === "payment" && body.data?.id) {
    const paymentId = body.data.id

    try {
      const payment = await getPayment(paymentId)

      if (!payment.external_reference) {
        return new Response("OK", { status: 200 })
      }

      const {
        serviceId,
        customerId,
        branchId,
        start,
        end,
        couponRewardId,
      }: {
        serviceId: string
        customerId: string
        branchId?: string | null
        start: string
        end: string
        couponRewardId?: string | null
      } = JSON.parse(payment.external_reference)

      // Buscar servicio y customer
      const [service, customer] = await Promise.all([
        db.service.findUnique({
          where: { id: serviceId },
          include: { org: true },
        }),
        db.customer.findUnique({ where: { id: customerId } }),
      ])

      if (!service || !customer) {
        console.error("Service or customer not found:", serviceId, customerId)
        return new Response("OK", { status: 200 })
      }

      // Pago aprobado: crear evento
      if (payment.status === "approved") {
        // Idempotencia: verificar si ya existe un evento con este payment_id
        const existingEvent = await db.event.findFirst({
          where: { mp_payment_id: String(paymentId) },
        })
        if (existingEvent) {
          console.log(
            "MP Webhook: Event already exists for payment:",
            paymentId,
          )
          return new Response("OK", { status: 200 })
        }

        const buildEventData = (slotIndex: number) => ({
          start: new Date(start),
          end: new Date(end),
          duration: service.duration,
          slotIndex,
          serviceId: service.id,
          title: service.name,
          status: "pending",
          orgId: service.orgId,
          customerId: customer.id,
          // Snapshot de la sede (si el booking la envió y pertenece a la org).
          ...(branchId ? { branchId } : {}),
          paid: true,
          mp_payment_id: String(paymentId),
          mp_preference_id: (payment as any).preference_id || null,
          payment_method: "mercadopago",
          allDay: false,
          archived: false,
          type: "appointment",
          userId: service.org.ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        const eventInclude = {
          customer: true,
          service: { include: { org: true } },
        }

        const slotResult = await createEventInFreeSlot(
          {
            org: service.org,
            service,
            branchId: branchId ?? null,
            branchWhere: {
              orgId: service.orgId,
              ...(branchId ? { branchId } : {}),
            },
            start: new Date(start),
            end: new Date(end),
          },
          (slotIndex) =>
            db.event.create({
              data: buildEventData(slotIndex),
              include: eventInclude,
            }),
        )

        let event
        if (slotResult.ok) {
          event = slotResult.event
        } else {
          // El cliente YA pagó: no perdemos la reserva. La creamos en un carril
          // de overflow (más allá de la capacidad) y avisamos para revisión.
          console.warn(
            "MP Webhook: slot lleno/cruzado para reserva pagada, creando overflow",
            { serviceId, start, reason: slotResult.reason },
          )
          const top = await db.event.findFirst({
            where: {
              serviceId: service.id,
              start: new Date(start),
              ...branchIdFilter(branchId ?? null),
              archived: false,
            },
            orderBy: { slotIndex: "desc" },
            select: { slotIndex: true },
          })
          event = await db.event.create({
            data: buildEventData((top?.slotIndex ?? -1) + 1),
            include: eventInclude,
          })
        }

        // Crear link de llamada (Meet/Zoom) según videoProvider del servicio
        const provider = resolveVideoProvider({ org: service.org, service })
        if (provider === "meet") {
          try {
            const { meetingLink, calendarEventId, calendarHtmlLink } =
              await createMeetLink({
                org: service.org,
                event,
                service,
                customer,
              })
            const updated = await db.event.update({
              where: { id: event.id },
              data: {
                meetingLink,
                calendarEventId,
                calendarHtmlLink,
                videoProvider: "meet",
              },
              include: {
                customer: true,
                service: { include: { org: true } },
              },
            })
            event = updated
          } catch (e) {
            console.error(
              "[MP webhook] Meet creation failed:",
              e instanceof Error ? e.message : e,
            )
            await db.event.update({
              where: { id: event.id },
              data: { videoProvider: "none" },
            })
          }
        } else if (provider === "zoom") {
          try {
            const { meetingLink, meetingId } = await createZoomMeeting({
              org: service.org,
              event,
              service,
              customer,
            })
            const updated = await db.event.update({
              where: { id: event.id },
              data: {
                meetingLink,
                zoomMeetingId: meetingId,
                videoProvider: "zoom",
              },
              include: {
                customer: true,
                service: { include: { org: true } },
              },
            })
            event = updated
          } catch (e) {
            console.error(
              "[MP webhook] Zoom creation failed:",
              e instanceof Error ? e.message : e,
            )
            await db.event.update({
              where: { id: event.id },
              data: { videoProvider: "none" },
            })
          }
        } else {
          await db.event.update({
            where: { id: event.id },
            data: { videoProvider: "none" },
          })
        }

        // Enviar emails (después de crear el link para que el correo lo incluya)
        try {
          await sendAppointmentToCustomer({
            email: customer.email,
            event: event as any,
          })
          if (service.org.email) {
            await sendAppointmentToOwner({
              email: service.org.email,
              event: event as any,
            })
          }
        } catch (e) {
          console.error("Email send failed:", e)
        }

        console.log("MP Payment approved, event created:", event.id)

        // Award loyalty points. Los puntos vienen explícitamente de
        // `service.points` (definido por el owner). Si es 0 → skip.
        const basePoints = Number(service.points)
        if (Number.isFinite(basePoints) && basePoints > 0) {
          try {
            await awardPoints({
              customerId: customer.id,
              orgId: service.org.id,
              eventId: event.id,
              basePoints,
            })
          } catch (e) {
            console.error("Loyalty awardPoints failed:", e)
          }
        }

        // Increment coupon redemption count if a coupon was used
        if (couponRewardId) {
          try {
            await incrementCouponRedemption(couponRewardId)
          } catch (e) {
            console.error("Coupon redemption increment failed:", e)
          }
        }
      }

      // Pago rechazado o cancelado: enviar email
      if (payment.status === "rejected" || payment.status === "cancelled") {
        const url = new URL(request.url)
        const retryLink = `${url.origin}/${service.slug}`

        await sendPaymentFailedEmail({
          email: customer.email,
          customerName: customer.displayName,
          serviceName: service.name,
          orgName: service.org.name,
          retryLink,
        })

        console.log("MP Payment failed, email sent:", payment.status)
      }
    } catch (e) {
      console.error("MP Webhook error:", e)
    }
  }

  return new Response("OK", { status: 200 })
}

// GET para verificación de MP
export const loader = () => new Response("OK", { status: 200 })
