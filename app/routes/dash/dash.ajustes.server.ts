import { requireRole } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import { getPutFileUrl, removeFileUrl } from "~/utils/lib/tigris.server"
import { weekDaysOrgSchema } from "~/utils/zod_schemas"
import { COUNTRIES, TIMEZONES, PERIOD, RANGES, TIMES } from "./dash.ajustes.constants"

export const loader = async ({ request }: { request: Request }) => {
  const { org } = await requireRole(request, ["OWNER", "ADMIN"])
  if (!org) throw new Response("Org not found", { status: 404 })
  const collaborators = await db.user.findMany({
    where: { orgId: org.id },
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
    await db.user.update({
      where: { id: userId, orgId: org.id },
      data: { orgId: null },
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
    const role = (formData.get("role") as string) || "user"
    if (!email) return { error: "Email requerido" }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      if (existing.orgId === org.id) {
        return { error: "Este colaborador ya pertenece a tu organización" }
      }
      await db.user.update({
        where: { id: existing.id },
        data: { orgId: org.id, role },
      })
    } else {
      await db.user.create({
        data: {
          email,
          emailVerified: false,
          displayName: displayName || null,
          orgId: org.id,
          role,
        },
      })
    }
    return { ok: true }
  }

  return { error: "Intent no reconocido" }
}
