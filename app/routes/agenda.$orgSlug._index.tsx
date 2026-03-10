/**
 * Development/fallback route: /agenda/:orgSlug
 * This route works on localhost where subdomains don't work.
 * Shows the org's public landing page with services list.
 */
import TemplateOne from "~/components/templates/TemplateOne"
import TemplateTwo from "~/components/templates/TemplateTwo"
import { db } from "~/utils/db.server"
import { getMetaTags } from "~/utils/getMetaTags"
import type { Route } from "./+types/agenda.$orgSlug._index"
import { buildDeployHtml } from "@easybits.cloud/html-tailwind-generator"
import type { Section3, CustomColors } from "@easybits.cloud/html-tailwind-generator"

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { orgSlug } = params

  const org = await db.org.findUnique({
    where: { slug: orgSlug },
  })

  if (!org) {
    throw new Response("Organización no encontrada", { status: 404 })
  }

  // If org has a published AI landing, serve it directly as HTML
  if (org.landingPublished && org.landingSections) {
    try {
      const raw = org.landingSections
      if (!Array.isArray(raw)) throw new Error("Invalid landing sections data")
      const sections = raw as unknown as Section3[]
      const html = buildDeployHtml(sections, org.landingTheme || undefined, org.landingCustomColors as unknown as CustomColors | undefined)
      throw new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    } catch (err) {
      console.error("Failed to build landing HTML:", err)
      // Fall through to normal template rendering
    }
  }

  const services = await db.service.findMany({
    where: { orgId: org.id, isActive: true, archived: false },
  })

  return { org, services }
}

export const meta = ({ data }: Route.MetaArgs) => {
  if (data?.org) {
    return getMetaTags({
      title: `${data.org.name} | Agenda tu cita`,
      description: data.org.description || `Reserva con ${data.org.name}`,
    })
  }
  return getMetaTags({
    title: "Agenda tu cita",
    description: "Reserva tu cita online",
  })
}

export default function OrgLanding({ loaderData }: Route.ComponentProps) {
  const { org, services } = loaderData

  // Render template based on org config
  if (org.websiteConfig?.template === "defaultTemplate") {
    return <TemplateOne org={org} services={services} />
  }

  return <TemplateTwo org={org} services={services} />
}
