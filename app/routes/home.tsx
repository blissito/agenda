import type {
  CustomColors,
  Section3,
} from "@easybits.cloud/html-tailwind-generator"
import { buildDeployHtml } from "@easybits.cloud/html-tailwind-generator"
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
import TemplateOne from "~/components/templates/TemplateOne"
import TemplateTwo from "~/components/templates/TemplateTwo"
import { getMetaTags } from "~/utils/getMetaTags"
import { getPublicImageUrl } from "~/utils/urls"
import { resolveHostForIndex } from "~/utils/host.server"
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
  // Build AI landing HTML if published
  if (
    resolution.type === "org" &&
    resolution.org.landingPublished &&
    resolution.org.landingSections
  ) {
    try {
      const raw = resolution.org.landingSections
      if (!Array.isArray(raw)) throw new Error("Invalid landing sections data")
      const sections = raw as unknown as Section3[]
      const html = buildDeployHtml(
        sections,
        resolution.org.landingTheme || undefined,
        resolution.org.landingCustomColors as unknown as
          | CustomColors
          | undefined,
      )
      return { ...resolution, aiLandingHtml: html }
    } catch (err) {
      console.error("Failed to build landing HTML:", err)
    }
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
    // AI-generated landing takes priority
    if ("aiLandingHtml" in loaderData && loaderData.aiLandingHtml) {
      return (
        <iframe
          srcDoc={loaderData.aiLandingHtml as string}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
          title="Landing"
        />
      )
    }
    const { org } = loaderData
    return org.websiteConfig?.template === "defaultTemplate" ? (
      <TemplateOne org={org} services={org.services} link="" />
    ) : (
      <TemplateTwo org={org} services={org.services} />
    )
  }
  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px]">
        <TopBar />
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
