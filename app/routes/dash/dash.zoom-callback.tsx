import { redirect } from "react-router"
import { requireRole } from "~/.server/userGetters"
import { exchangeZoomCodeForTokens } from "~/lib/zoom.server"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/dash.zoom-callback"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await requireRole(request, ["OWNER"])
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  if (!code) throw redirect("/dash/ajustes?tab=integraciones&error=no_code")

  const baseUrl = process.env.APP_URL || url.origin
  const redirectUri = `${baseUrl}/dash/zoom/callback`

  const token = await exchangeZoomCodeForTokens(code, redirectUri)
  await db.org.update({
    where: { id: org.id },
    data: { zoomToken: token as any },
  })
  throw redirect("/dash/ajustes?tab=integraciones")
}
