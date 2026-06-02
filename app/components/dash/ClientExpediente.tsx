import { motion } from "motion/react"
import * as React from "react"
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi"
import { useFetcher } from "react-router"
import { Drawer } from "~/components/animated/SimpleDrawer"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { Calendar2 } from "~/components/icons/calendar2"
import type {
  FieldType,
  OrgRecordTemplates,
  RecordEntryType,
  TemplateField,
  TemplateScope,
} from "~/lib/customer-record.server"

// ==================== TYPES ====================

export interface RecordEntry {
  id: string
  type: RecordEntryType
  title: string | null
  body: string
  eventId?: string | null
  authorName: string | null
  performedAt: string
  createdAt: string
  metadata?: { values?: Record<string, unknown> } | null
}

/** Cita del cliente para ligar opcionalmente a un registro */
export interface ExpedienteCita {
  id: string
  start: string
  serviceTitle: string
}

export interface ExpedienteFormState {
  open: boolean
  editing: RecordEntry | null
}

// Debe coincidir con RECORD_PAGE_SIZE del server (no se puede importar de un
// módulo .server en el cliente).
const RECORDS_PAGE_SIZE = 15

const TITLE_MAX_LENGTH = 50

const ENTRY_TYPES: { value: RecordEntryType; label: string }[] = [
  { value: "tratamiento", label: "Tratamiento / sesión" },
  { value: "evolucion", label: "Nota de evolución" },
  { value: "resultado", label: "Resultado" },
  { value: "nota", label: "Nota general" },
]

const FIELD_TYPE_LABELS: { value: FieldType; label: string }[] = [
  { value: "texto", label: "Texto" },
  { value: "textarea", label: "Texto largo" },
  { value: "numero", label: "Número" },
  { value: "select", label: "Lista desplegable" },
  { value: "multiselect", label: "Opción múltiple" },
  { value: "fecha", label: "Fecha" },
  { value: "checkbox", label: "Casilla (Sí/No)" },
]

const TYPE_STYLES: Record<
  RecordEntryType,
  { label: string; dot: string; chip: string }
> = {
  tratamiento: {
    label: "Tratamiento",
    dot: "bg-brand_lime",
    chip: "bg-brand_lime/30 text-lime-700",
  },
  evolucion: {
    label: "Evolución",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700",
  },
  resultado: {
    label: "Resultado",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700",
  },
  nota: {
    label: "Nota",
    dot: "bg-brand_gray",
    chip: "bg-gray-100 text-brand_gray",
  },
}

// Homologado con los inputs compartidos (BasicInput/SelectInput): el plugin
// @tailwindcss/forms aporta borde + padding base, solo coloreamos y damos forma.
const INPUT_CLS =
  "h-12 w-full rounded-2xl border-gray-200 text-brand_gray font-satoshi placeholder:text-brand_ash focus:border-brand_blue focus:outline-none focus:ring-0"

const TEXTAREA_CLS =
  "w-full rounded-xl border-gray-200 text-brand_gray font-satoshi placeholder:text-brand_ash focus:border-brand_blue focus:outline-none focus:ring-0 resize-none"

// ==================== HELPERS ====================

