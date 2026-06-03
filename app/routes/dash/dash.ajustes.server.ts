import { requireRole } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import { sendInviteCollaborator } from "~/utils/emails/sendInviteCollaborator"
import { getPutFileUrl, removeFileUrl } from "~/utils/lib/tigris.server"
import { weekDaysOrgSchema } from "~/utils/zod_schemas"
import {
  COUNTRIES,
  PERIOD,
  RANGES,
  ROLE,
  TIMES,
  TIMEZONES,
} from "./dash.ajustes.constants"

export const loader = async ({ request }: { request: Request }) => {
  const { org } = await requireRole(request, ["OWNER", "ADMIN"])
  if (!org) throw new Response("Org not found", { status: 404 })
  // Multi-org: un colaborador pertenece a la org si la tiene en `orgIds`,
  // sin importar cuál sea su org activa (`orgId`). El OR con `orgId` cubre
  // datos legacy (owners/miembros creados antes de poblar `orgIds`).
  const collaborators = await db.user.findMany({
    where: { OR: [{ orgIds: { has: org.id } }, { orgId: org.id }] },
  })
  const logoKey = `logos/${org.id}/${Date.now()}`
  const putUrl = await getPutFileUrl(logoKey)
  const removeUrl = org.logo ? await removeFileUrl(org.logo) : ""
  return {
    countries: COUNTRIES,
    timeZones: TIMEZONES,
    period: PERIOD,
    ranges: RANGES,
    times: TIMES,
    collaborators,
    org,
    logoAction: {
      putUrl,
      removeUrl,
      readUrl: org.logo ? `/api/images?key=${org.logo}` : "",
      logoKey,
    },
  }
}

export const action = async ({ request }: { request: Request }) => {
  const { org } = await requireRole(request, ["OWNER", "ADMIN"])
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "delete") {
    const userId = formData.get("userId") as string
    if (!userId) return { error: "userId requerido" }
    if (userId === org.ownerId)
      return { error: "No puedes remover al propietario" }

    const target = await db.user.findUnique({ where: { id: userId } })
    const belongs =
      target?.orgIds?.includes(org.id) || target?.orgId === org.id
    if (!target || !belongs)
      return { error: "Este colaborador no pertenece a tu organización" }

    // Pull org.id de orgIds (Prisma Mongo no soporta `pull` en scalar lists → set).
    // Si esta era su org activa, mover el activo a otra org restante o null.
    const remaining = (target.orgIds ?? []).filter((id) => id !== org.id)
    await db.user.update({
      where: { id: userId },
      data: {
        orgIds: { set: remaining },
        ...(target.orgId === org.id ? { orgId: remaining[0] ?? null } : {}),
      },
    })
    return { ok: true }
  }

  if (intent === "update_weekdays") {
    const rawData = JSON.parse(formData.get("data") as string)
    const result = weekDaysOrgSchema.safeParse(rawData)
    if (!result.success) {
      return Response.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 },
      )
    }
    await db.org.update({
      where: { id: org.id },
      data: { weekDays: { set: result.data.weekDays } },
    })
    return { ok: true }
  }

  if (intent === "invite") {
    const email = (formData.get("email") as string)?.trim()
    const displayName = (formData.get("displayName") as string)?.trim()
    // Rol homologado: solo ADMIN o MEMBER (default). OWNER se deriva de ownerId.
    const requestedRole = formData.get("role") as string
    const role = requestedRole === ROLE.ADMIN ? ROLE.ADMIN : ROLE.MEMBER
    if (!email) return { error: "Email requerido" }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      if (existing.orgIds?.includes(org.id) || existing.orgId === org.id) {
        return { error: "Este colaborador ya pertenece a tu organización" }
      }
      // Multi-org: agregar la org a su lista sin sacarlo de su org activa.
      // Solo activamos esta org si el usuario aún no tenía ninguna.
      await db.user.update({
        where: { id: existing.id },
        data: {
          orgIds: { push: org.id },
          role,
          ...(existing.orgId ? {} : { orgId: org.id }),
        },
      })
    } else {
      await db.user.create({
        data: {
          email,
          emailVerified: false,
          displayName: displayName || null,
          orgId: org.id,
          orgIds: [org.id],
          role,
        },
      })
    }
    // Email de invitación (no bloqueante: no falla la invitación si SES falla)
    sendInviteCollaborator(email, org.name || "tu equipo").catch((err) =>
      console.error("sendInviteCollaborator failed:", err),
    )
    return { ok: true }
  }

  if (intent === "disconnect_google") {
    await db.org.update({
      where: { id: org.id },
      data: { googleCalendarToken: null },
    })
    return { ok: true }
  }

  if (intent === "disconnect_zoom") {
    await db.org.update({
      where: { id: org.id },
      data: { zoomToken: null },
    })
    return { ok: true }
  }

  return { error: "Intent no reconocido" }
}
