import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import {
  createEntry,
  deleteEntry,
  listEntries,
  RECORD_PAGE_SIZE,
  type RecordEntryType,
  saveIntake,
  saveTemplateFields,
  type TemplateScope,
  updateEntry,
} from "~/lib/customer-record.server"
import type { Route } from "./+types/customer-record"

// El input type="date" envía "YYYY-MM-DD". `new Date("YYYY-MM-DD")` lo parsea
// como medianoche UTC, que en zonas detrás de UTC (ej. MX, UTC-6) se muestra
// como el día anterior. Lo anclamos a mediodía UTC para que nunca cruce el día.
function parseDateOnly(value: FormDataEntryValue | null): Date | undefined {
  if (typeof value !== "string" || !value) return undefined
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00Z`)
    : new Date(value)
}

function parseJson(
  value: FormDataEntryValue | null,
): Record<string, unknown> | null {
  if (typeof value !== "string" || !value.trim()) return null
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) return Response.json({ error: "Org not found" }, { status: 404 })

  const url = new URL(request.url)
  const customerId = url.searchParams.get("customerId")
  if (!customerId)
    return Response.json({ error: "customerId requerido" }, { status: 400 })

  const skip = Number(url.searchParams.get("skip")) || 0
  const take = Number(url.searchParams.get("take")) || RECORD_PAGE_SIZE
  const { entries, hasMore } = await listEntries(org.id, customerId, {
    skip,
    take,
  })
  return Response.json({ entries, hasMore })
}

export const action = async ({ request }: Route.ActionArgs) => {
  const { user, org } = await getUserAndOrgOrRedirect(request)
  if (!org) return Response.json({ error: "Org not found" }, { status: 404 })
  // Owner + colaboradores con acceso al dash pueden editar.

  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")
  const formData = await request.formData()

  if (intent === "create") {
    const customerId = formData.get("customerId") as string
    if (!customerId)
      return Response.json({ error: "customerId requerido" }, { status: 400 })
    const entry = await createEntry({
      orgId: org.id,
      customerId,
      author: { id: user.id, name: user.displayName },
      input: {
        type: (formData.get("type") as RecordEntryType) || "nota",
        title: (formData.get("title") as string) || null,
        body: (formData.get("body") as string) || "",
        eventId: (formData.get("eventId") as string) || null,
        values: parseJson(formData.get("values")),
        performedAt: parseDateOnly(formData.get("performedAt")),
      },
    })
    return Response.json({ entry })
  }

  if (intent === "update") {
    const entryId = formData.get("entryId") as string
    if (!entryId)
      return Response.json({ error: "entryId requerido" }, { status: 400 })
    const entry = await updateEntry({
      orgId: org.id,
      entryId,
      input: {
        type: (formData.get("type") as RecordEntryType) || undefined,
        title: (formData.get("title") as string) ?? undefined,
        body: (formData.get("body") as string) ?? undefined,
        eventId: (formData.get("eventId") as string) ?? undefined,
        values: parseJson(formData.get("values")),
        performedAt: parseDateOnly(formData.get("performedAt")),
      },
    })
    return Response.json({ entry })
  }

  if (intent === "delete") {
    const entryId = formData.get("entryId") as string
    if (!entryId)
      return Response.json({ error: "entryId requerido" }, { status: 400 })
    return Response.json(await deleteEntry({ orgId: org.id, entryId }))
  }

  if (intent === "save-templates") {
    const scope = formData.get("scope") as TemplateScope
    if (scope !== "ficha" && scope !== "atencion")
      return Response.json({ error: "scope inválido" }, { status: 400 })
    const templates = await saveTemplateFields({
      orgId: org.id,
      businessType: org.businessType,
      scope,
      fields: parseJson(formData.get("fields")), // arreglo JSON; sanitizeFields valida
    })
    return Response.json({ templates })
  }

  if (intent === "save-intake") {
    const customerId = formData.get("customerId") as string
    if (!customerId)
      return Response.json({ error: "customerId requerido" }, { status: 400 })
    const values = parseJson(formData.get("values")) ?? {}
    return Response.json(
      await saveIntake({ orgId: org.id, customerId, values }),
    )
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}
