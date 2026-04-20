import type { Customer, Event, Org, Service } from "@prisma/client"
import { db } from "~/utils/db.server"

// ==================== TYPES ====================

interface ZoomToken {
  access_token: string
  refresh_token: string
  expires_at: number // Unix timestamp in ms
}

interface CreateZoomParams {
  org: Org
  event: Event
  service: Service
  customer: Customer
}

interface ZoomResult {
  meetingLink: string
  meetingId: string
}

// ==================== ZOOM AUTH ====================

const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID!
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET!
const ZOOM_AUTH_URL = "https://zoom.us/oauth/authorize"
const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token"

export function getZoomAuthUrl(orgId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: ZOOM_CLIENT_ID,
    redirect_uri: redirectUri,
    state: orgId,
  })
  return `${ZOOM_AUTH_URL}?${params.toString()}`
}

export async function exchangeZoomCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<ZoomToken> {
  const credentials = Buffer.from(
    `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`,
  ).toString("base64")
  const res = await fetch(ZOOM_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  })
  if (!res.ok)
    throw new Error(`Zoom token exchange failed: ${await res.text()}`)
  const data = await res.json()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }
}

async function refreshZoomAccessToken(
  refreshToken: string,
): Promise<{ access_token: string; expires_at: number }> {
  const credentials = Buffer.from(
    `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`,
  ).toString("base64")
  const res = await fetch(ZOOM_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) throw new Error(`Zoom token refresh failed: ${await res.text()}`)
  const data = await res.json()
  return {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }
}

// ==================== TOKEN HELPER ====================

async function getValidZoomAccessToken(org: Org): Promise<string> {
  const token = org.zoomToken as ZoomToken | null
  if (!token) throw new Error("Org has no Zoom token")

  // Refresh if expiring within 5 minutes
  if (Date.now() > token.expires_at - 5 * 60 * 1000) {
    const refreshed = await refreshZoomAccessToken(token.refresh_token)
    const updated: ZoomToken = {
      ...token,
      access_token: refreshed.access_token,
      expires_at: refreshed.expires_at,
    }
    await db.org.update({
      where: { id: org.id },
      data: { zoomToken: updated as any },
    })
    return refreshed.access_token
  }

  return token.access_token
}

// ==================== MEETING OPERATIONS ====================

export async function createZoomMeeting({
  org,
  event,
  service,
  customer,
}: CreateZoomParams): Promise<ZoomResult> {
  const accessToken = await getValidZoomAccessToken(org)

  const startDate = new Date(event.start)
  const durationMinutes = Math.round(Number(event.duration))
  const timezone = (org as any).timezone || "America/Mexico_City"

  // Zoom: si start_time termina en "Z" (UTC), ignora el timezone param.
  // Hay que mandar LOCAL time sin Z, formateado en el timezone de la org.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(startDate)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value
      return acc
    }, {})
  const localStart = `${parts.year}-${parts.month}-${parts.day}T${parts.hour === "24" ? "00" : parts.hour}:${parts.minute}:${parts.second}`

  const body = {
    topic: `${service.name} - ${customer.displayName}`,
    type: 2, // Scheduled meeting
    start_time: localStart,
    duration: durationMinutes,
    timezone,
    settings: {
      join_before_host: true,
    },
  }

  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Zoom create meeting failed: ${text}`)
  }

  const data = await res.json()
  return {
    meetingLink: data.join_url,
    meetingId: String(data.id),
  }
}

export async function cancelZoomMeeting(
  org: Org,
  meetingId: string,
): Promise<void> {
  const accessToken = await getValidZoomAccessToken(org)

  const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  // 404 means already deleted — not an error
  if (!res.ok && res.status !== 404) {
    const text = await res.text()
    throw new Error(`Zoom delete meeting failed: ${text}`)
  }
}
