import { redirect } from "react-router"
import { requireRole } from "~/.server/userGetters"
import { getZoomAuthUrl } from "~/lib/zoom.server"
import type { Route } from "./+types/dash.zoom-connect"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await requireRole(request, ["OWNER"])
  const baseUrl = process.env.APP_URL || new URL(request.url).origin
  const redirectUri = `${baseUrl}/dash/zoom/callback`
  const authUrl = getZoomAuthUrl(org.id, redirectUri)
  throw redirect(authUrl)
}
