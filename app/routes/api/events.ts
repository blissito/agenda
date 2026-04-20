import type { Event } from "@prisma/client"
import invariant from "tiny-invariant"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { cancelEventFully } from "~/lib/event-cancel.server"
import { createMeetLink } from "~/lib/google-meet.server"
import { createZoomMeeting } from "~/lib/zoom.server"
import { db } from "~/utils/db.server"
import { resolveVideoProvider } from "~/utils/videoProvider.server"
import { newEventSchema } from "~/utils/zod_schemas"
import type { Route } from "./+types/customers"

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
    await db.event.update({
      where: { id: eventId, orgId: org.id },
      data: { attended },
    })
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

    const customer = await db.customer.findUnique({
      where: { id: validData.customerId as string },
      select: { displayName: true },
    })
    invariant(customer)

    // Only update allowed fields - ensure event belongs to org
    const updatedEvent = await db.event.update({
      where: {
        id: eventId,
        orgId: org.id,
      },
      data: {
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

    const customer = await db.customer.findUnique({
      where: { id: validData.customerId as string },
      select: { displayName: true },
    })
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

    return event
  }
  return null
}
