import type {
  CustomColors,
  Section3,
} from "@easybits.cloud/html-tailwind-generator"
import { buildDeployHtml } from "@easybits.cloud/html-tailwind-generator"
import { Link } from "react-router"
import { ChatWidget } from "~/components/chatbot/ChatWidget"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"
import { Banner } from "~/components/home/Banner"
import { Benefits } from "~/components/home/Benefits"
import { BlogPreview } from "~/components/home/BlogPreview"
import { CompaniesScroll } from "~/components/home/CompaniesScroll"
import { FinalCta } from "~/components/home/FinalCta"
import { Features, Hero, ScrollReviews } from "~/components/home/home"
import { ParallaxHero } from "~/components/home/ParallaxHero"
import { People } from "~/components/icons/people"
import { buildDefaultSections } from "~/lib/default-landing"
import { getMetaTags } from "~/utils/getMetaTags"
import { resolveHostForIndex } from "~/utils/host.server"
import { getPublicImageUrl } from "~/utils/urls"
import type { Route } from "./+types/home"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { checkRateLimit, getClientIP, rateLimitPresets } = await import(
    "~/.server/rateLimit"
  )
  const ip = getClientIP(request)
  const rl = checkRateLimit(`page:${ip}`, rateLimitPresets.pageLoad)
  if (!rl.success) {
    throw new Response("Too many requests", {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
      },
    })
  }

  const resolution = await resolveHostForIndex(request)
  if (resolution.type === "not_found") {
    throw new Response("Empresa no encontrada", { status: 404 })
  }

  // Single source of truth for org landings: render either the published
  // AI sections or the same `buildDefaultSections` output the editor shows.
  if (resolution.type === "org") {
    const { org } = resolution
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
      landingHtml = renderSections(buildDefaultSections(org as any, org.services))
    }
    return { ...resolution, landingHtml }
  }

  return resolution
}

export const meta = ({ data }: Route.MetaArgs) => {
  if (data?.type === "org") {
    const org = data.org
    const slug = org.customDomain || `${org.slug}.denik.me`
    return getMetaTags({
      title: `${org.name} | Agenda tu cita`,
      description: org.description || `Reserva con ${org.name}`,
      url: `https://${slug}`,
      image: getPublicImageUrl(org.logo) || "/cover.png",
    })
  }
  return getMetaTags({
    title: "Deník | Tu agenda en un solo lugar",
    description: "Administra la agenda de tu negocio en un solo lugar",
    image: "https://i.imgur.com/zlnq8Jd.png",
    url: "https://denik.me",
  })
}

export default function Index({ loaderData }: Route.ComponentProps) {
  if (loaderData.type === "org") {
    const { org } = loaderData
    const landingHtml =
      "landingHtml" in loaderData ? (loaderData.landingHtml as string) : ""
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
  return (
    <main className="bg-brand_dark">
      <Link
        to="/signin"
        className="fixed top-0 left-0 right-0 z-50 h-10 flex items-center justify-center bg-brand_dark text-white text-xs md:text-sm font-satoMedium px-4 hover:bg-black transition-colors"
      >
        ✨ Prueba Deník gratis por 30 días — sin tarjeta de crédito
      </Link>
      <div className="bg-white rounded-b-[40px] overflow-x-clip">
        <TopBar withBanner />
        <ParallaxHero>
          <Hero />
          <ScrollReviews />
        </ParallaxHero>
        <Banner />
        <Features />
        <Benefits />
        <CompaniesScroll />
        <BlogPreview />
        <FinalCta>
          <h2 className="group text-4xl lg:text-6xl	font-satoBold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
            <span className="mr-4">Tu agenda. </span>
            <People className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
            <span className="ml-4"> Tus clientes.</span>
          </h2>
          <h2 className="text-4xl lg:text-6xl font-satoBold  text-brand_dark mb-16 leading-normal ">
            Tu negocio.
          </h2>
        </FinalCta>
      </div>
      <Footer />
    </main>
  )
}
