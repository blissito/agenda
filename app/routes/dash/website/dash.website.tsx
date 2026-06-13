// app/routes/dash.website.tsx
import type { Section3 } from "@easybits.cloud/html-tailwind-generator"
import { buildDeployHtml } from "@easybits.cloud/html-tailwind-generator"
import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { resolveLandingColors } from "~/lib/landing-colors.server"
import { buildDefaultSections } from "~/lib/default-landing"
import { db } from "~/utils/db.server"
import { ConfirmModal } from "~/components/common/ConfirmModal"
import { PrimaryButton } from "~/components/common/primaryButton"
import { Tooltip } from "~/components/common/Tooltip"
import { Edit2 } from "~/components/icons/Edit2"
import { Share } from "~/components/icons/Share"
import { Website as WebsiteIcon } from "~/components/icons/Website"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import { ShareWebsiteModal } from "~/routes/dash/website/ShareWebsiteModal"
import { withExternalLinksFix } from "~/utils/landingHtml"
import { getOrgPublicUrl } from "~/utils/urls"
import type { Route } from "./+types/dash.website"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user, org } = await getUserAndOrgOrRedirect(request, {
    select: {
      id: true,
      ownerId: true,
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
      brandkit: true,
    },
  })

  if (!org) throw new Response("Org not found", { status: 404 })

  const url = getOrgPublicUrl(org.slug, request.url)

  const renderSections = (sections: Section3[]) =>
    buildDeployHtml(
      sections,
      org.landingTheme || undefined,
      resolveLandingColors(org),
      false,
    ).replace(
      "</head>",
      `<style>@font-face{font-family:'Satoshi ';src:url('https://denik.me/fonts/Satoshi-Regular.ttf') format('truetype');font-display:swap}</style></head>`,
    )

  // Build preview HTML from saved AI landing sections OR fall back to the same
  // default template the editor shows (`buildDefaultSections`). We cannot iframe
  // the public subdomain here: that route renders React `TemplateTwo`/`TemplateOne`
  // with a different icon set (`react-icons`) than the editor's Feather SVGs,
  // causing visible drift for orgs that haven't saved/published yet.
  let previewHtml: string | null = null
  if (org.landingSections) {
    try {
      const raw = org.landingSections
      if (!Array.isArray(raw)) throw new Error("Invalid landing sections data")
      previewHtml = renderSections(raw as unknown as Section3[])
    } catch (err) {
      console.error("Failed to build preview HTML:", err)
    }
  }

  if (!previewHtml) {
    const services = await db.service.findMany({
      where: { orgId: org.id, isActive: true, archived: false },
      select: { name: true, slug: true, duration: true, price: true, gallery: true },
      take: 12,
    })
    previewHtml = renderSections(buildDefaultSections(org as any, services))
  }

  // Members ven el sitio en solo-lectura: pueden ver el preview y compartir,
  // pero no editar. canManage = owner de la org activa o rol ADMIN/OWNER.
  const role = (user.role || "").toUpperCase()
  const canManage =
    role === "ADMIN" || role === "OWNER" || org.ownerId === user.id

  return { org, url, previewUrl: null, previewHtml, canManage }
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

// Ancho de diseño desktop del landing (coincide con el `max-width:1280px` que
// usan los contenedores del HTML generado). Renderizamos el iframe a este ancho
// fijo y lo escalamos para que el sitio entre COMPLETO en el panel —sin corte ni
// scroll horizontal— a cualquier ancho de contenedor. El scroll vertical queda
// dentro del iframe (un solo scrollbar). Sin esto, anchos chicos disparan bugs
// de grid del landing (col-span que no colapsa) que desbordan y se cortan.
const PREVIEW_DESIGN_WIDTH = 1280

const ScaledPreview = ({ html }: { html: string }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Nunca escalamos hacia arriba: si el panel supera el ancho de diseño, 1:1 y
  // centrado.
  const scale = box ? Math.min(box.w / PREVIEW_DESIGN_WIDTH, 1) : 1
  const marginLeft =
    box && scale === 1 ? Math.max(0, (box.w - PREVIEW_DESIGN_WIDTH) / 2) : 0

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <iframe
        title="Preview del sitio"
        srcDoc={html}
        className="border-0 block"
        sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        style={{
          width: `${PREVIEW_DESIGN_WIDTH}px`,
          // Alto sin escalar = alto del panel / escala: al aplicar scale() su alto
          // visible iguala al del panel; el resto del landing se ve con el scroll
          // interno del iframe.
          height: box ? `${box.h / scale}px` : "100%",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          marginLeft: `${marginLeft}px`,
          // Evita el flash de layout sin escalar en el primer frame (antes de medir).
          visibility: box ? "visible" : "hidden",
        }}
      />
    </div>
  )
}

