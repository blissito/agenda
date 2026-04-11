// app/routes/dash.website.tsx
import type {
  CustomColors,
  Section3,
} from "@easybits.cloud/html-tailwind-generator"
import { buildDeployHtml } from "@easybits.cloud/html-tailwind-generator"
import * as React from "react"
import { useMemo, useRef, useState } from "react"
import { Link } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { Edit2 } from "~/components/icons/Edit2"
import { Share } from "~/components/icons/Share"
import { Website as WebsiteIcon } from "~/components/icons/Website"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import { TemplateFormModal } from "~/components/ui/dialog"
import { ShareWebsiteModal } from "~/routes/dash/website/ShareWebsiteModal"
import { getOrgPublicUrl } from "~/utils/urls"
import type { Route } from "./+types/dash.website"

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
      social: true,
      websiteConfig: true,
      weekDays: true,
      customDomain: true,
      customDomainStatus: true,
      customDomainDns: true,
      landingPublished: true,
      landingSections: true,
      landingTheme: true,
      landingCustomColors: true,
    },
  })

  if (!org) throw new Response("Org not found", { status: 404 })

  const url = getOrgPublicUrl(org.slug, request.url)

  // Build preview HTML from AI landing sections (no network request needed)
  let previewHtml: string | null = null
  if (org.landingSections) {
    try {
      const raw = org.landingSections
      if (!Array.isArray(raw)) throw new Error("Invalid landing sections data")
      const sections = raw as unknown as Section3[]
      previewHtml = buildDeployHtml(
        sections,
        org.landingTheme || undefined,
        org.landingCustomColors as unknown as CustomColors | undefined,
      )
    } catch (err) {
      console.error("Failed to build preview HTML:", err)
    }
  }

  // Fallback: subdomain URL for orgs without AI landing
  let previewUrl: string | null = null
  if (!previewHtml) {
    const previewUrlObj = new URL(url)
    previewUrlObj.searchParams.set("embed", "1")
    previewUrlObj.searchParams.set("t", String(Date.now()))
    previewUrl = previewUrlObj.toString()
  }

  return { org, url, previewUrl, previewHtml }
}

type RoundActionProps =
  | {
      as?: "button"
      onClick?: () => void
      href?: never
      label: string
      title?: string
      children: React.ReactNode
      className?: string
    }
  | {
      as: "a"
      href: string
      onClick?: never
      label: string
      title?: string
      children: React.ReactNode
      className?: string
    }

const RoundAction = (props: RoundActionProps) => {
  const base =
    "w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-sm border border-brand_stroke flex items-center justify-center transition"

  const common = {
    className: props.className ? `${base} ${props.className}` : base,
    "aria-label": props.label,
    title: props.title ?? props.label,
  }

  if (props.as === "a") {
    return (
      <a {...common} href={props.href} target="_blank" rel="noreferrer">
        {props.children}
      </a>
    )
  }

  return (
    <button {...common} type="button" onClick={props.onClick}>
      {props.children}
    </button>
  )
}

export default function Website({ loaderData }: Route.ComponentProps) {
  const { org, url, previewUrl, previewHtml } = loaderData

  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const [shareOpen, setShareOpen] = useState(false)

  const iframeSrc = useMemo(() => {
    const u = (previewUrl ?? "").trim()
    if (!u) return ""
    if (/^https?:\/\//i.test(u)) return u
    if (/localhost|127\.0\.0\.1/i.test(u)) return `http://${u}`
    return `https://${u}`
  }, [previewUrl])

  const onShare = () => setShareOpen(true)

  return (
    <main className="w-full h-full flex flex-col max-w-8xl mx-auto overflow-hidden">
      <div className="flex items-center justify-between gap-4 pb-4">
        <RouteTitle className="mb-0">Sitio web</RouteTitle>

        <div className="flex gap-3">
          <Link
            to="/dash/website/ai"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg text-sm"
          >
            <span>&#10024;</span>
            Editar con IA
          </Link>

          <RoundAction as="a" href={url} label="Abrir sitio web">
            <WebsiteIcon className="w-5 h-5" />
          </RoundAction>

          <RoundAction label="Compartir" onClick={onShare}>
            <Share className="w-5 h-5" />
          </RoundAction>

          <Link to="/dash/website/ai">
            <RoundAction label="Editar sitio web">
              <Edit2 className="w-5 h-5" />
            </RoundAction>
          </Link>
        </div>
      </div>

      <section className="flex-1 rounded-2xl border border-brand_stroke bg-white overflow-hidden">
        {previewHtml ? (
          <iframe
            ref={iframeRef}
            title="Preview del sitio"
            srcDoc={previewHtml}
            className="w-full h-full border-0 block"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
          />
        ) : (
          <iframe
            ref={iframeRef}
            title="Preview del sitio"
            src={iframeSrc}
            className="w-full h-full border-0 block"
            loading="lazy"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </section>

      <ShareWebsiteModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={url}
        orgName={org?.name}
        orgSlug={org?.slug}
      />
    </main>
  )
}
