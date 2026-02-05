import { Outlet, useNavigation } from "react-router"
import { getUserOrRedirect } from "~/.server/userGetters"
import { SideBar } from "~/components/sideBar/sideBar"
import { Spinner } from "~/components/common/Spinner"
import type { Route } from "./+types/dash_layout"

export const loader = async ({ request }: Route.LoaderArgs) => {
  return {
    user: await getUserOrRedirect(request),
  }
}

export default function DashLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData
  const navigation = useNavigation()
  const isNavigating = Boolean(navigation.location)

  return (
    <SideBar user={user}>
      <div className="relative h-full">
        {isNavigating && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-40">
            <Spinner className="w-10" />
          </div>
        )}
        <Outlet />
      </div>
    </SideBar>
  )
}
