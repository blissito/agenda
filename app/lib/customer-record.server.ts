import type { Org } from "@prisma/client"
import { db } from "~/utils/db.server"

// ==================== TYPES ====================

export type RecordEntryType = "nota" | "tratamiento" | "evolucion" | "resultado"

// Tipos de campo soportados en plantillas personalizables (estilo AgendaPro).
export type FieldType =
  | "texto"
  | "textarea"
  | "numero"
  | "select"
  | "multiselect"
  | "fecha"
  | "checkbox"

export interface TemplateField {
  id: string
  label: string
  type: FieldType
  options?: string[] // para select / multiselect
  required?: boolean
  placeholder?: string
}

export type TemplateScope = "ficha" | "atencion"

export interface OrgRecordTemplates {
  /** Campos de la ficha del cliente (datos semi-estáticos) */
  ficha: TemplateField[]
  /** Campos de cada atención/entrada del timeline */
  atencion: TemplateField[]
}

export interface RecordEntryInput {
  type: RecordEntryType
  title?: string | null
  body?: string | null
  performedAt?: Date
  eventId?: string | null
  values?: Record<string, unknown> | null // valores de campos personalizados
  attachments?: string[]
}

export const ENTRY_TYPE_LABELS: { value: RecordEntryType; label: string }[] = [
  { value: "tratamiento", label: "Tratamiento / sesión" },
  { value: "evolucion", label: "Nota de evolución" },
  { value: "resultado", label: "Resultado" },
  { value: "nota", label: "Nota general" },
]

// ==================== DEFAULTS POR GIRO ====================
// Plantillas semilla. Se usan cuando la org aún no personalizó sus campos.
// El owner luego las edita y se persisten en Org.recordTemplates.

interface GiroDefaults {
  fichaLabel: string
  ficha: TemplateField[]
  atencion: TemplateField[]
}

const DEFAULTS: Record<string, GiroDefaults> = {
  medico: {
    fichaLabel: "Ficha clínica",
    ficha: [
      { id: "alergias", label: "Alergias", type: "textarea" },
      {
        id: "padecimientos",
        label: "Padecimientos / antecedentes",
        type: "textarea",
      },
      { id: "medicamentos", label: "Medicamentos actuales", type: "textarea" },
      { id: "objetivos", label: "Motivo de consulta", type: "textarea" },
      {
        id: "contraindicaciones",
        label: "Contraindicaciones",
        type: "textarea",
      },
    ],
    atencion: [
      { id: "diagnostico", label: "Diagnóstico", type: "textarea" },
      { id: "indicaciones", label: "Indicaciones", type: "textarea" },
      { id: "proxima", label: "Próxima revisión", type: "fecha" },
    ],
  },
  estetico: {
    fichaLabel: "Ficha estética",
    ficha: [
      { id: "tipoPiel", label: "Tipo de piel / cabello", type: "texto" },
      { id: "alergias", label: "Alergias / sensibilidades", type: "textarea" },
      { id: "objetivos", label: "Objetivos del cliente", type: "textarea" },
      {
        id: "contraindicaciones",
        label: "Contraindicaciones",
        type: "textarea",
      },
    ],
    atencion: [
      { id: "areaTratada", label: "Área tratada", type: "texto" },
      { id: "productos", label: "Productos usados", type: "textarea" },
      { id: "observaciones", label: "Observaciones", type: "textarea" },
    ],
  },
  fitness: {
    fichaLabel: "Ficha de seguimiento",
    ficha: [
      { id: "objetivos", label: "Objetivos", type: "textarea" },
      { id: "lesiones", label: "Lesiones / limitaciones", type: "textarea" },
      { id: "nivel", label: "Nivel / experiencia", type: "texto" },
    ],
    atencion: [
      { id: "rutina", label: "Rutina / ejercicios", type: "textarea" },
      { id: "mediciones", label: "Mediciones", type: "texto" },
    ],
  },
  mascotas: {
    fichaLabel: "Expediente de la mascota",
    ficha: [
      { id: "especie", label: "Especie / raza", type: "texto" },
      { id: "edad", label: "Edad", type: "texto" },
      { id: "vacunas", label: "Vacunas / desparasitación", type: "textarea" },
      {
        id: "padecimientos",
        label: "Padecimientos / alergias",
        type: "textarea",
      },
    ],
    atencion: [
      { id: "peso", label: "Peso", type: "texto" },
      { id: "tratamiento", label: "Tratamiento aplicado", type: "textarea" },
    ],
  },
  educacion: {
    fichaLabel: "Ficha del alumno",
    ficha: [
      { id: "nivel", label: "Nivel actual", type: "texto" },
      { id: "objetivos", label: "Objetivos de aprendizaje", type: "textarea" },
    ],
    atencion: [
      { id: "tema", label: "Tema visto", type: "texto" },
      { id: "tarea", label: "Tarea / siguiente paso", type: "textarea" },
    ],
  },
  general: {
    fichaLabel: "Ficha del cliente",
    ficha: [
      { id: "objetivos", label: "Objetivos / necesidades", type: "textarea" },
      { id: "notas", label: "Notas relevantes", type: "textarea" },
    ],
    atencion: [],
  },
}

