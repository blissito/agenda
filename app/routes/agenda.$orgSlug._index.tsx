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
import { buildDefaultSections } from "~/lib/default-landing"
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

  const services = await db.service.findMany({
    where: { orgId: org.id, isActive: true, archived: false },
  })

  const renderSections = (sections: Section3[]) =>
    buildDeployHtml(
      sections,
      org.landingTheme || undefined,
      org.landingCustomColors as unknown as CustomColors | undefined,
      false,
    ).replace(
      "</head>",
      `<style>@font-face{font-family:'Satoshi ';src:url('https://denik.me/fonts/Satoshi-Regular.ttf') format('truetype');font-display:swap}</style></head>`,
    )

  // Single source of truth: published sections if any, otherwise the same
  // default template the editor/preview show (`buildDefaultSections`).
  let landingHtml: string | null = null
  if (org.landingPublished && Array.isArray(org.landingSections)) {
    try {
      landingHtml = renderSections(
        org.landingSections as unknown as Section3[],
      )
    } catch (err) {
      console.error("Failed to build landing HTML:", err)
    }
  }
  if (!landingHtml) {
    landingHtml = renderSections(buildDefaultSections(org as any, services))
  }

  return { org, services, landingHtml }
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
  const { org, landingHtml } = loaderData

  const showChatbot =
    org.landingChatbotEnabled !== false &&
    Boolean(org.chatbotAgentId) &&
    Boolean(org.chatbotConfig)

  return (
    <>
      <iframe
        srcDoc={landingHtml}
        sandbox="allow-forms allow-scripts allow-popups allow-top-navigation-by-user-activation"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
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
