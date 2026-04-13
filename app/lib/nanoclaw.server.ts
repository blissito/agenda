/**
 * Nanoclaw webhook channel client.
 *
 * Nanoclaw exposes a WebhookChannel (src/channels/webhook.ts en el repo de nanoclaw):
 *   - Inbound:  POST {NANOCLAW_URL}/message   { jid, sender, sender_name, content }
 *   - Outbound: nanoclaw hace POST a WEBHOOK_CALLBACK_URL con { jid, text }
 *
 * Denik actúa como plataforma: usa jid = webhook_denik_{orgId} para
 * mantener una memoria/grupo aislado por org en nanoclaw.
 */
import { db } from "~/utils/db.server";

const NANOCLAW_URL = process.env.NANOCLAW_URL || "";
const NANOCLAW_SECRET = process.env.NANOCLAW_SECRET || "";

export const JID_PREFIX = "webhook_denik_";

export function orgIdToJid(orgId: string): string {
  return `${JID_PREFIX}${orgId}`;
}

export function jidToOrgId(jid: string): string | null {
  if (!jid.startsWith(JID_PREFIX)) return null;
  return jid.slice(JID_PREFIX.length);
}

export function verifyNanoclawAuth(authHeader: string | null): boolean {
  if (!NANOCLAW_SECRET) return false;
  return authHeader === `Bearer ${NANOCLAW_SECRET}`;
}

const DENIK_BASE_URL = process.env.APP_URL || "https://www.denik.me";

export async function sendToNanoclaw(params: {
  orgId: string;
  senderId: string;
  senderName: string;
  content: string;
}): Promise<void> {
  if (!NANOCLAW_URL || !NANOCLAW_SECRET) {
    throw new Error("NANOCLAW_URL o NANOCLAW_SECRET no configurados");
  }

  // Resolver la apiKey de la org para que Nanoclaw pueda llamar al MCP
  // (@denik.me/mcp) en nombre de esta org específica.
  const org = await db.org.findUnique({
    where: { id: params.orgId },
    select: { apiKey: true, name: true },
  });
  if (!org?.apiKey) {
    throw new Error(
      `Org ${params.orgId} no tiene apiKey — corre scripts/dev/backfill-api-keys.ts`,
    );
  }

  const res = await fetch(`${NANOCLAW_URL}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NANOCLAW_SECRET}`,
    },
    body: JSON.stringify({
      jid: orgIdToJid(params.orgId),
      sender: params.senderId,
      sender_name: params.senderName,
      content: params.content,
      // org_name permite que nanoclaw auto-registre el grupo del webui al
      // primer mensaje con un CLAUDE.md personalizado (Nik · {orgName}).
      org_name: org.name,
      // Context para que Nanoclaw arranque el MCP de Denik con el scope
      // correcto. La apiKey autentica todas las tool calls al backend Denik.
      mcp: {
        package: "@denik.me/mcp",
        env: {
          DENIK_API_KEY: org.apiKey,
          DENIK_BASE_URL,
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Nanoclaw respondió ${res.status}: ${text}`);
  }
}

/**
 * Borra la sesión de Claude Agent SDK asociada a esta org en Nanoclaw,
 * forzando que el próximo mensaje arranque sin historial cacheado.
 * No-op silencioso si falla (ej. endpoint no disponible en droplet viejo).
 */
export async function resetNanoclawSession(orgId: string): Promise<void> {
  if (!NANOCLAW_URL || !NANOCLAW_SECRET) return;
  try {
    const res = await fetch(`${NANOCLAW_URL}/session/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NANOCLAW_SECRET}`,
      },
      body: JSON.stringify({ jid: orgIdToJid(orgId) }),
    });
    if (!res.ok) {
      console.warn(`[nanoclaw] session reset responded ${res.status}`);
    }
  } catch (err) {
    console.warn("[nanoclaw] session reset failed:", err);
  }
}

/**
 * Provisiona un grupo de WhatsApp para esta org via Nanoclaw.
 * Nanoclaw responde 202 inmediato y hace el callback async a
 * /whatsapp/link/callback con {token, groupJid, inviteUrl}.
 */
export async function createNanoclawGroup(params: {
  orgId: string;
  orgName: string;
  token: string;
  apiKey: string;
}): Promise<void> {
  if (!NANOCLAW_URL || !NANOCLAW_SECRET) {
    throw new Error("NANOCLAW_URL o NANOCLAW_SECRET no configurados");
  }
  const callbackUrl = `${DENIK_BASE_URL}/whatsapp/link/callback`;
  const res = await fetch(`${NANOCLAW_URL}/group/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NANOCLAW_SECRET}`,
    },
    body: JSON.stringify({
      token: params.token,
      orgId: params.orgId,
      orgName: params.orgName,
      denikApiKey: params.apiKey,
      denikBaseUrl: DENIK_BASE_URL,
      callbackUrl,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Nanoclaw /group/create ${res.status}: ${text}`);
  }
}

export async function saveUserMessage(orgId: string, content: string) {
  return db.assistantMessage.create({
    data: { orgId, role: "user", content, status: "pending" },
  });
}

export async function saveAssistantMessage(orgId: string, content: string) {
  // Marcar los "pending" previos como delivered
  await db.assistantMessage.updateMany({
    where: { orgId, role: "user", status: "pending" },
    data: { status: "delivered" },
  });
  return db.assistantMessage.create({
    data: { orgId, role: "assistant", content, status: "delivered" },
  });
}

export async function getMessagesSince(orgId: string, sinceIso?: string) {
  const where: any = { orgId };
  if (sinceIso) where.createdAt = { gt: new Date(sinceIso) };
  return db.assistantMessage.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: 100,
  });
}
