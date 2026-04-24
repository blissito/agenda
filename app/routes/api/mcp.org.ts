import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { getOrgFromApiKey } from "~/.server/apiKeyAuth"
import { db } from "~/utils/db.server"
import { normalizeWeekDays } from "~/utils/weekDays"

/**
 * GET /api/mcp/org?intent=today
 * GET /api/mcp/org?intent=stats&from=ISO&to=ISO
 * GET /api/mcp/org?intent=get
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const org = await getOrgFromApiKey(request)
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent") ?? "today"

  if (intent === "today") {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return Response.json(await summarize(org.id, start, end))
  }

  if (intent === "stats") {
    const from = url.searchParams.get("from")
    const to = url.searchParams.get("to")
    if (!from || !to)
      return Response.json({ error: "from/to required" }, { status: 400 })
    return Response.json(await summarize(org.id, new Date(from), new Date(to)))
  }

  if (intent === "get") {
    return Response.json(serializeOrg(org))
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

/**
 * POST /api/mcp/org — body JSON con `intent: update`
 * Whitelist: name, description, email, tel, address, timezone, weekDays, logo
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const org = await getOrgFromApiKey(request)
  const body = (await request.json().catch(() => ({}))) as Record<string, any>
  const intent = body.intent as string

  if (intent === "update") {
    const data: Record<string, any> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.description !== undefined) data.description = body.description
    if (body.email !== undefined) data.email = body.email
    if (body.tel !== undefined) data.tel = body.tel
    if (body.address !== undefined) data.address = body.address
    if (body.timezone !== undefined) data.timezone = body.timezone
    if (body.logo !== undefined) data.logo = body.logo
    if (body.weekDays !== undefined)
      data.weekDays = normalizeWeekDays(body.weekDays)
    if (Object.keys(data).length === 0)
      return Response.json({ error: "No fields to update" }, { status: 400 })
    const updated = await db.org.update({
      where: { id: org.id },
      data,
    })
    return Response.json(serializeOrg(updated))
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

function serializeOrg(org: any) {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    description: org.description,
    email: org.email,
    tel: org.tel,
    address: org.address,
    timezone: org.timezone,
    logo: org.logo,
    weekDays: org.weekDays,
    isActive: org.isActive,
    landingPublished: org.landingPublished,
  }
}

async function summarize(orgId: string, from: Date, to: Date) {
  const events = await db.event.findMany({
    where: { orgId, archived: false, start: { gte: from, lt: to } },
    include: { service: true, customer: true },
    orderBy: { start: "asc" },
  })
  const revenue = events
    .filter((e) => e.paid)
    .reduce((sum, e) => sum + (e.service ? Number(e.service.price) : 0), 0)
  const noShows = events.filter((e) => e.attended === false).length
  return {
    range: { from, to },
    total: events.length,
    confirmed: events.filter((e) => e.status === "CONFIRMED").length,
    pending: events.filter((e) => e.status === "pending").length,
    cancelled: events.filter((e) => e.status === "CANCELLED").length,
    attended: events.filter((e) => e.attended === true).length,
    noShows,
    revenue,
    events: events.map((e) => ({
      id: e.id,
      start: e.start,
      status: e.status,
      customer: e.customer?.displayName,
      service: e.service?.name,
    })),
  }
}
