import type { Event } from "@prisma/client"
import invariant from "tiny-invariant"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { cancelEventFully } from "~/lib/event-cancel.server"
import { createMeetLink } from "~/lib/google-meet.server"
import { awardPoints } from "~/lib/loyalty.server"
import { createZoomMeeting } from "~/lib/zoom.server"
import { db } from "~/utils/db.server"
import { sendAppointmentToCustomer } from "~/utils/emails/sendAppointment"
import { resolveVideoProvider } from "~/utils/videoProvider.server"
import { newEventSchema } from "~/utils/zod_schemas"
import type { Route } from "./+types/customers"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")

  if (intent === "pending_attendance") {
    const { org } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    // Citas pasadas que aún no tienen asistencia confirmada/negada.
    // Excluimos canceladas, archivadas y bloqueos.
    // OJO: en Prisma+MongoDB, `attended: null` NO matchea documentos donde
    // el campo no existe (eventos viejos creados antes del campo). Usamos
    // OR con `isSet: false` para cubrir ambos casos.
    const events = await db.event.findMany({
      where: {
        orgId: org.id,
        archived: false,
        type: { not: "BLOCK" },
        status: { not: "CANCELLED" },
        start: { lt: new Date() },
        OR: [{ attended: null }, { attended: { isSet: false } }],
      },
      include: {
        service: { select: { name: true } },
        customer: { select: { displayName: true } },
      },
      orderBy: { start: "desc" },
      take: 20,
    })
    return Response.json({
      events: events.map((e) => ({
        id: e.id,
        start: e.start.toISOString(),
        customerName: e.customer?.displayName ?? "Sin cliente",
        serviceName: e.service?.name ?? "",
      })),
    })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

export const action = async ({ request }: Route.ActionArgs) => {
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")
  const formData = await request.formData()

  if (intent === "mark_attendance") {
    const { org } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    const eventId = (formData.get("eventId") as string) || ""
    const raw = formData.get("attended") as string | null
    const attended = raw === "true" ? true : raw === "false" ? false : null
    if (!eventId) {
      return Response.json({ error: "eventId requerido" }, { status: 400 })
    }
    const updated = await db.event.update({
      where: { id: eventId, orgId: org.id },
      data: { attended },
      include: { service: { select: { points: true } } },
    })

    // Premia puntos cuando confirmamos asistencia. Es la única ruta de
    // award para citas gratuitas (sin webhook de pago). awardPoints es
    // idempotente por eventId, así que volver a marcar asistencia no duplica.
    // Los puntos vienen explícitamente de `service.points` (lo define el
    // owner por servicio). Si es 0/no definido → no se acreditan puntos.
    if (attended === true && updated.customerId && updated.service) {
      const basePoints = Number(updated.service.points)
      if (Number.isFinite(basePoints) && basePoints > 0) {
        try {
          await awardPoints({
            customerId: updated.customerId,
            orgId: org.id,
            eventId: updated.id,
            basePoints,
          })
        } catch (e) {
          console.error(
            "[mark_attendance] awardPoints failed:",
            e instanceof Error ? e.message : e,
          )
        }
      }
    }
    return Response.json({ ok: true })
  }

  if (intent === "delete") {
    const eventId = url.searchParams.get("eventId") as string
    const { org } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    const existing = await db.event.findFirst({
      where: { id: eventId, orgId: org.id },
      select: { start: true },
    })
    // Periodo de gracia: 2 días después de la cita ya no se puede eliminar.
    const DELETE_GRACE_MS = 2 * 24 * 60 * 60 * 1000
    if (existing && Date.now() - existing.start.getTime() > DELETE_GRACE_MS) {
      return Response.json(
        { error: "No se puede eliminar una cita que pasó hace más de 2 días" },
        { status: 400 },
      )
    }
    const updated = await cancelEventFully({ eventId, orgId: org.id })
    if (!updated) {
      return Response.json({ error: "Event not found" }, { status: 404 })
    }
    return updated
  }

  if (intent === "update") {
    const { org } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    const eventId = url.searchParams.get("eventId") as string
    const data: Event = JSON.parse(formData.get("data") as string)

    // Validate with schema
    const validData = newEventSchema.parse(data)

    // Validate service belongs to org (prevent cross-org event update)
    if (validData.serviceId) {
      const service = await db.service.findUnique({
        where: { id: validData.serviceId },
        select: { orgId: true },
      })
      if (!service || service.orgId !== org.id) {
        return Response.json(
          {
            error: "Servicio no encontrado o no pertenece a esta organización",
          },
          { status: 403 },
        )
      }
    }

    // Cross-org guard: el cliente debe pertenecer a esta org.
    const customer = await db.customer.findFirst({
      where: { id: validData.customerId as string, orgId: org.id },
      select: { displayName: true },
    })
    invariant(customer)

    const { updateEventFully } = await import("~/lib/event-update.server")
    const updatedEvent = await updateEventFully({
      eventId,
      orgId: org.id,
      changes: {
        start: validData.start,
        end: validData.end,
        duration: validData.duration,
        customerId: validData.customerId,
        employeeId: validData.employeeId,
        serviceId: validData.serviceId,
        paid: validData.paid,
        payment_method: validData.payment_method,
        notes: validData.notes,
        title: customer.displayName as string,
      },
    })
    if (!updatedEvent) {
      return Response.json(
        { error: "Evento no encontrado o no pertenece a esta organización" },
        { status: 404 },
      )
    }
    return updatedEvent
  }

  if (intent === "new") {
    const { org, user } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    const data: Event = JSON.parse(formData.get("data") as string)
    const validData = newEventSchema.parse(data)

    // Validate service belongs to org (prevent cross-org event creation)
    if (validData.serviceId) {
      const service = await db.service.findUnique({
        where: { id: validData.serviceId },
        select: { orgId: true },
      })
      if (!service || service.orgId !== org.id) {
        return Response.json(
          {
            error: "Servicio no encontrado o no pertenece a esta organización",
          },
          { status: 403 },
        )
      }
    }

    // Cross-org guard: si se manda customerId, debe ser de esta org.
    const customer = validData.customerId
      ? await db.customer.findFirst({
          where: { id: validData.customerId as string, orgId: org.id },
          select: { displayName: true },
        })
      : null
    if (validData.customerId && !customer) {
      return Response.json(
        { error: "Cliente no encontrado o no pertenece a esta organización" },
        { status: 403 },
      )
    }
    const now = new Date()
    const event = await db.event.create({
      data: {
        ...validData,
        orgId: org.id,
        userId: user.id,
        title: customer?.displayName ?? "",
        // Required fields
        allDay: false,
        archived: false,
        status: "pending",
        type: "APPOINTMENT",
        createdAt: now,
        updatedAt: now,
      },
    })

    // Resolver el proveedor de link de llamada (meet | zoom | none)
    if (validData.serviceId && validData.customerId) {
      const [service, fullCustomer] = await Promise.all([
        db.service.findUnique({ where: { id: validData.serviceId } }),
        db.customer.findUnique({ where: { id: validData.customerId } }),
      ])
      const override = (validData as any).videoProvider as string | undefined
      const provider = resolveVideoProvider({ org, service, override })

      if (service && fullCustomer && provider === "meet") {
        try {
          const { meetingLink, calendarEventId, calendarHtmlLink } =
            await createMeetLink({
              org,
              event,
              service,
              customer: fullCustomer,
            })
          await db.event.update({
            where: { id: event.id },
            data: {
              meetingLink,
              calendarEventId,
              calendarHtmlLink,
              videoProvider: "meet",
            },
          })
        } catch (e) {
          console.error(
            "[Meet] creation failed:",
            e instanceof Error ? e.message : e,
          )
          await db.event.update({
            where: { id: event.id },
            data: { videoProvider: "none" },
          })
        }
      } else if (service && fullCustomer && provider === "zoom") {
        try {
          const { meetingLink, meetingId } = await createZoomMeeting({
            org,
            event,
            service,
            customer: fullCustomer,
          })
          await db.event.update({
            where: { id: event.id },
            data: {
              meetingLink,
              zoomMeetingId: meetingId,
              videoProvider: "zoom",
            },
          })
        } catch (e) {
          console.error(
            "[Zoom] creation failed:",
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
    }

    // Send confirmation email to customer
    try {
      const fullEvent = await db.event.findUnique({
        where: { id: event.id },
        include: {
          customer: true,
          service: { include: { org: true } },
        },
      })
      if (fullEvent?.customer?.email) {
        await sendAppointmentToCustomer({
          email: fullEvent.customer.email,
          event: fullEvent as any,
        })
      }
    } catch (e) {
      console.error("[api/events] Email send failed:", e)
    }

    // Schedule confirmation, reminder and survey notifications
    if (validData.serviceId && event.start && event.end) {
      try {
        const service = await db.service.findUnique({
          where: { id: validData.serviceId },
          select: { config: true },
        })
        const { scheduleEventNotifications } = await import(
          "~/jobs/definitions.server"
        )
        await scheduleEventNotifications(
          event.id,
          event.start,
          event.end,
          service?.config as
            | {
                reminder?: boolean
                confirmation?: boolean | null
                survey?: boolean
                reminderHours?: number | null
              }
            | undefined,
          org.timezone,
        )
      } catch (e) {
        console.error("[api/events] Failed to schedule notifications:", e)
      }
    }

    return event
  }
  return null
}
