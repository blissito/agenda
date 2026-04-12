import type { ActionFunctionArgs } from "react-router"
import crypto from "node:crypto"
import { db } from "~/utils/db.server"

// Zoom Webhook
// Docs: https://developers.zoom.us/docs/api/rest/webhook-reference/
//
// Verifies requests using HMAC-SHA256 with ZOOM_WEBHOOK_SECRET.
// Handles:
//   - endpoint.url_validation: responds with encryptedToken (required by Zoom
//     to register the webhook URL)
//   - meeting.participant_joined: marks the matching Event.attended = true
//     the first time a participant joins.
// All other events are ignored.

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const secret = process.env.ZOOM_WEBHOOK_SECRET
  if (!secret) {
    console.error("[Zoom webhook] ZOOM_WEBHOOK_SECRET is not set")
    return new Response("Server misconfigured", { status: 500 })
  }

  const rawBody = await request.text()
  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  // 1) URL validation handshake
  if (payload?.event === "endpoint.url_validation") {
    const plainToken = payload?.payload?.plainToken as string | undefined
    if (!plainToken) {
      return new Response("Missing plainToken", { status: 400 })
    }
    const encryptedToken = crypto
      .createHmac("sha256", secret)
      .update(plainToken)
      .digest("hex")
    return Response.json({ plainToken, encryptedToken })
  }

  // 2) Verify signature for regular events
  const signature = request.headers.get("x-zm-signature") || ""
  const timestamp = request.headers.get("x-zm-request-timestamp") || ""
  const message = `v0:${timestamp}:${rawBody}`
  const expected =
    "v0=" +
    crypto.createHmac("sha256", secret).update(message).digest("hex")

  // timingSafeEqual requires same length
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (
    sigBuf.length !== expBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expBuf)
  ) {
    console.warn("[Zoom webhook] invalid signature")
    return new Response("Invalid signature", { status: 401 })
  }

  // 3) Handle events
  if (payload?.event === "meeting.participant_joined") {
    const meetingId = String(payload?.payload?.object?.id ?? "")
    if (!meetingId) return Response.json({ ok: true })

    const event = await db.event.findFirst({
      where: { zoomMeetingId: meetingId },
      select: { id: true, attended: true },
    })
    if (event && event.attended === null) {
      await db.event.update({
        where: { id: event.id },
        data: { attended: true },
      })
    }
  }

  return Response.json({ ok: true })
}