function fmtDate(value: string) {
  // Una fecha sin hora ("YYYY-MM-DD") se parsea como medianoche UTC y en MX
  // (UTC-6) se mostraría como el día anterior; la anclamos a mediodía UTC.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00Z`)
    : new Date(value)
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function citaLabel(c: ExpedienteCita) {
  return `${fmtDate(c.start)} · ${c.serviceTitle}`
}

function toDateInputValue(value?: string) {
  const d = value ? new Date(value) : new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

function newFieldId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return `f_${crypto.randomUUID().slice(0, 8)}`
  return `f_${Math.abs(Math.floor(Math.random() * 1e9))}`
}

function displayValue(field: TemplateField, value: unknown): string {
  if (value == null || value === "") return "—"
  if (field.type === "checkbox") return value ? "Sí" : "No"
  if (field.type === "multiselect" && Array.isArray(value))
    return value.join(", ")
  if (field.type === "fecha" && typeof value === "string") return fmtDate(value)
  return String(value)
}

// ==================== DYNAMIC FIELD INPUTS ====================

function DynamicFields({
  fields,
  values,
  onChange,
}: {
  fields: TemplateField[]
  values: Record<string, unknown>
  onChange: (id: string, value: unknown) => void
}) {
  return (
    <>
      {fields.map((field) => {
        const value = values[field.id]
        const label = (
          <span className="font-satoMedium text-brand_dark">
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </span>
        )
        if (field.type === "textarea") {
          return (
            <label key={field.id} className="flex flex-col gap-1">
              {label}
              <textarea
                rows={3}
                required={field.required}
                value={(value as string) ?? ""}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={TEXTAREA_CLS}
              />
            </label>
          )
        }
        if (field.type === "checkbox") {
          return (
            <label
              key={field.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(field.id, e.target.checked)}
                className="w-4 h-4 rounded accent-brand_blue"
              />
              {label}
            </label>
          )
        }
        if (field.type === "select") {
          return (
            <label key={field.id} className="flex flex-col gap-1">
              {label}
              <select
                required={field.required}
                value={(value as string) ?? ""}
                onChange={(e) => onChange(field.id, e.target.value)}
                className={INPUT_CLS}
              >
                <option value="">Selecciona…</option>
                {(field.options ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          )
        }
        if (field.type === "multiselect") {
          const arr = Array.isArray(value) ? (value as string[]) : []
          return (
            <div key={field.id} className="flex flex-col gap-1">
              {label}
              <div className="flex flex-wrap gap-2">
                {(field.options ?? []).map((o) => {
                  const on = arr.includes(o)
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() =>
                        onChange(
                          field.id,
                          on ? arr.filter((x) => x !== o) : [...arr, o],
                        )
                      }
                      className={`px-3 h-9 rounded-full text-sm font-satoMedium border transition ${
                        on
                          ? "bg-brand_blue/10 border-brand_blue text-brand_blue"
                          : "border-brand_stroke text-brand_gray hover:bg-gray-50"
                      }`}
                    >
                      {o}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        }
        // texto | numero | fecha
        return (
          <label key={field.id} className="flex flex-col gap-1">
            {label}
            <input
              type={
                field.type === "numero"
                  ? "number"
                  : field.type === "fecha"
                    ? "date"
                    : "text"
              }
              required={field.required}
              value={(value as string) ?? ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={INPUT_CLS}
            />
          </label>
        )
      })}
    </>
  )
}

// ==================== DRAWER HELPERS ====================

// El footer vive dentro del padding del Drawer compartido (p-6 md:p-8);
// cancelamos ese padding inferior y dejamos pb-4 (16px) hasta el borde.
const FOOTER_CLS =
  "mt-auto flex items-center justify-end gap-3 pt-4 pb-4 -mb-6 md:-mb-8"

/**
 * Los drawers permanecen montados (patrón isOpen del Drawer compartido), así
 * que devolvemos una key que incrementa en cada apertura para reiniciar el
 * estado del formulario (campos sin guardar, valores del registro previo).
 */
function useReopenKey(isOpen: boolean) {
  const [key, setKey] = React.useState(0)
  const prev = React.useRef(isOpen)
  React.useEffect(() => {
    if (isOpen && !prev.current) setKey((k) => k + 1)
    prev.current = isOpen
  }, [isOpen])
  return key
}

function useCloseOnSuccess(
  fetcher: ReturnType<typeof useFetcher>,
  onClose: () => void,
) {
  const wasBusy = React.useRef(false)
  React.useEffect(() => {
    if (wasBusy.current && fetcher.state === "idle" && fetcher.data) {
      if (!(fetcher.data as { error?: string }).error) onClose()
    }
    wasBusy.current = fetcher.state !== "idle"
  }, [fetcher.state, fetcher.data, onClose])
}

// ==================== ENTRY FORM ====================

function EntryForm({
  customerId,
  atencionFields,
  tratamientoLabel,
  citas,
  linkedEventIds,
  editing,
  isOpen,
  onClose,
}: {
  customerId: string
  atencionFields: TemplateField[]
  tratamientoLabel: string
  citas: ExpedienteCita[]
  linkedEventIds: Set<string>
  editing: RecordEntry | null
  isOpen: boolean
  onClose: () => void
}) {
  const fetcher = useFetcher()
  const busy = fetcher.state !== "idle"
  useCloseOnSuccess(fetcher, onClose)

  // Citas seleccionables: pasadas y aún no ligadas a otro registro.
  // Siempre incluimos la cita propia del registro que se edita.
  const now = Date.now()
  const availableCitas = citas.filter((c) => {
    if (c.id === editing?.eventId) return true
    const isPast = new Date(c.start).getTime() <= now
    return isPast && !linkedEventIds.has(c.id)
  })

  const reopenKey = useReopenKey(isOpen)
  const [type, setType] = React.useState<RecordEntryType>(
    editing?.type ?? "tratamiento",
  )
  const [title, setTitle] = React.useState(editing?.title ?? "")
  const [body, setBody] = React.useState(editing?.body ?? "")
  const [values, setValues] = React.useState<Record<string, unknown>>(
    editing?.metadata?.values ?? {},
  )
  // Reinicia el formulario al reabrir o cambiar de registro editado
  const [prevKey, setPrevKey] = React.useState(reopenKey)
  if (prevKey !== reopenKey) {
    setPrevKey(reopenKey)
    setType(editing?.type ?? "tratamiento")
    setTitle(editing?.title ?? "")
    setBody(editing?.body ?? "")
    setValues(editing?.metadata?.values ?? {})
  }
  const onChange = (id: string, v: unknown) =>
    setValues((prev) => ({ ...prev, [id]: v }))

  const intent = editing ? "update" : "create"
  const formId = "exp-entry-form"

  // La etiqueta del tipo "tratamiento" cambia por giro (ej. "Clase / sesión")
  const entryTypeOptions = ENTRY_TYPES.map((t) =>
    t.value === "tratamiento"
      ? { ...t, label: `${tratamientoLabel} / sesión` }
      : t,
  )

  // El tipo "tratamiento/clase/sesión" usa los campos custom del giro.
  // El resto (evolución, resultado, nota) usa título + descripción libres.
  // Si el giro no tiene campos custom, caemos a título + descripción.
  const showCustom = type === "tratamiento" && atencionFields.length > 0

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="big"
      title={editing ? "Editar registro" : "Nuevo registro"}
      footer={
        <nav className={FOOTER_CLS}>
          <SecondaryButton type="button" onClick={onClose}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            form={formId}
            isDisabled={busy}
            className="h-12"
          >
            {busy ? "Guardando…" : "Guardar"}
          </PrimaryButton>
        </nav>
      }
    >
      <fetcher.Form
        key={reopenKey}
        id={formId}
        method="post"
        action={`/api/customer-record?intent=${intent}`}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="customerId" value={customerId} />
        {editing && <input type="hidden" name="entryId" value={editing.id} />}
        {/* Solo enviamos los valores custom cuando aplica el tipo estructurado */}
        <input
          type="hidden"
          name="values"
          value={showCustom ? JSON.stringify(values) : "{}"}
        />

        <label className="flex flex-col gap-1">
          <span className="font-satoMedium text-brand_dark">Tipo</span>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as RecordEntryType)}
            className={INPUT_CLS}
          >
            {entryTypeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-satoMedium text-brand_dark">Fecha</span>
          <input
            type="date"
            name="performedAt"
            defaultValue={toDateInputValue(editing?.performedAt)}
            className={INPUT_CLS}
          />
        </label>

        {availableCitas.length > 0 && (
          <label className="flex flex-col gap-1">
            <span className="font-satoMedium text-brand_dark">
              Cita relacionada{" "}
              <span className="text-brand_gray">(opcional)</span>
            </span>
            <select
              name="eventId"
              defaultValue={editing?.eventId ?? ""}
              className={INPUT_CLS}
            >
              <option value="">Ninguna / registro general</option>
              {availableCitas.map((c) => (
                <option key={c.id} value={c.id}>
                  {citaLabel(c)}
                </option>
              ))}
            </select>
          </label>
        )}

        {showCustom ? (
          <>
            {/* Limpia título/descripción si el registro venía de otro tipo */}
            <input type="hidden" name="title" value="" />
            <input type="hidden" name="body" value="" />
            <div className="flex flex-col gap-4">
              <DynamicFields
                fields={atencionFields}
                values={values}
                onChange={onChange}
              />
            </div>
          </>
        ) : (
          <>
            <label className="flex flex-col gap-1">
              <span className="font-satoMedium text-brand_dark">
                Título <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                name="title"
                required
                maxLength={TITLE_MAX_LENGTH}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Limpieza facial profunda"
                className={INPUT_CLS}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-satoMedium text-brand_dark">
                Descripción
              </span>
              <textarea
                name="body"
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Qué se realizó, observaciones, evolución, resultados…"
                className={TEXTAREA_CLS}
              />
            </label>
          </>
        )}

        {(fetcher.data as { error?: string })?.error && (
          <p className="text-sm text-red-600 font-satoMedium">
            {(fetcher.data as { error?: string }).error}
          </p>
        )}
      </fetcher.Form>
    </Drawer>
  )
}

// ==================== FICHA FORM ====================

function FichaForm({
  customerId,
  fields,
  values: initial,
  fichaLabel,
  isOpen,
  onClose,
}: {
  customerId: string
  fields: TemplateField[]
  values: Record<string, unknown>
  fichaLabel: string
  isOpen: boolean
  onClose: () => void
}) {
  const fetcher = useFetcher()
  const busy = fetcher.state !== "idle"
  useCloseOnSuccess(fetcher, onClose)

  const reopenKey = useReopenKey(isOpen)
  const [values, setValues] = React.useState<Record<string, unknown>>(initial)
  const [prevKey, setPrevKey] = React.useState(reopenKey)
  if (prevKey !== reopenKey) {
    setPrevKey(reopenKey)
    setValues(initial)
  }
  const onChange = (id: string, v: unknown) =>
    setValues((prev) => ({ ...prev, [id]: v }))

  const formId = "exp-ficha-form"

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="big"
      title={`Editar ${fichaLabel.toLowerCase()}`}
      footer={
        <nav className={FOOTER_CLS}>
          <SecondaryButton type="button" onClick={onClose}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            form={formId}
            isDisabled={busy}
            className="h-12"
          >
            {busy ? "Guardando…" : "Guardar"}
          </PrimaryButton>
        </nav>
      }
    >
      <fetcher.Form
        key={reopenKey}
        id={formId}
        method="post"
        action="/api/customer-record?intent=save-intake"
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="customerId" value={customerId} />
        <input type="hidden" name="values" value={JSON.stringify(values)} />
        {fields.length === 0 ? (
          <p className="text-sm font-satoMedium text-brand_gray">
            Aún no hay campos. Usa “Configurar campos” para agregarlos.
          </p>
        ) : (
          <DynamicFields fields={fields} values={values} onChange={onChange} />
        )}
      </fetcher.Form>
    </Drawer>
  )
}

// ==================== CONFIGURATOR ====================

function Configurator({
  templates,
  tratamientoLabel,
  isOpen,
  onClose,
}: {
  templates: OrgRecordTemplates
  tratamientoLabel: string
  isOpen: boolean
  onClose: () => void
}) {
  const fetcher = useFetcher()
  const busy = fetcher.state !== "idle"
  const [scope, setScope] = React.useState<TemplateScope>("ficha")
  const [fields, setFields] = React.useState<TemplateField[]>(templates.ficha)

  // Al cambiar de scope, carga sus campos desde el template actual
  React.useEffect(() => {
    setFields(scope === "ficha" ? templates.ficha : templates.atencion)
  }, [scope, templates])

  // Reinicia al reabrir: vuelve al scope "ficha" y descarta cambios sin guardar
  const reopenKey = useReopenKey(isOpen)
  const [prevKey, setPrevKey] = React.useState(reopenKey)
  if (prevKey !== reopenKey) {
    setPrevKey(reopenKey)
    setScope("ficha")
    setFields(templates.ficha)
  }

  const update = (id: string, patch: Partial<TemplateField>) =>
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  const remove = (id: string) =>
    setFields((prev) => prev.filter((f) => f.id !== id))
  const add = () =>
    setFields((prev) => [
      ...prev,
      { id: newFieldId(), label: "", type: "texto" },
    ])

  const save = () => {
    const clean = fields.filter((f) => f.label.trim())
    fetcher.submit(
      { scope, fields: JSON.stringify(clean) },
      { method: "post", action: "/api/customer-record?intent=save-templates" },
    )
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="big"
      title="Configurar campos"
      footer={
        <nav className={FOOTER_CLS}>
          <SecondaryButton type="button" onClick={onClose}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton onClick={save} isDisabled={busy} className="h-12">
            {busy ? "Guardando…" : "Guardar"}
          </PrimaryButton>
        </nav>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Scope toggle — mismo estilo que las tabs de /planes */}
        <div className="relative flex bg-brand_pale rounded-full h-10">
          <motion.div
            className="absolute top-0 left-0 h-full w-1/2 bg-brand_dark rounded-full"
            animate={{ x: scope === "ficha" ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          {(["ficha", "atencion"] as TemplateScope[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`relative z-10 flex-1 rounded-full text-base font-semibold font-satoshi transition-colors duration-200 ${
                scope === s ? "text-white" : "text-[#B3B4B6]"
              }`}
            >
              {s === "ficha"
                ? "Ficha del cliente"
                : `${tratamientoLabel} / sesión`}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {fields.map((field) => (
            <div
              key={field.id}
              className="rounded-xl border border-brand_stroke p-3 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => update(field.id, { label: e.target.value })}
                  placeholder="Nombre del campo"
                  className="flex-1 h-10 rounded-lg border-gray-200 px-3 text-sm font-satoMedium text-brand_dark focus:border-brand_blue focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => remove(field.id)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-brand_gray hover:bg-red-50 hover:text-red-600 transition shrink-0"
                  aria-label="Eliminar campo"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={field.type}
                  onChange={(e) =>
                    update(field.id, { type: e.target.value as FieldType })
                  }
                  className="h-10 min-w-[180px] rounded-lg border-gray-200 pl-3 pr-8 text-sm font-satoMedium text-brand_dark focus:border-brand_blue focus:outline-none focus:ring-0"
                >
                  {FIELD_TYPE_LABELS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5 text-sm font-satoMedium text-brand_gray cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!field.required}
                    onChange={(e) =>
                      update(field.id, { required: e.target.checked })
                    }
                    className="w-4 h-4 rounded accent-brand_blue"
                  />
                  Requerido
                </label>
              </div>
              {(field.type === "select" || field.type === "multiselect") && (
                <input
                  type="text"
                  value={(field.options ?? []).join(", ")}
                  onChange={(e) =>
                    update(field.id, {
                      options: e.target.value
                        .split(",")
                        .map((o) => o.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Opciones separadas por coma"
                  className="h-10 rounded-lg border-gray-200 px-3 text-sm font-satoMedium text-brand_dark focus:border-brand_blue focus:outline-none focus:ring-0"
                />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={add}
            className="flex items-center justify-center gap-1 h-11 rounded-xl border border-dashed border-brand_stroke text-sm font-satoMedium text-brand_gray hover:border-brand_blue hover:text-brand_blue transition"
          >
            <FiPlus size={16} /> Agregar campo
          </button>
        </div>
      </div>
    </Drawer>
  )
}

// ==================== FICHA CARD ====================

function FichaCard({
  fields,
  values,
  fichaLabel,
  onEdit,
}: {
  fields: TemplateField[]
  values: Record<string, unknown>
  fichaLabel: string
  onEdit: () => void
}) {
  const filled = fields.filter(
    (f) => values[f.id] != null && values[f.id] !== "",
  )
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-base font-satoBold text-brand_dark">
          {fichaLabel}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-sm font-satoMedium text-brand_blue hover:underline"
        >
          <FiEdit2 size={15} /> Editar
        </button>
      </div>
      {filled.length === 0 ? (
        <p className="text-sm font-satoMedium text-brand_gray">
          Sin información. Pulsa “Editar” para llenar la ficha.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-y-5">
          {filled.map((field) => (
            <div key={field.id} className="min-w-0">
              <p className="text-sm font-satoMedium text-brand_gray">
                {field.label}
              </p>
              <p className="text-base font-satoMedium text-brand_dark whitespace-pre-wrap break-words">
                {displayValue(field, values[field.id])}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== ENTRY CARD ====================

function EntryCard({
  entry,
  atencionFields,
  tratamientoLabel,
  cita,
  onEdit,
  onDelete,
  deleting,
}: {
  entry: RecordEntry
  atencionFields: TemplateField[]
  tratamientoLabel: string
  cita?: ExpedienteCita | null
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const [confirm, setConfirm] = React.useState(false)
  const style = TYPE_STYLES[entry.type] ?? TYPE_STYLES.nota
  const typeLabel =
    entry.type === "tratamiento" ? tratamientoLabel : style.label
  const values = entry.metadata?.values ?? {}
  const shownFields = atencionFields.filter(
    (f) => values[f.id] != null && values[f.id] !== "",
  )

  return (
    <div className="relative pl-6">
      <span className="absolute left-0 top-1.5 w-3 h-3 rounded-full ring-4 ring-white">
        <span className={`block w-3 h-3 rounded-full ${style.dot}`} />
      </span>
      <div className="bg-white rounded-2xl p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-satoMedium px-2 py-0.5 rounded-full ${style.chip}`}
              >
                {typeLabel}
              </span>
              {cita && (
                <span className="inline-flex items-center gap-1 text-xs font-satoMedium px-2 py-0.5 rounded-full bg-brand_lime/30 text-lime-700">
                  <Calendar2 className="w-3 h-3" />
                  {cita.serviceTitle}
                </span>
              )}
              <span className="text-xs font-satoMedium text-brand_gray">
                {fmtDate(entry.performedAt)}
              </span>
            </div>
            {entry.title && (
              <h3 className="mt-2 text-base font-satoBold text-brand_dark">
                {entry.title}
              </h3>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className="w-8 h-8 rounded-full flex items-center justify-center text-brand_gray hover:bg-gray-100 transition"
              aria-label="Editar registro"
            >
              <FiEdit2 size={15} />
            </button>
            {confirm ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="h-8 px-2 rounded-full text-xs font-satoMedium text-red-600 hover:bg-red-50 transition disabled:opacity-50"
              >
                {deleting ? "..." : "Confirmar"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirm(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition"
                aria-label="Eliminar registro"
              >
                <FiTrash2 size={15} />
              </button>
            )}
          </div>
        </div>
        {entry.body && (
          <p className="mt-0 text-sm font-satoMedium text-brand_gray whitespace-pre-wrap">
            {entry.body}
          </p>
        )}
        {shownFields.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {shownFields.map((field) => (
              <div key={field.id} className="min-w-0">
                <p className="text-sm font-satoMedium text-brand_gray">
                  {field.label}
                </p>
                <p className="text-base font-satoMedium text-brand_dark whitespace-pre-wrap break-words">
                  {displayValue(field, values[field.id])}
                </p>
              </div>
            ))}
          </div>
        )}
        {entry.authorName && (
          <p className="mt-3 text-xs font-satoMedium text-brand_gray/70">
            Registrado por {entry.authorName}
          </p>
        )}
      </div>
    </div>
  )
}

// ==================== MAIN ====================

export function ClientExpediente({
  customerId,
  templates,
  fichaLabel,
  tratamientoLabel = "Tratamiento",
  intakeValues,
  entries,
  hasMore = false,
  linkedEventIds: linkedEventIdsProp = [],
  citas = [],
  form,
  setForm,
  configOpen,
  setConfigOpen,
}: {
  customerId: string
  templates: OrgRecordTemplates
  fichaLabel: string
  tratamientoLabel?: string
  intakeValues: Record<string, unknown>
  entries: RecordEntry[]
  hasMore?: boolean
  linkedEventIds?: string[]
  citas?: ExpedienteCita[]
  form: ExpedienteFormState
  setForm: (s: ExpedienteFormState) => void
  configOpen: boolean
  setConfigOpen: (open: boolean) => void
}) {
  const [fichaOpen, setFichaOpen] = React.useState(false)
  const citaById = React.useMemo(
    () => new Map(citas.map((c) => [c.id, c])),
    [citas],
  )
  // eventId ya ligados a un registro → no se ofrecen para otro (relación 1:1).
  // Viene del loader sin paginar para que el filtro sea correcto con "Ver más".
  const linkedEventIds = React.useMemo(
    () => new Set(linkedEventIdsProp),
    [linkedEventIdsProp],
  )

  // Paginación "Ver más": el loader trae la 1ª página; las siguientes se piden
  // a la API y se acumulan aquí (no cargamos todo de entrada).
  const [loaded, setLoaded] = React.useState<RecordEntry[]>(entries)
  const [more, setMore] = React.useState(hasMore)
  const prevEntries = React.useRef(entries)
  if (prevEntries.current !== entries) {
    // El loader revalidó (alta/edición/borrado) → reseteamos a la 1ª página
    prevEntries.current = entries
    setLoaded(entries)
    setMore(hasMore)
  }
  const moreFetcher = useFetcher<{
    entries?: RecordEntry[]
    hasMore?: boolean
  }>()
  React.useEffect(() => {
    const data = moreFetcher.data
    if (data?.entries) {
      setLoaded((prev) => [...prev, ...(data.entries ?? [])])
      setMore(!!data.hasMore)
    }
  }, [moreFetcher.data])
  const loadingMore = moreFetcher.state !== "idle"
  const loadMore = () =>
    moreFetcher.load(
      `/api/customer-record?customerId=${customerId}&skip=${loaded.length}&take=${RECORDS_PAGE_SIZE}`,
    )

  const deleteFetcher = useFetcher()
  const deletingId =
    deleteFetcher.state !== "idle"
      ? (deleteFetcher.formData?.get("entryId") as string)
      : null

  const handleDelete = (entryId: string) => {
    deleteFetcher.submit(
      { entryId },
      { method: "post", action: "/api/customer-record?intent=delete" },
    )
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Ficha (arriba en mobile, izquierda en web; sticky en desktop) */}
        <div className="lg:sticky lg:top-4">
          <FichaCard
            fields={templates.ficha}
            values={intakeValues}
            fichaLabel={fichaLabel}
            onEdit={() => setFichaOpen(true)}
          />
        </div>

        {/* Registros / timeline (derecha en web) */}
        <div className="lg:col-span-2">
          {loaded.length === 0 ? (
            <div className="bg-white rounded-2xl min-h-[260px] flex flex-col items-center justify-center text-center px-6 py-12">
              <img
                src="/images/illustrations/no-files.svg"
                alt=""
                className="mb-4 w-40 md:w-[200px]"
              />
              <p className="text-xl font-satoBold text-brand_dark">
                Sin registros en el expediente
              </p>
              <p className="mt-2 max-w-[420px] text-base font-satoshi text-brand_gray">
                Registra tratamientos, notas de evolución y resultados de este
                cliente para llevar su historial completo.
              </p>
              <PrimaryButton
                onClick={() => setForm({ open: true, editing: null })}
                className="mt-8 h-10 px-5 text-sm gap-1"
              >
                <FiPlus size={18} />
                <span>Nuevo registro</span>
              </PrimaryButton>
            </div>
          ) : (
            <div className="relative">
              <span className="absolute left-1.5 top-2 bottom-2 w-px bg-brand_stroke" />
              <div className="flex flex-col gap-4">
                {loaded.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    atencionFields={templates.atencion}
                    tratamientoLabel={tratamientoLabel}
                    cita={entry.eventId ? citaById.get(entry.eventId) : null}
                    deleting={deletingId === entry.id}
                    onEdit={() => setForm({ open: true, editing: entry })}
                    onDelete={() => handleDelete(entry.id)}
                  />
                ))}
              </div>
              {more && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="text-sm font-satoMedium text-brand_gray hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {loadingMore ? "Cargando…" : "Ver más"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drawers (montados siempre; el patrón isOpen del Drawer maneja la animación) */}
      <EntryForm
        customerId={customerId}
        atencionFields={templates.atencion}
        tratamientoLabel={tratamientoLabel}
        citas={citas}
        linkedEventIds={linkedEventIds}
        editing={form.editing}
        isOpen={form.open}
        onClose={() => setForm({ open: false, editing: null })}
      />
      <FichaForm
        customerId={customerId}
        fields={templates.ficha}
        values={intakeValues}
        fichaLabel={fichaLabel}
        isOpen={fichaOpen}
        onClose={() => setFichaOpen(false)}
      />
      <Configurator
        templates={templates}
        tratamientoLabel={tratamientoLabel}
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
      />
    </div>
  )
}
