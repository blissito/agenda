import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { getOrgFromApiKey } from "~/.server/apiKeyAuth"
import { cancelEventFully } from "~/lib/event-cancel.server"
import { db } from "~/utils/db.server"
import { sendReminder } from "~/utils/emails/sendReminder"

/**
 * GET /api/mcp/events?intent=list&from=ISO&to=ISO&status=CONFIRMED&serviceId=&customerId=&attended=true
 * GET /api/mcp/events?intent=get&eventId=...
 *
 * Consumido por @denik/mcp. Auth via header `X-Denik-Api-Key`.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const org = await getOrgFromApiKey(request)
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent") ?? "list"

  if (intent === "get") {
    const eventId = url.searchParams.get("eventId")
    if (!eventId) return Response.json({ error: "eventId required" }, { status: 400 })
    const event = await db.event.findFirst({
      where: { id: eventId, orgId: org.id },
      include: { customer: true, service: true },
    })
    if (!event) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json(serialize(event))
  }

  if (intent === "list") {
    const from = url.searchParams.get("from")
    const to = url.searchParams.get("to")
    const status = url.searchParams.get("status") ?? undefined
    const serviceId = url.searchParams.get("serviceId") ?? undefined
    const customerId = url.searchParams.get("customerId") ?? undefined
    const attendedRaw = url.searchParams.get("attended")
    const attended =
      attendedRaw === "true" ? true : attendedRaw === "false" ? false : undefined
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200)

    const events = await db.event.findMany({
      where: {
        orgId: org.id,
        archived: false,
        ...(from || to
          ? { start: { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) } }
          : {}),
        ...(status && { status }),
        ...(serviceId && { serviceId }),
        ...(customerId && { customerId }),
        ...(attended !== undefined && { attended }),
      },
      include: { customer: true, service: true },
      orderBy: { start: "asc" },
      take: limit,
    })
    return Response.json(events.map(serialize))
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

/**
 * POST /api/mcp/events
 * body JSON con `intent`: cancel | reschedule | mark_attendance | create | send_reminder
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const org = await getOrgFromApiKey(request)
  const body = (await request.json().catch(() => ({}))) as Record<string, any>
  const intent = body.intent as string

  if (intent === "cancel") {
    if (!body.eventId) return Response.json({ error: "eventId required" }, { status: 400 })
    const updated = await cancelEventFully({ eventId: body.eventId, orgId: org.id })
    if (!updated) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json({ ok: true })
  }

  if (intent === "reschedule") {
    if (!body.eventId || !body.start)
      return Response.json({ error: "eventId and start required" }, { status: 400 })
    const start = new Date(body.start)
    // Mantener duración previa si no pasan `end`
    const existing = await db.event.findFirst({
      where: { id: body.eventId, orgId: org.id },
    })
    if (!existing) return Response.json({ error: "Not found" }, { status: 404 })
    const duration = Number(existing.duration)
    const end = body.end ? new Date(body.end) : new Date(start.getTime() + duration * 60_000)
    const updated = await db.event.update({
      where: { id: body.eventId },
      data: { start, end },
    })
    return Response.json(serialize(updated))
  }

  if (intent === "mark_attendance") {
    if (!body.eventId) return Response.json({ error: "eventId required" }, { status: 400 })
    const attended =
      body.attended === true ? true : body.attended === false ? false : null
    const updated = await db.event.update({
      where: { id: body.eventId, orgId: org.id },
      data: { attended },
    })
    return Response.json({ ok: true, attended: updated.attended })
  }

  if (intent === "create") {
    const { serviceId, customerId, start, notes } = body
    if (!serviceId || !customerId || !start)
      return Response.json(
        { error: "serviceId, customerId, start required" },
        { status: 400 },
      )
    const service = await db.service.findFirst({ where: { id: serviceId, orgId: org.id } })
    if (!service) return Response.json({ error: "Service not found" }, { status: 404 })
    const customer = await db.customer.findFirst({ where: { id: customerId, orgId: org.id } })
    if (!customer) return Response.json({ error: "Customer not found" }, { status: 404 })

    const startDate = new Date(start)
    const durationMin = Number(service.duration)
    const endDate = new Date(startDate.getTime() + durationMin * 60_000)
    const now = new Date()
    const event = await db.event.create({
      data: {
        orgId: org.id,
        userId: org.ownerId,
        serviceId,
        customerId,
        start: startDate,
        end: endDate,
        duration: service.duration,
        title: customer.displayName ?? "",
        notes: notes ?? null,
        allDay: false,
        archived: false,
        status: "pending",
        type: "APPOINTMENT",
        paid: false,
        createdAt: now,
        updatedAt: now,
      },
    })
    return Response.json(serialize(event))
  }

  if (intent === "send_reminder") {
    if (!body.eventId) return Response.json({ error: "eventId required" }, { status: 400 })
    const event = await db.event.findFirst({
      where: { id: body.eventId, orgId: org.id },
      include: { customer: true, service: { include: { org: true } } },
    })
    if (!event || !event.customer?.email || !event.service)
      return Response.json({ error: "Event/customer/service incomplete" }, { status: 404 })
    await sendReminder({ event: event as any, email: event.customer.email })
    return Response.json({ ok: true })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

function serialize(event: any) {
  return {
    id: event.id,
    start: event.start,
    end: event.end,
    duration: Number(event.duration),
    status: event.status,
    attended: event.attended,
    paid: event.paid,
    meetingLink: event.meetingLink,
    videoProvider: event.videoProvider,
    notes: event.notes,
    customer: event.customer && {
      id: event.customer.id,
      displayName: event.customer.displayName,
      email: event.customer.email,
      tel: event.customer.tel,
    },
    service: event.service && {
      id: event.service.id,
      name: event.service.name,
      price: Number(event.service.price),
      duration: Number(event.service.duration),
    },
  }
}
