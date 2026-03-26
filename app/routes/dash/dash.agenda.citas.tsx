import type { Customer, Event, Service } from "@prisma/client"
import { useEffect, useRef, useState } from "react"
import { FaRegClock } from "react-icons/fa6"
import { Link } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { DropdownMenu } from "~/components/common/DropDownMenu"
import { FilterChip } from "~/components/common/FilterChip"
import { Pagination } from "~/components/common/Pagination"
import { BasicInput } from "~/components/forms/BasicInput"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { SelectInput } from "~/components/forms/SelectInput"
import { Download } from "~/components/icons/download"
import { Settings } from "~/components/icons/settings"
import { MagnifyingGlass } from "~/components/icons/MagnifyingGlass"
import { db } from "~/utils/db.server"
import { ActionButton, ClientAvatar } from "./dash.clientes"
import type { Route } from "./+types/dash.agenda.citas"

type EventWithRelations = Event & {
  service: Service | null
  customer: Customer | null
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const [events, services] = await Promise.all([
    db.event.findMany({
      where: {
        orgId: org.id,
        archived: false,
        type: { not: "BLOCK" },
      },
      include: { service: true, customer: true },
      orderBy: { start: "desc" },
    }),
    db.service.findMany({
      where: { orgId: org.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return { events, services }
}

type Filters = {
  from: string
  to: string
  serviceId: string
  statuses: Set<string>
}

const EMPTY_FILTERS: Filters = {
  from: "",
  to: "",
  serviceId: "",
  statuses: new Set(),
}

export default function CitasPage({ loaderData }: Route.ComponentProps) {
  const { events, services } = loaderData
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilters(false)
    }
    if (showFilters) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showFilters])

  const filtered = events.filter((e) => {
    if (search) {
      const q = search.toLowerCase()
      const matchesSearch =
        e.customer?.displayName?.toLowerCase().includes(q) ||
        e.customer?.email?.toLowerCase().includes(q) ||
        e.service?.name?.toLowerCase().includes(q)
      if (!matchesSearch) return false
    }
    if (filters.from) {
      const from = new Date(filters.from)
      if (new Date(e.start) < from) return false
    }
    if (filters.to) {
      const to = new Date(filters.to)
      to.setHours(23, 59, 59, 999)
      if (new Date(e.start) > to) return false
    }
    if (filters.serviceId && e.serviceId !== filters.serviceId) return false
    if (filters.statuses.size > 0) {
      const variant = getStatusVariant(e.status)
      const payVariant = e.paid ? "paid" : "unpaid"
      if (!filters.statuses.has(variant) && !filters.statuses.has(payVariant))
        return false
    }
    return true
  })

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(() => {
    if (typeof window === "undefined") return 10
    const ROW_HEIGHT = 52 // py-3 + content
    const CHROME = 280 // breadcrumb + search + table header + pagination + layout padding
    const available = window.innerHeight - CHROME
    const fits = Math.floor(available / ROW_HEIGHT)
    // Snap to nearest option
    if (fits >= 50) return 50
    if (fits >= 25) return 25
    if (fits >= 15) return 15
    return 10
  })
  const totalFiltered = filtered.length
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  // Reset page when filters or search change
  useEffect(() => { setPage(1) }, [search, filters])

  const hasActiveFilters = filters.from !== "" || filters.to !== "" || filters.serviceId !== "" || filters.statuses.size > 0

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-brand_gray mb-6">
        <Link to="/dash/agenda" className="hover:text-brand_dark transition-colors">
          Mi agenda
        </Link>
        <span>{">"}</span>
        <span className="text-brand_dark font-satoMedium">Todas las citas</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
        <div className="relative w-full sm:max-w-80">
          <BasicInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder="Busca por nombre o correo"
            containerClassName="w-full"
            inputClassName="!rounded-full pl-4 pr-12 border-white font-satoshi py-4"
          />
          <MagnifyingGlass className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-brand_iron" />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={filterRef}>
            <ActionButton onClick={() => {
              setDraft({ ...filters, statuses: new Set(filters.statuses) })
              setShowFilters((v) => !v)
            }}>
              <Settings className="w-5 h-5" />
              {hasActiveFilters && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-brand_blue" />
              )}
            </ActionButton>
            {showFilters && (
              <FilterPopup
                draft={draft}
                setDraft={setDraft}
                services={services}
                hasActiveFilters={hasActiveFilters}
                onApply={() => {
                  setFilters(draft)
                  setShowFilters(false)
                }}
                onReset={() => {
                  setDraft(EMPTY_FILTERS)
                  setFilters(EMPTY_FILTERS)
                  setShowFilters(false)
                }}
              />
            )}
          </div>
          <ActionButton>
            <Download className="w-5 h-5" />
          </ActionButton>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block w-full overflow-x-auto rounded-2xl">
        <div className="min-w-[920px]">
          <div className={`${GRID} rounded-t-2xl border-b border-brand_stroke bg-white px-6 py-3 text-[12px] font-satoMedium text-brand_gray uppercase tracking-wide`}>
            <div className="text-left">Fecha</div>
            <div className="text-left">Cliente</div>
            <div className="text-left">Servicio</div>
            <div className="text-left">Encargado</div>
            <div className="text-left">Estatus</div>
            <div className="text-right" />
          </div>
          <div className="rounded-b-2xl bg-white divide-y divide-brand_stroke">
            {paginated.length > 0 ? (
              paginated.map((event) => (
                <CitaRow event={event} key={event.id} />
              ))
            ) : (
              <EmptyState search={search} onClear={() => setSearch("")} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="rounded-2xl bg-white overflow-hidden">
          <div className="px-4 py-3 grid grid-cols-2 gap-x-6 text-[10px] font-satoMedium text-brand_gray uppercase tracking-wide">
            <span>Fecha</span>
            <span className="text-right">Cliente</span>
          </div>
          <div className="divide-y divide-brand_stroke">
            {paginated.length > 0 ? (
              paginated.map((event) => (
                <div key={event.id} className="p-4">
                  <CitaCardMobile event={event} />
                </div>
              ))
            ) : (
              <EmptyState search={search} onClear={() => setSearch("")} />
            )}
          </div>
        </div>
      </div>

      {/* Paginación */}
      {totalFiltered > perPage && (
        <Pagination
          total={totalFiltered}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}
    </div>
  )
}

const GRID = "grid grid-cols-[150px_1.5fr_1fr_1fr_1fr_44px]"

const StatusTag = ({
  variant,
}: {
  variant: "confirmed" | "canceled" | "paid" | "unpaid" | "pending"
}) => {
  const styles = {
    confirmed: { bg: "bg-[#effbd0]", text: "text-[#4f7222]", label: "Confirmada", icon: "🔔" },
    canceled: { bg: "bg-[#f9e7eb]", text: "text-[#ab4265]", label: "Cancelada", icon: "🚫" },
    paid: { bg: "bg-[#d5faf1]", text: "text-[#2a645f]", label: "Pagada", icon: "💸" },
    unpaid: { bg: "bg-[#eef9fd]", text: "text-[#276297]", label: "Sin pagar", icon: "💰" },
    pending: { bg: "bg-[#fff8e1]", text: "text-[#8b6914]", label: "Reservada", icon: "📣" },
  } as const
  const style = styles[variant]
  return (
    <span className={`${style.bg} ${style.text} inline-flex items-center justify-center gap-1 px-2 py-[3px] rounded text-[12px] font-satoMedium whitespace-nowrap`}>
      <span>{style.icon}</span>{style.label}
    </span>
  )
}

function getStatusVariant(status: string): "confirmed" | "canceled" | "pending" {
  if (status === "CANCELLED" || status === "canceled") return "canceled"
  if (status === "confirmed" || status === "ACTIVE") return "confirmed"
  return "pending"
}


const AVATAR_COLORS = [
  "bg-brand_cloud",
  "bg-brand_yellow",
  "bg-brand_orange",
  "bg-brand_lime",
  "bg-brand_purple",
]

function getAvatarColor(name: string) {
  let hash = 0
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("")
}

function formatEventDate(start: Date) {
  const d = new Date(start)
  const day = d.getDate()
  const month = d.toLocaleDateString("es-MX", { month: "long" })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

function formatEventTime(start: Date, durationMin: number) {
  const d = new Date(start)
  const end = new Date(d.getTime() + durationMin * 60_000)
  const fmt = (date: Date) => {
    const h = date.getHours().toString().padStart(2, "0")
    const m = date.getMinutes().toString().padStart(2, "0")
    return `${h}:${m}`
  }
  return `${fmt(d)} a ${fmt(end)} hrs`
}

const CitaRow = ({ event }: { event: EventWithRelations }) => {
  const name = event.customer?.displayName || "Sin cliente"
  return (
  <div className={`${GRID} items-center px-6 py-3 hover:bg-slate-50 transition-colors`}>
    <div className="flex items-center gap-2">
      <span className="text-brand_gray"><FaRegClock /></span>
      <div className="flex flex-col leading-tight">
        <span className="text-[12px] font-satoMedium text-brand_gray">{formatEventDate(event.start)}</span>
        <span className="text-[10px] text-brand_iron">{formatEventTime(event.start, Number(event.duration))}</span>
      </div>
    </div>
    <div className="flex items-center gap-3 min-w-0">
      <ClientAvatar
        photoUrl={null}
        initials={getInitials(name)}
        size="md"
        className={getAvatarColor(name)}
      />
      <div className="min-w-0">
        <p className="text-sm font-satoBold text-brand_dark truncate">{name}</p>
        <p className="text-[12px] text-brand_gray truncate">{event.customer?.email || ""}</p>
      </div>
    </div>
    <div className="min-w-0">
      <p className="text-[14px] font-satoBold text-brand_dark truncate">{event.service?.name || "—"}</p>
    </div>
    <div className="min-w-0">
      <p className="text-[14px] font-satoMedium text-brand_gray truncate">{event.service?.employeeName || "—"}</p>
    </div>
    <div className="flex items-center gap-2">
      <StatusTag variant={getStatusVariant(event.status)} />
      <StatusTag variant={event.paid ? "paid" : "unpaid"} />
    </div>
    <div className="flex items-center justify-end">
      <DropdownMenu />
    </div>
  </div>
)
}

const CitaCardMobile = ({ event }: { event: EventWithRelations }) => {
  const name = event.customer?.displayName || "Sin cliente"
  return (
  <div>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-brand_gray shrink-0"><FaRegClock size={14} /></span>
          <span className="text-[12px] text-brand_gray">{formatEventDate(event.start)}</span>
        </div>
        <div className="flex items-center gap-3">
          <ClientAvatar
            photoUrl={null}
            initials={getInitials(name)}
            size="md"
            className={getAvatarColor(name)}
          />
          <div className="min-w-0">
            <p className="text-[13px] font-satoBold text-brand_dark truncate">{name}</p>
            <p className="text-[11px] text-brand_gray truncate">{event.service?.name || "—"}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <DropdownMenu />
        <div className="flex items-center gap-1">
          <StatusTag variant={getStatusVariant(event.status)} />
          <StatusTag variant={event.paid ? "paid" : "unpaid"} />
        </div>
      </div>
    </div>
  </div>
)
}

const STATUS_CHIPS = [
  { key: "confirmed", label: "Confirmada", icon: "🔔" },
  { key: "canceled", label: "Cancelada", icon: "🚫" },
  { key: "pending", label: "Reservada", icon: "📣" },
  { key: "unpaid", label: "Sin pagar", icon: "💰" },
  { key: "paid", label: "Pagada", icon: "💸" },
] as const

const FilterPopup = ({
  draft,
  setDraft,
  services,
  onApply,
  onReset,
  hasActiveFilters,
}: {
  draft: Filters
  setDraft: React.Dispatch<React.SetStateAction<Filters>>
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
        <span className="text-base font-satoMedium text-brand_dark">Por estatus</span>
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
          <SecondaryButton onClick={onReset} className="min-w-0 h-10 px-5 text-sm">
            Restablecer
          </SecondaryButton>
        )}
        <PrimaryButton onClick={onApply} className="min-w-0 min-h-0 h-10 px-5 text-sm">
          Aplicar
        </PrimaryButton>
      </div>
    </div>
  )
}

const EmptyState = ({ search, onClear }: { search: string; onClear: () => void }) => (
  <div className="py-16 flex flex-col items-center gap-3 text-center">
    {search ? (
      <>
        <MagnifyingGlass className="w-12 h-12 text-brand_gray" />
        <p className="font-satoMedium text-lg">Sin resultados para &quot;{search}&quot;</p>
        <button onClick={onClear} className="text-brand_blue text-sm underline underline-offset-2">
          Limpiar busqueda
        </button>
      </>
    ) : (
      <p className="text-brand_gray">No hay citas registradas</p>
    )}
  </div>
)