// Mapeo giro (Org.businessType, en español) → archetype. Heurística por keyword.
const GIRO_TO_ARCHETYPE: Record<string, string> = {
  "consultorio médico": "medico",
  "estudios clínicos": "medico",
  "terapia física": "medico",
  nutriólogo: "medico",
  psicólogo: "medico",
  "consultorio psicológico": "medico",
  estética: "estetico",
  spa: "estetico",
  "salón de belleza": "estetico",
  "salón de uñas": "estetico",
  barbería: "estetico",
  "centro deportivo": "fitness",
  crossfit: "fitness",
  gimnasio: "fitness",
  "yoga / meditación": "fitness",
  pilates: "fitness",
  "danza / baile": "fitness",
  veterinaria: "mascotas",
  coaching: "educacion",
  tutorías: "educacion",
  "centro de idiomas": "educacion",
}

function archetypeFor(businessType?: string | null): string {
  if (!businessType) return "general"
  return GIRO_TO_ARCHETYPE[businessType.toLowerCase().trim()] ?? "general"
}

export function fichaLabelFor(businessType?: string | null): string {
  return (
    DEFAULTS[archetypeFor(businessType)]?.fichaLabel ??
    DEFAULTS.general.fichaLabel
  )
}

/**
 * Etiqueta del tipo de registro "tratamiento" según el giro. Para coaches y
 * negocios de clases (educacion/fitness) decimos "Clase"; el resto "Tratamiento".
 * El valor del enum sigue siendo "tratamiento" — solo cambia el texto en UI.
 */
export function tratamientoLabelFor(businessType?: string | null): string {
  const archetype = archetypeFor(businessType)
  return archetype === "educacion" || archetype === "fitness"
    ? "Clase"
    : "Tratamiento"
}

function defaultsFor(businessType?: string | null): OrgRecordTemplates {
  const d = DEFAULTS[archetypeFor(businessType)] ?? DEFAULTS.general
  return { ficha: d.ficha, atencion: d.atencion }
}

// ==================== TEMPLATES (ORG) ====================

const VALID_FIELD_TYPES: FieldType[] = [
  "texto",
  "textarea",
  "numero",
  "select",
  "multiselect",
  "fecha",
  "checkbox",
]

function sanitizeFields(input: unknown): TemplateField[] {
  if (!Array.isArray(input)) return []
  const out: TemplateField[] = []
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue
    const f = raw as Record<string, unknown>
    const id = typeof f.id === "string" && f.id ? f.id : null
    const label = typeof f.label === "string" ? f.label.trim() : ""
    const type = VALID_FIELD_TYPES.includes(f.type as FieldType)
      ? (f.type as FieldType)
      : "texto"
    if (!id || !label) continue
    const field: TemplateField = { id, label, type }
    if (Array.isArray(f.options)) {
      field.options = f.options
        .filter((o): o is string => typeof o === "string" && o.trim() !== "")
        .map((o) => o.trim())
    }
    if (f.required === true) field.required = true
    if (typeof f.placeholder === "string" && f.placeholder)
      field.placeholder = f.placeholder
    out.push(field)
  }
  return out
}

/** Devuelve las plantillas de la org; siembra desde el giro si aún no existen. */
export function getOrgTemplates(
  org: Pick<Org, "businessType"> & { recordTemplates?: unknown },
): OrgRecordTemplates {
  const stored = org.recordTemplates as Partial<OrgRecordTemplates> | null
  if (stored && (stored.ficha || stored.atencion)) {
    return {
      ficha: sanitizeFields(stored.ficha),
      atencion: sanitizeFields(stored.atencion),
    }
  }
  return defaultsFor(org.businessType)
}

/** Persiste los campos de un scope (ficha | atencion) conservando el otro. */
export async function saveTemplateFields(params: {
  orgId: string
  businessType?: string | null
  scope: TemplateScope
  fields: unknown
}): Promise<OrgRecordTemplates> {
  const { orgId, businessType, scope, fields } = params
  const org = await db.org.findUnique({
    where: { id: orgId },
    select: { recordTemplates: true, businessType: true },
  })
  const current = getOrgTemplates({
    businessType: businessType ?? org?.businessType ?? null,
    recordTemplates: org?.recordTemplates,
  })
  const next: OrgRecordTemplates = {
    ficha: scope === "ficha" ? sanitizeFields(fields) : current.ficha,
    atencion: scope === "atencion" ? sanitizeFields(fields) : current.atencion,
  }
  await db.org.update({
    where: { id: orgId },
    data: { recordTemplates: next as object },
  })
  return next
}

