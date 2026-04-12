import type { ActionFunctionArgs } from "react-router"
import { verifyNanoclawAuth } from "~/lib/nanoclaw.server"
import { db } from "~/utils/db.server"

/**
 * POST /whatsapp/link/callback — recibido desde Nanoclaw tras crear el grupo.
 * Body: { token, groupJid, inviteUrl }
 * Auth: Bearer NANOCLAW_SECRET
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }
  if (!verifyNanoclawAuth(request.headers.get("authorization"))) {
    return new Response("Unauthorized", { status: 401 })
  }

  let body: { token?: string; groupJid?: string; inviteUrl?: string }
  try {
    body = await request.json()
  } catch {
    return new Response("Bad JSON", { status: 400 })
  }

  const { token, groupJid, inviteUrl } = body
  if (!token || !groupJid || !inviteUrl) {
    return new Response("Missing token/groupJid/inviteUrl", { status: 400 })
  }

  const link = await db.whatsAppLink.findUnique({ where: { token } })
  if (!link) {
    return new Response("Token not found", { status: 404 })
  }

  await db.whatsAppLink.update({
    where: { id: link.id },
    data: { groupJid, inviteUrl, status: "provisioned" },
  })

  return Response.json({ ok: true })
}

export const loader = () => new Response("Method not allowed", { status: 405 })
