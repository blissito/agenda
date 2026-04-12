import type { Customer, Event, Org, Service } from "@prisma/client"
import { db } from "~/utils/db.server"

// ==================== TYPES ====================

interface GoogleCalendarToken {
  access_token: string
  refresh_token: string
  expires_at: number // Unix timestamp in ms
}

interface CreateMeetParams {
  org: Org
  event: Event
  service: Service
  customer: Customer
}

interface MeetResult {
  meetingLink: string
  calendarEventId: string
  calendarHtmlLink?: string
}

// ==================== GOOGLE AUTH ====================

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events"

export function getGoogleCalendarAuthUrl(
  orgId: string,
  redirectUri: string,
): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: CALENDAR_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state: orgId,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<GoogleCalendarToken> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google token exchange failed: ${text}`)
  }

  const data = await res.json()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<{ access_token: string; expires_at: number }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google token refresh failed: ${text}`)
  }

  const data = await res.json()
  return {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }
}

// ==================== TOKEN HELPER ====================

async function getValidAccessToken(org: Org): Promise<string> {
  const token = org.googleCalendarToken as GoogleCalendarToken | null
  if (!token) throw new Error("Org has no Google Calendar token")

  // Refresh if expiring within 5 minutes
  if (Date.now() > token.expires_at - 5 * 60 * 1000) {
    const refreshed = await refreshAccessToken(token.refresh_token)
    const updated: GoogleCalendarToken = {
      ...token,
      access_token: refreshed.access_token,
      expires_at: refreshed.expires_at,
    }
    await db.org.update({
      where: { id: org.id },
      data: { googleCalendarToken: updated as any },
    })
    return refreshed.access_token
  }

  return token.access_token
}

// ==================== CALENDAR OPERATIONS ====================

export async function createMeetLink({
  org,
  event,
  service,
  customer,
}: CreateMeetParams): Promise<MeetResult> {
  const accessToken = await getValidAccessToken(org)

  const startDate = new Date(event.start)
  const endDate = event.end
    ? new Date(event.end)
    : new Date(startDate.getTime() + Number(event.duration) * 60 * 1000)

  const calendarEvent = {
    summary: `${service.name} - ${customer.displayName}`,
    description: `Cita agendada via Denik\nCliente: ${customer.displayName}\nEmail: ${customer.email}\nTel: ${customer.tel}`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: (org as any).timezone || "America/Mexico_City",
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: (org as any).timezone || "America/Mexico_City",
    },
    conferenceData: {
      createRequest: {
        requestId: event.id,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
    attendees: [{ email: customer.email }],
  }

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(calendarEvent),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google Calendar create event failed: ${text}`)
  }

  const data = await res.json()
  const meetingLink =
    data.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === "video",
    )?.uri || data.hangoutLink

  if (!meetingLink) {
    throw new Error("No meeting link returned from Google Calendar")
  }

  return {
    meetingLink,
    calendarEventId: data.id,
    calendarHtmlLink: data.htmlLink as string | undefined,
  }
}

export async function cancelMeetEvent(
  org: Org,
  calendarEventId: string,
): Promise<void> {
  const accessToken = await getValidAccessToken(org)

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${calendarEventId}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  // 404/410 means already deleted — not an error
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const text = await res.text()
    throw new Error(`Google Calendar delete event failed: ${text}`)
  }
}
