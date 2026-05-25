import { useEffect } from "react"
import { Outlet, useMatches, useNavigation } from "react-router"
import { getUserOrRedirect } from "~/.server/userGetters"
import { Spinner } from "~/components/common/Spinner"
import { InstallAppBanner } from "~/components/pwa/InstallAppBanner"
import { SideBar } from "~/components/sideBar/sideBar"
import type { Route } from "./+types/dash_layout"

export const loader = async ({ request }: Route.LoaderArgs) => {
  return {
    user: await getUserOrRedirect(request),
  }
}

export default function DashLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData
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
    <SideBar
      user={user}
      onboardingCelebrated={Boolean(user.onboardingCelebratedAt)}
    >
      {content}
    </SideBar>
  )
}
