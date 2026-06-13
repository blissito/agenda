import { getUserAndOrgOrRedirect, requireRole } from "~/.server/userGetters"
import {
  createBranch,
  listBranches,
  toggleBranchActive,
  updateBranch,
} from "~/lib/branches.server"
import type { Route } from "./+types/branches"

// Parsea el JSON de weekDays del form; devuelve undefined si viene vacío/ inválido.
function parseWeekDays(raw: FormDataEntryValue | null) {
  if (!raw || typeof raw !== "string") return undefined
  try {
    const parsed = JSON.parse(raw)
    const hasAnyDay =
      parsed &&
      Object.values(parsed).some((v) => Array.isArray(v) && v.length > 0)
    return hasAnyDay ? parsed : undefined
  } catch {
    return undefined
  }
}

function numOrNull(raw: FormDataEntryValue | null): number | null {
  if (raw === null || raw === "") return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function strOrNull(raw: FormDataEntryValue | null): string | null {
  if (raw === null) return null
  const s = String(raw).trim()
  return s === "" ? null : s
}

export const action = async ({ request }: Route.ActionArgs) => {
  const { org } = await requireRole(request, ["OWNER", "ADMIN"])
  if (!org) throw new Response("Org not found", { status: 404 })

  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "create") {
    const name = strOrNull(formData.get("name"))
    if (!name) {
      return Response.json({ error: "El nombre es obligatorio" }, { status: 400 })
    }
    const branch = await createBranch({
      orgId: org.id,
      name,
      address: strOrNull(formData.get("address")),
      lat: numOrNull(formData.get("lat")),
      lng: numOrNull(formData.get("lng")),
      timezone: strOrNull(formData.get("timezone")),
      tel: strOrNull(formData.get("tel")),
      email: strOrNull(formData.get("email")),
      weekDays: parseWeekDays(formData.get("weekDays")),
    })
    return Response.json({ ok: true, branch })
  }

  if (intent === "update") {
    const branchId = strOrNull(formData.get("branchId"))
    if (!branchId) {
      return Response.json({ error: "branchId requerido" }, { status: 400 })
    }
    const branch = await updateBranch(branchId, org.id, {
      name: strOrNull(formData.get("name")) ?? undefined,
      address: strOrNull(formData.get("address")),
      lat: numOrNull(formData.get("lat")),
      lng: numOrNull(formData.get("lng")),
      timezone: strOrNull(formData.get("timezone")),
      tel: strOrNull(formData.get("tel")),
      email: strOrNull(formData.get("email")),
      weekDays: parseWeekDays(formData.get("weekDays")),
    })
    return Response.json({ ok: true, branch })
  }

  if (intent === "toggle-active") {
    const branchId = strOrNull(formData.get("branchId"))
    if (!branchId) {
      return Response.json({ error: "branchId requerido" }, { status: 400 })
    }
    const branch = await toggleBranchActive(branchId, org.id)
    return Response.json({ ok: true, branch })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")

  if (intent === "list" || intent === null) {
    return Response.json({ branches: await listBranches(org.id) })
  }
  return Response.json({ error: "Unknown intent" }, { status: 400 })
}
