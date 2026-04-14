/**
 * Development/fallback route: /agenda/:orgSlug
 * This route works on localhost where subdomains don't work.
 * Shows the org's public landing page with services list.
 */

import type {
  CustomColors,
  Section3,
} from "@easybits.cloud/html-tailwind-generator"
import { buildDeployHtml } from "@easybits.cloud/html-tailwind-generator"
import { ChatWidget } from "~/components/chatbot/ChatWidget"
import TemplateOne from "~/components/templates/TemplateOne"
import TemplateTwo from "~/components/templates/TemplateTwo"
import { db } from "~/utils/db.server"
import { getMetaTags } from "~/utils/getMetaTags"
import { getPublicImageUrl } from "~/utils/urls"
import type { Route } from "./+types/agenda.$orgSlug._index"

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { orgSlug } = params

  const org = await db.org.findUnique({
    where: { slug: orgSlug },
  })

  if (!org) {
    throw new Response("Organización no encontrada", { status: 404 })
  }

  // If org has a published AI landing, build HTML for iframe rendering
  let aiLandingHtml: string | null = null
  if (org.landingPublished && org.landingSections) {
    try {
      const raw = org.landingSections
      if (!Array.isArray(raw)) throw new Error("Invalid landing sections data")
      const sections = raw as unknown as Section3[]
      aiLandingHtml = buildDeployHtml(
        sections,
        org.landingTheme || undefined,
        org.landingCustomColors as unknown as CustomColors | undefined,
        false,
      ).replace(
        "</head>",
        `<style>@font-face{font-family:'Satoshi ';src:url('https://denik.me/fonts/Satoshi-Regular.ttf') format('truetype');font-display:swap}</style></head>`,
      )
    } catch (err) {
      console.error("Failed to build landing HTML:", err)
    }
  }

  const services = await db.service.findMany({
    where: { orgId: org.id, isActive: true, archived: false },
  })

  return { org, services, aiLandingHtml }
}

export const meta = ({ data }: Route.MetaArgs) => {
  if (data?.org) {
    return getMetaTags({
      title: `${data.org.name} | Agenda tu cita`,
      description: data.org.description || `Reserva con ${data.org.name}`,
      image: getPublicImageUrl(data.org.logo) || "/cover.png",
    })
  }
  return getMetaTags({
    title: "Agenda tu cita",
    description: "Reserva tu cita online",
  })
}

export default function OrgLanding({ loaderData }: Route.ComponentProps) {
  const { org, services, aiLandingHtml } = loaderData

  // AI landing takes priority
  if (aiLandingHtml) {
    const showChatbot =
      org.landingChatbotEnabled !== false &&
      Boolean(org.chatbotAgentId) &&
      Boolean(org.chatbotConfig)
    return (
      <>
        <iframe
          srcDoc={aiLandingHtml}
          style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none" }}
          title="Landing"
        />
        {showChatbot && (
          <ChatWidget
            agentId={org.chatbotAgentId as string}
            config={org.chatbotConfig as any}
          />
        )}
      </>
    )
  }

  // Render template based on org config
  if (org.websiteConfig?.template === "defaultTemplate") {
    return <TemplateOne org={org} services={services} />
  }

  return <TemplateTwo org={org} services={services} />
}
