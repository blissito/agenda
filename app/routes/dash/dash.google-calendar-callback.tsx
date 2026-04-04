import { redirect } from "react-router"
import { requireRole } from "~/.server/userGetters"
import { exchangeCodeForTokens } from "~/lib/google-meet.server"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/dash.google-calendar-callback"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await requireRole(request, ["OWNER"])

  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")

  if (error || !code) {
    console.error("Google Calendar OAuth error:", error)
    throw redirect("/dash/ajustes?error=google_calendar_denied")
  }

  const baseUrl = process.env.APP_URL || url.origin
  const redirectUri = `${baseUrl}/dash/google-calendar/callback`

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri)

    await db.org.update({
      where: { id: org.id },
      data: { googleCalendarToken: tokens as any },
    })
  } catch (e) {
    console.error("Google Calendar token exchange error:", e)
    throw redirect("/dash/ajustes?error=google_calendar_failed")
  }

  throw redirect("/dash/ajustes?success=google_calendar_connected")
}

export default function GoogleCalendarCallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p>Conectando Google Calendar...</p>
    </div>
  )
}
