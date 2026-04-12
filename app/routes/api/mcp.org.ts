import type { LoaderFunctionArgs } from "react-router"
import { getOrgFromApiKey } from "~/.server/apiKeyAuth"
import { db } from "~/utils/db.server"

/**
 * GET /api/mcp/org?intent=today
 * GET /api/mcp/org?intent=stats&from=ISO&to=ISO
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
    if (!from || !to) return Response.json({ error: "from/to required" }, { status: 400 })
    return Response.json(await summarize(org.id, new Date(from), new Date(to)))
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
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
