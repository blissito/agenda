import { useEffect } from "react"
import { Outlet, redirect, useMatches, useNavigation } from "react-router"
import { getUserOrRedirect } from "~/.server/userGetters"
import { Spinner } from "~/components/common/Spinner"
import { InstallAppBanner } from "~/components/pwa/InstallAppBanner"
import { SideBar } from "~/components/sideBar/sideBar"
import { readSidebarOpenCookie } from "~/components/hooks/useSidebarState"
import { listBranches } from "~/lib/branches.server"
import { getSession } from "~/sessions"
import { db } from "~/utils/db.server"
import { isBusinessInfoComplete } from "~/utils/onboarding"
import type { Route } from "./+types/dash_layout"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await getUserOrRedirect(request)

  // Orgs a las que pertenece el usuario (para el switcher de la sidebar).
  // orgId es la org activa; orgIds la membresía completa (OR para datos legacy).
  const orgIds = Array.from(
    new Set([...(user.orgIds ?? []), user.orgId].filter(Boolean) as string[]),
  )
  const orgs = orgIds.length
    ? await db.org.findMany({
        where: { id: { in: orgIds } },
        select: {
          id: true,
          name: true,
          logo: true,
          slug: true,
          ownerId: true,
          description: true,
          defaultBranchId: true,
        },
      })
    : []
  const activeOrg = orgs.find((o) => o.id === user.orgId) ?? orgs[0] ?? null

  // Sucursales de la org activa + filtro de sede. null = "Todas las sucursales"
  // (agregado), que es el default. Solo hay sede activa si la sesión la fijó.
  const branches = activeOrg ? await listBranches(activeOrg.id) : []
  const session = await getSession(request.headers.get("Cookie"))
  const sessionBranchId = session.get("activeBranchId")
  const activeBranchId =
    sessionBranchId && branches.some((b) => b.id === sessionBranchId)
      ? sessionBranchId
      : null

  // ¿Puede gestionar el negocio? Owner de la org activa o rol ADMIN/OWNER.
  // (El rol es global en User.role; la propiedad es por org via ownerId.)
  const role = (user.role || "").toUpperCase()
  const canManage =
    role === "ADMIN" ||
    role === "OWNER" ||
    (activeOrg ? activeOrg.ownerId === user.id : false)

  // Bloqueo centralizado por URL: un MEMBER no entra a estas secciones (además
  // de ocultarlas del menú). El loader del layout corre en cada navegación.
  const RESTRICTED_PREFIXES = [
    "/dash/ajustes",
    "/dash/ventas",
    "/dash/servicios",
    // El preview del sitio (/dash/website) es visible para members; solo el
    // editor con IA (/dash/website/ai) queda bloqueado a OWNER/ADMIN.
    "/dash/website/ai",
    "/dash/asistente",
  ]
  const { pathname } = new URL(request.url)
  if (
    !canManage &&
    RESTRICTED_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    throw redirect("/dash?error=unauthorized")
  }

  // Completitud del onboarding como verdad de servidor (sin localStorage):
  // info del negocio + visitó sitio + compartió link + ≥1 servicio. Una vez
  // celebrado, corta el camino y evita las queries extra en cada navegación.
  let onboardingComplete = Boolean(user.onboardingCelebratedAt)
  if (!onboardingComplete && activeOrg) {
    const servicesCount = await db.service.count({
      where: { orgId: activeOrg.id },
    })
    onboardingComplete =
      isBusinessInfoComplete(activeOrg) &&
      Boolean(user.onboardingVisitedSiteAt) &&
      Boolean(user.onboardingSharedLinkAt) &&
      servicesCount >= 1
  }

  // No mandamos `description`/`ownerId` al cliente (solo se usan en el server).
  const toLite = (o: (typeof orgs)[number]) => ({
    id: o.id,
    name: o.name,
    logo: o.logo,
    slug: o.slug,
  })
  return {
    user,
    onboardingComplete,
    canManage,
    orgs: orgs.map(toLite),
    activeOrg: activeOrg ? toLite(activeOrg) : null,
    branches: branches.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      isActive: b.isActive,
      isDefault: b.isDefault,
    })),
    activeBranchId,
    // Estado del sidebar leído de la cookie → el HTML inicial ya viene con el
    // ancho correcto (sin flash al refrescar).
    sidebarOpen: readSidebarOpenCookie(request),
  }
}

export default function DashLayout({ loaderData }: Route.ComponentProps) {
  const {
    user,
    onboardingComplete,
    canManage,
    orgs,
    activeOrg,
    branches,
    activeBranchId,
    sidebarOpen,
  } = loaderData
  const navigation = useNavigation()

  // PWA: registra el SW stub acotado a /dash (no toca booking público ni
  // landings de orgs, que viven en otros orígenes/subdominios). El scope va
  // SIN slash final porque el dash index resuelve en /dash. updateViaCache:
  // "none" fuerza revalidación para que Fase 2 (vite-plugin-pwa) lo reemplace.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker
      .register("/sw.js", { scope: "/dash", updateViaCache: "none" })
      .catch(() => {})
  }, [])
  const isPostSaveNav = navigation.location?.search?.includes("saved=")
  const isNavigating = Boolean(navigation.location) && !isPostSaveNav

  const matches = useMatches()
  const hideSidebar = matches.some(
    (m) => (m.handle as any)?.hideSidebar === true,
  )

  const content = (
    <div className="relative h-full">
      {isNavigating && (
        <div className="absolute inset-0 bg-brand_light_gray/80 flex items-center justify-center z-40">
          <Spinner className="w-10" />
        </div>
      )}
      <Outlet />
      <InstallAppBanner />
    </div>
  )
  if (hideSidebar) return content

  return (
    <SideBar
      user={user}
      orgs={orgs}
      activeOrg={activeOrg}
      branches={branches}
      activeBranchId={activeBranchId}
      canManage={canManage}
      onboardingCelebrated={onboardingComplete}
      sidebarOpen={sidebarOpen}
    >
      {content}
    </SideBar>
  )
}
