import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import { db } from "~/utils/db.server"
import { getQRImageURL } from "~/utils/getQR"
import { getPutFileUrl, removeFileUrl } from "~/utils/lib/tigris.server"
import { getOrgPublicUrl } from "~/utils/urls"
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
      shopKeeper: true,
      description: true,
      address: true,
      lat: true,
      lng: true,
      logo: true,
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
  const agendaUrl = getOrgPublicUrl(org.slug, request.url)
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

  // Logo upload URLs (optional - requires AWS credentials)
  let logoAction = null
  try {
    const logoKey = `logos/${org.id}`
    const putUrl = await getPutFileUrl(logoKey)
    const removeUrl = await removeFileUrl(logoKey)
    // Use saved logo from DB if exists, otherwise use the expected key
    const savedLogoKey = org.logo || logoKey
    logoAction = {
      putUrl,
      removeUrl,
      readUrl: org.logo ? `/api/images?key=${savedLogoKey}` : undefined,
      logoKey,
    }
  } catch (error) {
    console.warn(
      "Logo upload error:",
      error instanceof Error ? error.message : error,
    )
  }

  return { url: agendaUrl, qr, org, services, logoAction }
}

export default function Website({ loaderData }: Route.ComponentProps) {
  const { url, qr, org, services, logoAction } = loaderData
  return (
    <main className=" ">
      <RouteTitle>Mi sitio web</RouteTitle>
      <section className=" grid grid-cols-6 gap-6">
        <Template org={org} url={url} qr={qr} />
        <CompanyInfo org={org} services={services} logoAction={logoAction} />
      </section>
    </main>
  )
}
