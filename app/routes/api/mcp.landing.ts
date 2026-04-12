import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { getOrgFromApiKey } from "~/.server/apiKeyAuth"
import { refineOrgLanding } from "~/lib/landing-generator.server"
import { db } from "~/utils/db.server"

type Section = {
  id: string
  order: number
  html: string
  label: string
  metadata?: any
}

/**
 * GET /api/mcp/landing?intent=get
 * Devuelve las secciones actuales (sin HTML crudo por default — demasiado texto para un chat).
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const org = await getOrgFromApiKey(request)
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent") ?? "get"
  const includeHtml = url.searchParams.get("includeHtml") === "true"

  if (intent === "get") {
    const fresh = await db.org.findUnique({
      where: { id: org.id },
      select: { landingSections: true, landingPublished: true, landingTheme: true },
    })
    const sections = ((fresh?.landingSections as any) ?? []) as Section[]
    return Response.json({
      published: fresh?.landingPublished ?? false,
      theme: fresh?.landingTheme ?? null,
      sections: sections.map((s) => ({
        id: s.id,
        order: s.order,
        label: s.label,
        type: s.metadata?.type,
        ...(includeHtml ? { html: s.html } : { htmlPreview: s.html?.slice(0, 200) }),
      })),
    })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

/**
 * POST /api/mcp/landing — body JSON
 *   { intent: "refine_section", sectionId, instruction }
 *   { intent: "publish", published?: boolean }
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const org = await getOrgFromApiKey(request)
  const body = (await request.json().catch(() => ({}))) as Record<string, any>
  const intent = body.intent as string

  if (intent === "update_section") {
    const { sectionId, instruction } = body
    if (!sectionId || !instruction)
      return Response.json(
        { error: "sectionId and instruction required" },
        { status: 400 },
      )
    const fresh = await db.org.findUnique({
      where: { id: org.id },
      select: { landingSections: true, landingPublished: true },
    })
    const sections = ((fresh?.landingSections as any) ?? []) as Section[]
    const target = sections.find((s) => s.id === sectionId)
    if (!target) return Response.json({ error: "Section not found" }, { status: 404 })

    const newHtml = await refineOrgLanding(org.id, target.html, instruction)
    const updated = sections.map((s) =>
      s.id === sectionId ? { ...s, html: newHtml } : s,
    )
    // Smart default: preserva estado de publicación actual — si ya estaba live, sigue live.
    await db.org.update({
      where: { id: org.id },
      data: { landingSections: updated as any },
    })
    return Response.json({
      ok: true,
      sectionId,
      live: fresh?.landingPublished ?? false,
      htmlPreview: newHtml.slice(0, 300),
    })
  }

  if (intent === "unpublish") {
    await db.org.update({
      where: { id: org.id },
      data: { landingPublished: false },
    })
    return Response.json({ ok: true, published: false })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}
