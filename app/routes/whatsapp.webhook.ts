/**
 * Callback de nanoclaw: POST { jid, text }
 *
 * Nanoclaw tiene WEBHOOK_CALLBACK_URL=https://www.denik.me/whatsapp/webhook
 * y nos POSTea con Authorization: Bearer {NANOCLAW_SECRET}.
 */
import type { ActionFunctionArgs } from "react-router"
import {
  jidToOrgId,
  saveAssistantMessage,
  verifyNanoclawAuth,
} from "~/lib/nanoclaw.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  if (!verifyNanoclawAuth(request.headers.get("authorization"))) {
    return new Response("Unauthorized", { status: 401 })
  }

  let body: { jid?: string; text?: string }
  try {
    body = await request.json()
  } catch {
    return new Response("Bad JSON", { status: 400 })
  }

  const { jid, text } = body
  if (!jid || !text) {
    return new Response("Missing jid or text", { status: 400 })
  }

  const orgId = jidToOrgId(jid)
  if (!orgId) {
    return new Response("JID no pertenece a Denik", { status: 400 })
  }

  await saveAssistantMessage(orgId, text)
  return Response.json({ ok: true })
}

export const loader = () => new Response("Method not allowed", { status: 405 })
