import { useEffect } from "react"
import { Outlet, useMatches, useNavigation } from "react-router"
import { getUserOrRedirect } from "~/.server/userGetters"
import { Spinner } from "~/components/common/Spinner"
import { InstallAppBanner } from "~/components/pwa/InstallAppBanner"
import { SideBar } from "~/components/sideBar/sideBar"
import { db } from "~/utils/db.server"
import { isBusinessInfoComplete } from "~/utils/onboarding"
import type { Route } from "./+types/dash_layout"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await getUserOrRedirect(request)

  // Completitud del onboarding como verdad de servidor (sin localStorage):
  // info del negocio + visitó sitio + compartió link + ≥1 servicio. Una vez
  // celebrado, corta el camino y evita las queries extra en cada navegación.
  let onboardingComplete = Boolean(user.onboardingCelebratedAt)
  if (!onboardingComplete && user.orgId) {
    const [org, servicesCount] = await Promise.all([
      db.org.findUnique({
        where: { id: user.orgId },
        select: { description: true },
      }),
      db.service.count({ where: { orgId: user.orgId } }),
    ])
    onboardingComplete =
      isBusinessInfoComplete(org) &&
      Boolean(user.onboardingVisitedSiteAt) &&
      Boolean(user.onboardingSharedLinkAt) &&
      servicesCount >= 1
  }

  return { user, onboardingComplete }
}

export default function DashLayout({ loaderData }: Route.ComponentProps) {
  const { user, onboardingComplete } = loaderData
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
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-40">
          <Spinner className="w-10" />
        </div>
      )}
      <Outlet />
      <InstallAppBanner />
    </div>
  )
  if (hideSidebar) return content

  return (
    <SideBar user={user} onboardingCelebrated={onboardingComplete}>
      {content}
    </SideBar>
  )
}
