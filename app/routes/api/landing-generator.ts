import type { ActionFunctionArgs } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { generateOrgLanding, refineOrgLanding } from "~/lib/landing-generator.server"
import { db } from "~/utils/db.server"
import type { Section3 } from "@easybits.cloud/html-tailwind-generator"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const formData = await request.formData()
  const intent = formData.get("intent") as string

  if (intent === "generate") {
    const services = await db.service.findMany({
      where: { orgId: org.id, isActive: true, archived: false },
    })

    const sections = await generateOrgLanding(org, services)
    return Response.json({ sections })
  }

  if (intent === "refine") {
    const currentHtml = formData.get("currentHtml") as string
    const instruction = formData.get("instruction") as string
    const referenceImage = formData.get("referenceImage") as string | undefined

    if (!currentHtml || !instruction) {
      return Response.json({ error: "Missing currentHtml or instruction" }, { status: 400 })
    }

    const html = await refineOrgLanding(currentHtml, instruction, {
      referenceImage: referenceImage || undefined,
    })
    return Response.json({ html })
  }

  if (intent === "save") {
    const sectionsRaw = formData.get("sections") as string
    const theme = formData.get("theme") as string | null
    const publish = formData.get("publish") === "true"

    if (!sectionsRaw) {
      return Response.json({ error: "Missing sections" }, { status: 400 })
    }

    let sections: Section3[]
    try {
      sections = JSON.parse(sectionsRaw)
    } catch {
      return Response.json({ error: "Invalid sections JSON" }, { status: 400 })
    }

    await db.org.update({
      where: { id: org.id },
      data: {
        landingSections: sections as unknown as any,
        landingTheme: theme || undefined,
        landingPublished: publish,
      },
    })

    return Response.json({ ok: true })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}
