import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { getOrgFromApiKey } from "~/.server/apiKeyAuth"
import { db } from "~/utils/db.server"

/**
 * GET /api/mcp/customers?intent=find&q=...
 * GET /api/mcp/customers?intent=get&customerId=...
 * GET /api/mcp/customers?intent=appointments&customerId=...
 * GET /api/mcp/customers?intent=points&customerId=...
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const org = await getOrgFromApiKey(request)
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent") ?? "find"

  if (intent === "list") {
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100)
    const offset = Number(url.searchParams.get("offset") ?? 0)
    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where: { orgId: org.id },
        orderBy: { displayName: "asc" },
        take: limit,
        skip: offset,
      }),
      db.customer.count({ where: { orgId: org.id } }),
    ])
    return Response.json({
      total,
      offset,
      limit,
      hasMore: offset + customers.length < total,
      customers: customers.map(serializeCustomer),
    })
  }

  if (intent === "find") {
    const q = url.searchParams.get("q")?.trim() ?? ""
    if (!q) return Response.json([])
    const customers = await db.customer.findMany({
      where: {
        orgId: org.id,
        OR: [
          { displayName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { tel: { contains: q } },
        ],
      },
      take: 20,
      orderBy: { displayName: "asc" },
    })
    return Response.json(customers.map(serializeCustomer))
  }

  if (intent === "get") {
    const customerId = url.searchParams.get("customerId")
    if (!customerId)
      return Response.json({ error: "customerId required" }, { status: 400 })
    const customer = await db.customer.findFirst({
      where: { id: customerId, orgId: org.id },
    })
    if (!customer) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json(serializeCustomer(customer))
  }

  if (intent === "appointments") {
    const customerId = url.searchParams.get("customerId")
    if (!customerId)
      return Response.json({ error: "customerId required" }, { status: 400 })
    const events = await db.event.findMany({
      where: { orgId: org.id, customerId, archived: false },
      include: { service: true },
      orderBy: { start: "desc" },
      take: 50,
    })
    return Response.json(
      events.map((e) => ({
        id: e.id,
        start: e.start,
        end: e.end,
        status: e.status,
        attended: e.attended,
        paid: e.paid,
        service: e.service && {
          id: e.service.id,
          name: e.service.name,
          points: Number(e.service.points),
        },
      })),
    )
  }

  if (intent === "points") {
    const customerId = url.searchParams.get("customerId")
    if (!customerId)
      return Response.json({ error: "customerId required" }, { status: 400 })
    // Cálculo en vivo (ver TODO loyalty en CLAUDE.md: los campos en DB están en 0)
    const pastEvents = await db.event.findMany({
      where: {
        orgId: org.id,
        customerId,
        archived: false,
        attended: true,
        end: { lt: new Date() },
      },
      include: { service: true },
    })
    const points = pastEvents.reduce(
      (sum, e) => sum + (e.service ? Number(e.service.points) : 0),
      0,
    )
    return Response.json({ points, eventsCount: pastEvents.length })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

/**
 * POST /api/mcp/customers — body JSON con `intent`: create | update
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const org = await getOrgFromApiKey(request)
  const body = (await request.json().catch(() => ({}))) as Record<string, any>
  const intent = body.intent as string

  if (intent === "create") {
    const { displayName, email, tel, notes } = body
    if (!displayName)
      return Response.json({ error: "displayName required" }, { status: 400 })
    // Evitar duplicados por email dentro de la misma org
    if (email) {
      const exists = await db.customer.findFirst({
        where: { orgId: org.id, email },
      })
      if (exists) return Response.json(serializeCustomer(exists))
    }
    const now = new Date()
    const customer = await db.customer.create({
      data: {
        orgId: org.id,
        displayName,
        email: email ?? "",
        tel: tel ?? "",
        comments: notes ?? "",
        createdAt: now,
        updatedAt: now,
      },
    })
    return Response.json(serializeCustomer(customer))
  }

  if (intent === "update") {
    const { customerId, displayName, email, tel, notes } = body
    if (!customerId)
      return Response.json({ error: "customerId required" }, { status: 400 })
    const existing = await db.customer.findFirst({
      where: { id: customerId, orgId: org.id },
    })
    if (!existing) return Response.json({ error: "Not found" }, { status: 404 })
    // Si cambia el email, verificar que no colisione con otro customer de la misma org
    if (email && email !== existing.email) {
      const dup = await db.customer.findFirst({
        where: { orgId: org.id, email, id: { not: customerId } },
      })
      if (dup)
        return Response.json(
          { error: "Email ya usado por otro cliente" },
          { status: 409 },
        )
    }
    const data: Record<string, any> = { updatedAt: new Date() }
    if (displayName !== undefined) data.displayName = displayName
    if (email !== undefined) data.email = email
    if (tel !== undefined) data.tel = tel
    if (notes !== undefined) data.comments = notes
    const updated = await db.customer.update({
      where: { id: customerId },
      data,
    })
    return Response.json(serializeCustomer(updated))
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

function serializeCustomer(c: any) {
  return {
    id: c.id,
    displayName: c.displayName,
    email: c.email,
    tel: c.tel,
    notes: c.comments,
  }
}
