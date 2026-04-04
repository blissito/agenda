import { redirect } from "react-router"
import { requireRole } from "~/.server/userGetters"
import { getGoogleCalendarAuthUrl } from "~/lib/google-meet.server"
import type { Route } from "./+types/dash.google-calendar-connect"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await requireRole(request, ["OWNER"])

  const baseUrl = process.env.APP_URL || new URL(request.url).origin
  const redirectUri = `${baseUrl}/dash/google-calendar/callback`

  const authUrl = getGoogleCalendarAuthUrl(org.id, redirectUri)
  throw redirect(authUrl)
}

export default function GoogleCalendarConnect() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p>Redirigiendo a Google...</p>
    </div>
  )
}
