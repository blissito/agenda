import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import { db } from "~/utils/db.server"
import { getQRImageURL } from "~/utils/getQR"
import type { Route } from "./+types/dash.website"
import { CompanyInfo } from "./CompanyInfo"
import { Template } from "./Template"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request, {
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      description: true,
      address: true,
      social: true,
      websiteConfig: true,
      weekDays: true,
      customDomain: true,
      customDomainStatus: true,
      customDomainDns: true,
    },
  })
  if (!org) {
    throw new Response("Org not found", { status: 404 })
  }
  const agendaUrl = `https://${org.slug}.denik.me`
  const qr = await getQRImageURL(agendaUrl)
  const services = await db.service.findMany({
    where: { orgId: org.id, archived: false },
    select: {
      id: true,
      name: true,
      photoURL: true,
      slug: true,
      isActive: true,
    },
  })
  return { url: agendaUrl, qr, org, services }
}

export default function Website({ loaderData }: Route.ComponentProps) {
  const { url, qr, org, services } = loaderData
  return (
    <main className=" ">
      <RouteTitle>Mi sitio web</RouteTitle>
      <section className=" grid grid-cols-6 gap-6">
        <Template org={org} url={url} qr={qr} />
        <CompanyInfo org={org} services={services} />
      </section>
    </main>
  )
}
