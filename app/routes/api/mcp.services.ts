import type { LoaderFunctionArgs } from "react-router"
import { getOrgFromApiKey } from "~/.server/apiKeyAuth"
import { db } from "~/utils/db.server"
import { getServicePublicUrl } from "~/utils/urls"

/**
 * GET /api/mcp/services?intent=list
 * GET /api/mcp/services?intent=public_url&serviceId=...
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const org = await getOrgFromApiKey(request)
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent") ?? "list"

  if (intent === "list") {
    const services = await db.service.findMany({
      where: { orgId: org.id, archived: false },
      orderBy: { name: "asc" },
    })
    return Response.json(
      services.map((s) => ({
        id: s.id,
        name: s.name,
        slug: (s as any).slug,
        description: s.description,
        price: Number(s.price),
        currency: s.currency,
        duration: Number(s.duration),
        isActive: s.isActive,
        points: Number(s.points),
        videoProvider: (s as any).videoProvider,
      })),
    )
  }

  if (intent === "public_url") {
    const serviceId = url.searchParams.get("serviceId")
    if (!serviceId) return Response.json({ error: "serviceId required" }, { status: 400 })
    const service = await db.service.findFirst({
      where: { id: serviceId, orgId: org.id },
    })
    if (!service) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json({
      url: getServicePublicUrl(org.slug, (service as any).slug),
    })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}
