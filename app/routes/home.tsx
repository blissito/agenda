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
import { resolveHostForIndex } from "~/utils/host.server"
import { buildDeployHtml } from "@easybits.cloud/html-tailwind-generator"
import type { Section3 } from "@easybits.cloud/html-tailwind-generator"
import type { Route } from "./+types/home"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const resolution = await resolveHostForIndex(request)
  if (resolution.type === "not_found") {
    throw new Response("Empresa no encontrada", { status: 404 })
  }
  // Serve AI-generated landing as raw HTML if published
  if (resolution.type === "org" && resolution.org.landingPublished && resolution.org.landingSections) {
    try {
      const raw = resolution.org.landingSections
      if (!Array.isArray(raw)) throw new Error("Invalid landing sections data")
      const sections = raw as unknown as Section3[]
      const html = buildDeployHtml(sections, resolution.org.landingTheme || undefined)
      throw new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    } catch (err) {
      console.error("Failed to build landing HTML:", err)
      // Fall through to normal rendering
    }
  }
  return resolution
}

export const meta = ({ data }: Route.MetaArgs) => {
  if (data?.type === "org") {
    return getMetaTags({
      title: `${data.org.name} | Agenda tu cita`,
      description: data.org.description || `Reserva con ${data.org.name}`,
    })
  }
  return getMetaTags({
    title: "Deník | Tu agenda en un solo lugar",
    description: "Administra la agenda de tu negocio en un solo lugar",
    image: "https://i.imgur.com/zlnq8Jd.png",
  })
}

export default function Index({ loaderData }: Route.ComponentProps) {
  if (loaderData.type === "org") {
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
          <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
            <span className="mr-4">Tu agenda. </span>
            <People className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
            <span className="ml-4"> Tus clientes.</span>
          </h2>
          <h2 className="text-4xl lg:text-6xl font-bold  text-brand_dark mb-16 leading-normal ">
            Tu negocio.
          </h2>
        </FinalCta>
      </div>
      <Footer />
    </main>
  )
}
