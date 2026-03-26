import type { Customer, Event, Service } from "@prisma/client"
import { useState } from "react"
import { FaRegClock } from "react-icons/fa6"
import { Link, useLoaderData } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { DropdownMenu } from "~/components/common/DropDownMenu"
import { BasicInput } from "~/components/forms/BasicInput"
import { MagnifyingGlass } from "~/components/icons/MagnifyingGlass"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/dash.agenda.citas"

type EventWithRelations = Event & {
  service: Service | null
  customer: Customer | null
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const events = await db.event.findMany({
    where: {
      orgId: org.id,
      archived: false,
      type: { not: "BLOCK" },
    },
    include: { service: true, customer: true },
    orderBy: { start: "desc" },
  })

  return { events }
}

export default function CitasPage({ loaderData }: Route.ComponentProps) {
  const { events } = loaderData
  const [search, setSearch] = useState("")

  const filtered = events.filter((e) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      e.customer?.displayName?.toLowerCase().includes(q) ||
      e.customer?.email?.toLowerCase().includes(q) ||
      e.service?.name?.toLowerCase().includes(q)
    )
  })

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
      </div>

      {/* Desktop */}
      <div className="hidden lg:block w-full overflow-x-auto rounded-2xl">
        <div className="min-w-[920px]">
          <div className={`${GRID} rounded-t-2xl border border-brand_stroke bg-white px-6 py-3 text-[12px] font-satoMedium text-brand_gray uppercase tracking-wide`}>
            <div className="text-left">Fecha</div>
            <div className="text-left">Cliente</div>
            <div className="text-left">Servicio</div>
            <div className="text-left">Encargado</div>
            <div className="text-left">Estatus</div>
            <div className="text-right" />
          </div>
          <div className="rounded-b-2xl border-x border-b border-brand_stroke bg-white">
            {filtered.length > 0 ? (
              filtered.map((event) => (
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
        <div className="rounded-2xl border border-brand_stroke bg-white overflow-hidden">
          <div className="px-4 py-3 grid grid-cols-2 gap-x-6 text-[10px] font-satoMedium text-brand_gray uppercase tracking-wide">
            <span>Fecha</span>
            <span className="text-right">Cliente</span>
          </div>
          <div className="h-px bg-brand_stroke" />
          <div className="divide-y divide-brand_stroke">
            {filtered.length > 0 ? (
              filtered.map((event) => (
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
    confirmed: { bg: "bg-[#effbd0]", text: "text-[#4f7222]", label: "Confirmada" },
    canceled: { bg: "bg-[#f9e7eb]", text: "text-[#ab4265]", label: "Cancelada" },
    paid: { bg: "bg-[#d5faf1]", text: "text-[#2a645f]", label: "Pagada" },
    unpaid: { bg: "bg-[#eef9fd]", text: "text-[#276297]", label: "Sin pagar" },
    pending: { bg: "bg-[#fff8e1]", text: "text-[#8b6914]", label: "Reservada" },
  } as const
  const style = styles[variant]
  return (
    <span className={`${style.bg} ${style.text} inline-flex items-center justify-center px-2 py-[3px] rounded text-[12px] font-satoMedium whitespace-nowrap`}>
      {style.label}
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
  <div className={`${GRID} items-center px-6 py-3 border-t border-brand_stroke hover:bg-slate-50 transition-colors`}>
    <div className="flex items-center gap-2">
      <span className="text-brand_gray"><FaRegClock /></span>
      <div className="flex flex-col leading-tight">
        <span className="text-[12px] font-satoMedium text-brand_gray">{formatEventDate(event.start)}</span>
        <span className="text-[10px] text-brand_iron">{formatEventTime(event.start, Number(event.duration))}</span>
      </div>
    </div>
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-satoBold text-white shrink-0 ${getAvatarColor(name)}`}>
        {getInitials(name)}
      </div>
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
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-satoBold text-white shrink-0 ${getAvatarColor(name)}`}>
            {getInitials(name)}
          </div>
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
