import { nanoid } from "nanoid"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { createNanoclawGroup } from "~/lib/nanoclaw.server"
import { db } from "~/utils/db.server"

/**
 * GET /api/whatsapp/link — devuelve el link activo (o null) para la org logueada.
 * POST /api/whatsapp/link — provisiona un grupo nuevo (idempotente si ya hay uno).
 */

const ACTIVE_STATUSES = ["pending", "provisioned", "active"]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })
  const link = await db.whatsAppLink.findFirst({
    where: { orgId: org.id, status: { in: ACTIVE_STATUSES } },
    orderBy: { createdAt: "desc" },
  })
  return Response.json({
    status: link?.status ?? null,
    inviteUrl: link?.inviteUrl ?? null,
    groupJid: link?.groupJid ?? null,
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user, org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  // Idempotencia: si ya hay un link activo, lo devolvemos tal cual.
  const existing = await db.whatsAppLink.findFirst({
    where: { orgId: org.id, status: { in: ACTIVE_STATUSES } },
  })
  if (existing) {
    return Response.json({
      status: existing.status,
      inviteUrl: existing.inviteUrl,
      groupJid: existing.groupJid,
    })
  }

  if (!(org as any).apiKey) {
    return Response.json(
      { error: "Org sin apiKey — corre backfill-api-keys" },
      { status: 500 },
    )
  }

  const token = nanoid(32)
  await db.whatsAppLink.create({
    data: {
      orgId: org.id,
      userId: user.id,
      token,
      status: "pending",
      createdAt: new Date(),
    },
  })

  try {
    await createNanoclawGroup({
      orgId: org.id,
      orgName: org.name || "Denik Org",
      token,
      apiKey: (org as any).apiKey,
    })
  } catch (err) {
    console.error("[whatsapp.link] create failed", err)
    // Marcamos como revocado para que el user pueda retry
    await db.whatsAppLink.updateMany({
      where: { token },
      data: { status: "revoked", revokedAt: new Date() },
    })
    return Response.json(
      { error: "No se pudo provisionar el grupo" },
      { status: 502 },
    )
  }

  return Response.json({ status: "pending", inviteUrl: null, groupJid: null })
}
