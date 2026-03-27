import type { Customer, Event, Service } from "@prisma/client"
import { FaRegClock } from "react-icons/fa6"
import { DropdownMenu } from "~/components/common/DropDownMenu"
import { ClientAvatar } from "~/routes/dash/dash.clientes"

export type CitaEvent = Event & {
  service: Service | null
  customer?: Customer | null
}

// ── Status helpers ──────────────────────────────────────────────

const STATUS_STYLES = {
  confirmed: { bg: "bg-[#effbd0]", text: "text-[#4f7222]", label: "Confirmada", icon: "🔔" },
  canceled: { bg: "bg-[#f9e7eb]", text: "text-[#ab4265]", label: "Cancelada", icon: "🚫" },
  paid: { bg: "bg-[#d5faf1]", text: "text-[#2a645f]", label: "Pagada", icon: "💸" },
  unpaid: { bg: "bg-[#eef9fd]", text: "text-[#276297]", label: "Sin pagar", icon: "💰" },
  pending: { bg: "bg-[#fff8e1]", text: "text-[#8b6914]", label: "Reservada", icon: "📣" },
} as const

type StatusVariant = keyof typeof STATUS_STYLES

const StatusTag = ({ variant }: { variant: StatusVariant }) => {
  const style = STATUS_STYLES[variant]
  return (
    <span className={`${style.bg} ${style.text} inline-flex items-center justify-center gap-1 px-2 py-[3px] rounded text-[12px] font-satoMedium whitespace-nowrap`}>
      <span>{style.icon}</span>{style.label}
    </span>
  )
}

export function getStatusVariant(status: string): "confirmed" | "canceled" | "pending" {
  if (status === "CANCELLED" || status === "canceled") return "canceled"
  if (status === "confirmed" || status === "ACTIVE") return "confirmed"
  return "pending"
}

// ── Format helpers ──────────────────────────────────────────────

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

// ── Avatar helpers ──────────────────────────────────────────────

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

// ── Table ───────────────────────────────────────────────────────

const GRID_WITH_CLIENT = "grid grid-cols-[150px_1.5fr_1fr_1fr_90px_1fr_44px]"
const GRID_NO_CLIENT = "grid grid-cols-[150px_1fr_1fr_90px_90px_1fr_44px]"

export const CitasTable = ({
  events,
  hideClient,
}: {
  events: CitaEvent[]
  hideClient?: boolean
}) => {
  const GRID = hideClient ? GRID_NO_CLIENT : GRID_WITH_CLIENT

  return (
    <section className="w-full">
      {/* Desktop */}
      <div className="hidden lg:block w-full overflow-x-auto rounded-2xl">
        <div className="min-w-[920px]">
          <div className={`${GRID} rounded-t-2xl border-b border-brand_stroke bg-white px-6 py-3 text-[12px] font-satoMedium text-brand_gray uppercase tracking-wide`}>
            <div className="text-left">Fecha</div>
            {!hideClient && <div className="text-left">Cliente</div>}
            <div className="text-left">Servicio</div>
            <div className="text-left">Encargado</div>
            {hideClient && <div className="text-left">Puntos</div>}
            <div className="text-left">Precio</div>
            <div className="text-left">Estatus</div>
            <div className="text-right" />
          </div>
          <div className="rounded-b-2xl bg-white divide-y divide-brand_stroke">
            {events.length > 0 ? (
              events.map((event) => (
                <CitaRow event={event} hideClient={hideClient} grid={GRID} key={event.id} />
              ))
            ) : (
              <p className="px-6 py-16 text-center text-brand_gray">No hay citas registradas</p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="rounded-2xl bg-white overflow-hidden">
          <div className="px-4 py-3 grid grid-cols-2 gap-x-6 text-[10px] font-satoMedium text-brand_gray uppercase tracking-wide">
            <span>Fecha</span>
            <span className="text-right">{hideClient ? "Servicio" : "Cliente"}</span>
          </div>
          <div className="divide-y divide-brand_stroke">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="p-4">
                  <CitaCardMobile event={event} hideClient={hideClient} />
                </div>
              ))
            ) : (
              <p className="px-4 py-16 text-center text-brand_gray">No hay citas registradas</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Row (desktop) ───────────────────────────────────────────────

const CitaRow = ({
  event,
  hideClient,
  grid,
}: {
  event: CitaEvent
  hideClient?: boolean
  grid: string
}) => {
  const name = event.customer?.displayName || "Sin cliente"
  return (
    <div className={`${grid} items-center px-6 py-3 hover:bg-slate-50 transition-colors`}>
      <div className="flex items-center gap-2">
        <span className="text-brand_gray"><FaRegClock /></span>
        <div className="flex flex-col leading-tight">
          <span className="text-[12px] font-satoMedium text-brand_gray">{formatEventDate(event.start)}</span>
          <span className="text-[10px] text-brand_iron">{formatEventTime(event.start, Number(event.duration))}</span>
        </div>
      </div>
      {!hideClient && (
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
      )}
      <div className="min-w-0">
        <p className="text-[14px] font-satoBold text-brand_dark truncate">{event.service?.name || "—"}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-satoMedium text-brand_gray truncate">{event.service?.employeeName || "—"}</p>
      </div>
      {hideClient && (
        <div>
          <p className="font-satoMedium text-[14px] text-brand_gray">
            {String(event.service?.points ?? 0)}
          </p>
        </div>
      )}
      <div>
        <p className="font-satoMedium text-[14px] text-brand_gray">
          {event.service ? `$${Number(event.service.price).toFixed(2)}` : "—"}
        </p>
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

// ── Card (mobile) ───────────────────────────────────────────────

const CitaCardMobile = ({
  event,
  hideClient,
}: {
  event: CitaEvent
  hideClient?: boolean
}) => {
  const name = event.customer?.displayName || "Sin cliente"
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand_gray shrink-0"><FaRegClock size={14} /></span>
            <span className="text-[12px] text-brand_gray">{formatEventDate(event.start)}</span>
          </div>
          {!hideClient ? (
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
          ) : (
            <p className="text-[13px] font-satoBold text-brand_dark truncate">{event.service?.name || "—"}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <DropdownMenu />
          <p className="text-[12px] font-satoMedium text-brand_gray tabular-nums">
            {event.service ? `$${Number(event.service.price).toFixed(2)}` : "—"}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <StatusTag variant={getStatusVariant(event.status)} />
        <StatusTag variant={event.paid ? "paid" : "unpaid"} />
        {hideClient && (
          <span className="text-[11px] text-brand_gray">{String(event.service?.points ?? 0)} pts</span>
        )}
      </div>
    </div>
  )
}