// ==================== INTAKE (FICHA DEL CLIENTE) ====================

export async function saveIntake(params: {
  orgId: string
  customerId: string
  values: Record<string, unknown>
}) {
  const { orgId, customerId, values } = params
  const customer = await db.customer.findFirst({
    where: { id: customerId, orgId },
    select: { id: true },
  })
  if (!customer) throw new Response("Cliente no encontrado", { status: 404 })
  await db.customer.update({
    where: { id: customerId },
    data: { intake: { values } as object, updatedAt: new Date() },
  })
  return { success: true }
}

// ==================== QUERIES ====================

export const RECORD_PAGE_SIZE = 15

export async function listEntries(
  orgId: string,
  customerId: string,
  opts?: { skip?: number; take?: number },
) {
  const skip = opts?.skip ?? 0
  const take = opts?.take ?? RECORD_PAGE_SIZE
  const rows = await db.customerRecordEntry.findMany({
    where: { orgId, customerId },
    // performedAt es fecha sin hora; createdAt desempata para que el último
    // registro agregado en un mismo día quede primero.
    orderBy: [{ performedAt: "desc" }, { createdAt: "desc" }],
    skip,
    take: take + 1, // +1 para detectar si hay más sin contar todo
  })
  const hasMore = rows.length > take
  return { entries: hasMore ? rows.slice(0, take) : rows, hasMore }
}

/** eventId ligados a cualquier registro (filtro 1:1 de citas), sin paginar */
export async function listLinkedEventIds(orgId: string, customerId: string) {
  const rows = await db.customerRecordEntry.findMany({
    where: { orgId, customerId, eventId: { not: null } },
    select: { eventId: true },
  })
  return rows.map((r) => r.eventId).filter((id): id is string => Boolean(id))
}

// ==================== MUTATIONS ====================

const VALID_TYPES: RecordEntryType[] = [
  "nota",
  "tratamiento",
  "evolucion",
  "resultado",
]

function normalizeType(type: unknown): RecordEntryType {
  return VALID_TYPES.includes(type as RecordEntryType)
    ? (type as RecordEntryType)
    : "nota"
}

export async function createEntry(params: {
  orgId: string
  customerId: string
  author: { id: string; name?: string | null }
  input: RecordEntryInput
}) {
  const { orgId, customerId, author, input } = params
  const hasBody = !!input.body?.trim()
  const hasValues = input.values && Object.keys(input.values).length > 0
  if (!hasBody && !hasValues && !input.title?.trim()) {
    throw new Response("La entrada está vacía", { status: 400 })
  }
  return db.customerRecordEntry.create({
    data: {
      orgId,
      customerId,
      eventId: input.eventId ?? null,
      authorId: author.id,
      authorName: author.name ?? null,
      type: normalizeType(input.type),
      title: input.title?.trim() || null,
      body: input.body?.trim() || "",
      attachments: input.attachments ?? [],
      metadata: input.values ? ({ values: input.values } as object) : undefined,
      performedAt: input.performedAt ?? new Date(),
    },
  })
}

export async function updateEntry(params: {
  orgId: string
  entryId: string
  input: Partial<RecordEntryInput>
}) {
  const { orgId, entryId, input } = params
  const existing = await db.customerRecordEntry.findFirst({
    where: { id: entryId, orgId },
    select: { id: true },
  })
  if (!existing) throw new Response("Entrada no encontrada", { status: 404 })

  return db.customerRecordEntry.update({
    where: { id: entryId },
    data: {
      ...(input.eventId !== undefined && { eventId: input.eventId || null }),
      ...(input.type !== undefined && { type: normalizeType(input.type) }),
      ...(input.title !== undefined && { title: input.title?.trim() || null }),
      ...(input.body !== undefined && { body: input.body?.trim() || "" }),
      ...(input.performedAt !== undefined && {
        performedAt: input.performedAt,
      }),
      ...(input.values !== undefined && {
        metadata: input.values
          ? ({ values: input.values } as object)
          : undefined,
      }),
      ...(input.attachments !== undefined && {
        attachments: input.attachments,
      }),
    },
  })
}

export async function deleteEntry(params: { orgId: string; entryId: string }) {
  const { orgId, entryId } = params
  const existing = await db.customerRecordEntry.findFirst({
    where: { id: entryId, orgId },
    select: { id: true },
  })
  if (!existing) throw new Response("Entrada no encontrada", { status: 404 })
  await db.customerRecordEntry.delete({ where: { id: entryId } })
  return { success: true }
}
