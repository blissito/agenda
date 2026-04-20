import type { Dispatch, SetStateAction } from "react"
import { FilterChip } from "~/components/common/FilterChip"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { BasicInput } from "~/components/forms/BasicInput"
import { SelectInput } from "~/components/forms/SelectInput"

export type CitasFilters = {
  from: string
  to: string
  serviceId: string
  statuses: Set<string>
}

export const EMPTY_FILTERS: CitasFilters = {
  from: "",
  to: "",
  serviceId: "",
  statuses: new Set(),
}

const STATUS_CHIPS = [
  { key: "confirmed", label: "Confirmada", icon: "🔔" },
  { key: "canceled", label: "Cancelada", icon: "🚫" },
  { key: "pending", label: "Reservada", icon: "📣" },
  { key: "unpaid", label: "Sin pagar", icon: "💰" },
  { key: "paid", label: "Pagada", icon: "💸" },
] as const

export const CitasFilterPopup = ({
  draft,
  setDraft,
  services,
  onApply,
  onReset,
  hasActiveFilters,
}: {
  draft: CitasFilters
  setDraft: Dispatch<SetStateAction<CitasFilters>>
  services: { id: string; name: string }[]
  onApply: () => void
  onReset: () => void
  hasActiveFilters: boolean
}) => {
  const toggleStatus = (key: string) => {
    setDraft((prev) => {
      const next = new Set(prev.statuses)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return { ...prev, statuses: next }
    })
  }

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-[360px] bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-6">
      <h3 className="text-lg font-satoBold text-brand_dark">Filtros</h3>

      {/* Por fecha */}
      <div className="flex flex-col gap-2">
        <BasicInput
          name="from"
          type="date"
          label="Por fecha"
          placeholder="Desde"
          defaultValue={draft.from}
          onChange={(e) => setDraft((p) => ({ ...p, from: e.target.value }))}
          registerOptions={{ required: false }}
          inputClassName={draft.from ? "!text-brand_gray" : "!text-brand_iron"}
          containerClassName="!mb-0"
        />
        <BasicInput
          name="to"
          type="date"
          placeholder="Hasta"
          defaultValue={draft.to}
          onChange={(e) => setDraft((p) => ({ ...p, to: e.target.value }))}
          registerOptions={{ required: false }}
          inputClassName={draft.to ? "!text-brand_gray" : "!text-brand_iron"}
          containerClassName="!mb-0"
        />
      </div>

      {/* Por servicio */}
      <SelectInput
        label="Por servicio"
        name="serviceId"
        placeholder="Selecciona un servicio"
        value={draft.serviceId}
        onChange={(e) => setDraft((p) => ({ ...p, serviceId: e.target.value }))}
        options={services.map((s) => ({ value: s.id, title: s.name }))}
        registerOptions={{ required: false }}
      />

      {/* Por estatus */}
      <div className="flex flex-col gap-2">
        <span className="text-base font-satoMedium text-brand_dark">
          Por estatus
        </span>
        <div className="flex flex-wrap gap-2">
          {STATUS_CHIPS.map((chip) => (
            <FilterChip
              key={chip.key}
              icon={chip.icon}
              active={draft.statuses.has(chip.key)}
              onClick={() => toggleStatus(chip.key)}
            >
              {chip.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 mt-6">
        {hasActiveFilters && (
          <SecondaryButton
            onClick={onReset}
            className="min-w-0 h-10 px-5 text-sm"
          >
            Restablecer
          </SecondaryButton>
        )}
        <PrimaryButton
          onClick={onApply}
          className="min-w-0 min-h-0 h-10 px-5 text-sm"
        >
          Aplicar
        </PrimaryButton>
      </div>
    </div>
  )
}
