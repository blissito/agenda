// app/routes/dash.website.tsx
import * as React from "react"
import { useMemo, useRef, useState } from "react"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { Link } from "react-router"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import { getOrgPublicUrl } from "~/utils/urls"
import type { Route } from "./+types/dash.website"
import { TemplateFormModal } from "~/components/ui/dialog"

import { Website as WebsiteIcon } from "~/components/icons/Website"
import { Share } from "~/components/icons/Share"
import { Edit2 } from "~/components/icons/Edit2"

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
    },
  })

  if (!org) throw new Response("Org not found", { status: 404 })

  const url = getOrgPublicUrl(org.slug, request.url)

  // preview: just embed mode (AI landing or template, whichever is active)
  const previewUrlObj = new URL(url)
  previewUrlObj.searchParams.set("embed", "1")
  const previewUrl = previewUrlObj.toString()

  return { org, url, previewUrl }
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
  const { org, url, previewUrl } = loaderData

  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const [shared, setShared] = useState(false)

  const iframeSrc = useMemo(() => {
    const u = (previewUrl ?? "").trim()
    if (!u) return ""
    if (/^https?:\/\//i.test(u)) return u
    if (/localhost|127\.0\.0\.1/i.test(u)) return `http://${u}`
    return `https://${u}`
  }, [previewUrl])

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: org.name ?? "Sitio web", url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShared(true)
      window.setTimeout(() => setShared(false), 1200)
    } catch {
      // no rompemos navegación
    }
  }

  return (
    <main className="w-full h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between gap-4 pb-4">
          <RouteTitle className="mb-0">Sitio web</RouteTitle>

          <div className="flex gap-3">
            <Link
              to="/dash/website/ai"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg text-sm"
            >
              <span>&#10024;</span>
              Generar con IA
            </Link>

            <RoundAction as="a" href={url} label="Abrir sitio web">
              <WebsiteIcon className="w-5 h-5" />
            </RoundAction>

            <RoundAction label="Compartir" onClick={onShare}>
              <Share className="w-5 h-5" />
            </RoundAction>

            <TemplateFormModal
              org={org}
              trigger={
                <RoundAction label="Editar sitio web">
                  <Edit2 className="w-5 h-5" />
                </RoundAction>
              }
            />
          </div>
        </div>
        <section className="flex-1 rounded-2xl border border-brand_stroke bg-white overflow-hidden">
          <iframe
            ref={iframeRef}
            title="Preview del sitio"
            src={iframeSrc}
            className="w-full h-full border-0 block"
            loading="lazy"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </section>
    </main>
  )
}