export default function Website({ loaderData }: Route.ComponentProps) {
  const { org, url, previewUrl, previewHtml, canManage } = loaderData

  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const [shareOpen, setShareOpen] = useState(false)
  const [editBlockedOpen, setEditBlockedOpen] = useState(false)

  const handleEditClick = (e: React.MouseEvent) => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      e.preventDefault()
      setEditBlockedOpen(true)
    }
  }

  const iframeSrc = useMemo(() => {
    const u = (previewUrl ?? "").trim()
    if (!u) return ""
    if (/^https?:\/\//i.test(u)) return u
    if (/localhost|127\.0\.0\.1/i.test(u)) return `http://${u}`
    return `https://${u}`
  }, [previewUrl])

  const onShare = () => setShareOpen(true)

  return (
    <main
      // Alto exacto = viewport menos el padding vertical del `.dash-content`
      // (sideBar.tsx) en cada breakpoint, para que SOLO el iframe scrollee y el
      // documento no genere un segundo scrollbar:
      //   móvil: pt-6 (24) + pb-[88px] (88) = 112px
      //   md:    pt-6 (24) + pb-6 (24)      = 48px
      //   lg:    pt-10 (40) + pb-10 (40)    = 80px
      // Si cambia ese padding, actualizar estos valores.
      className="w-full flex flex-col max-w-8xl mx-auto overflow-hidden h-[calc(100dvh_-_112px)] md:h-[calc(100dvh_-_48px)] lg:h-[calc(100dvh_-_80px)]"
    >
      <div className="flex items-center justify-between gap-4 pb-4">
        <RouteTitle className="mb-0 md:mb-0 text-2xl md:text-3xl">Sitio web</RouteTitle>

        <div className="flex gap-3">
          <Tooltip label="Ver sitio web" side="bottom">
            <span className="inline-flex">
              <RoundAction as="a" href={url} label="Abrir sitio web">
                <WebsiteIcon className="w-5 h-5" />
              </RoundAction>
            </span>
          </Tooltip>

          <Tooltip label="Compartir" side="bottom">
            <span className="inline-flex">
              <RoundAction label="Compartir" onClick={onShare}>
                <Share className="w-5 h-5" />
              </RoundAction>
            </span>
          </Tooltip>

          {canManage && (
            <Tooltip label="Editar sitio web" side="bottom">
              <Link
                to="/dash/website/ai"
                className="inline-flex"
                onClick={handleEditClick}
              >
                <RoundAction label="Editar sitio web">
                  <Edit2 className="w-5 h-5" />
                </RoundAction>
              </Link>
            </Tooltip>
          )}
        </div>
      </div>

      <section
        // `min-h-0` permite que este hijo flex se encoja dentro del `main` de
        // alto fijo (sin él, el contenido del iframe forzaría overflow del main).
        className="flex-1 min-h-0 rounded-2xl border border-brand_stroke bg-white overflow-hidden"
      >
        {previewHtml ? (
          <ScaledPreview html={withExternalLinksFix(previewHtml)} />
        ) : (
          <iframe
            ref={iframeRef}
            title="Preview del sitio"
            src={iframeSrc}
            className="w-full h-full border-0 block"
            loading="lazy"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
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

      <ConfirmModal
        isOpen={editBlockedOpen}
        onClose={() => setEditBlockedOpen(false)}
        onConfirm={() => setEditBlockedOpen(false)}
        title="Edita tu sitio desde una computadora"
        description="El editor del sitio web está optimizado para pantallas grandes. Inicia sesión en Denik desde tu computadora para continuar editando."
        emoji="💻"
        hideButtons
      >
        <div className="mt-10 flex items-center justify-center">
          <PrimaryButton
            onClick={() => setEditBlockedOpen(false)}
            className="w-[190px] h-12 min-h-12"
          >
            Entendido
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </main>
  )
}
