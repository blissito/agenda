import type { Customer, Event, Service } from "@prisma/client"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useFetcher } from "react-router"
import { twMerge } from "tailwind-merge"
import { DropdownMenu, MenuButton } from "~/components/common/DropDownMenu"
import { useOutsideClick } from "~/components/hooks/useOutsideClick"
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
  attended: { bg: "bg-[#e0f2fe]", text: "text-[#0369a1]", label: "Asistió", icon: "✅" },
  noshow: { bg: "bg-[#fef2f2]", text: "text-[#991b1b]", label: "No asistió", icon: "❌" },
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

// ── Date pill (calendar leaf) ──────────────────────────────────

const DatePill = ({ start, isPast }: { start: Date; isPast?: boolean }) => {
  const d = new Date(start)
  const monthShort = d
    .toLocaleDateString("es-MX", { month: "short" })
    .replace(".", "")
    .toUpperCase()
  const day = d.getDate()
  return (
    <div
      className={`inline-flex flex-col items-center justify-center w-[48px] rounded-lg py-1.5 ${
        isPast
          ? "bg-brand_stroke text-brand_dark"
          : "bg-brand_blue/10 text-brand_dark"
      }`}
    >
      <span className="text-[10px] font-satoMedium leading-tight">
        {monthShort}
      </span>
      <span className="text-lg font-satoBold leading-tight">{day}</span>
    </div>
  )
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

// ── Row menu (delete) ──────────────────────────────────────────

// Periodo de gracia: las citas se pueden eliminar hasta 2 días después de pasar.
const DELETE_GRACE_MS = 2 * 24 * 60 * 60 * 1000

export function canDeleteEvent(start: Date | string) {
  return Date.now() - new Date(start).getTime() < DELETE_GRACE_MS
}

const RowMenu = ({
  eventId,
  canDelete,
}: {
  eventId: string
  canDelete?: boolean
}) => {
  const fetcher = useFetcher()
  if (!canDelete) return null
  const handleDelete = () => {
    if (!window.confirm("¿Cancelar esta cita? Se eliminará de la agenda.")) return
    fetcher.submit(null, {
      method: "delete",
      action: `/api/events?intent=delete&eventId=${eventId}`,
    })
  }
  return (
    <DropdownMenu hideDefaultButton>
      <MenuButton onClick={handleDelete}>eliminar</MenuButton>
    </DropdownMenu>
  )
}

// ── Attendance dropdown (past events only) ─────────────────────

type AttendanceValue = "null" | "true" | "false"

const ATTENDANCE_OPTIONS: { value: AttendanceValue; label: string }[] = [
  { value: "null", label: "Por confirmar" },
  { value: "true", label: "Asistió" },
  { value: "false", label: "No asistió" },
]

const AttendanceDropdown = ({ event }: { event: CitaEvent }) => {
  const fetcher = useFetcher()
  const current =
    fetcher.formData?.get("attended") ?? String(event.attended)
  const value: AttendanceValue =
    current === "true" ? "true" : current === "false" ? "false" : "null"
  const currentLabel =
    ATTENDANCE_OPTIONS.find((o) => o.value === value)?.label ?? "Por confirmar"

  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useOutsideClick<HTMLDivElement>({
    isActive: open,
    onClickOutside: () => setOpen(false),
    keyboardListener: true,
  })

  useEffect(() => {
    if (!open || !btnRef.current) return
    const update = () => {
      if (!btnRef.current) return
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    update()
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [open])

  const handlePick = (next: AttendanceValue) => {
    setOpen(false)
    if (next === value) return
    const fd = new FormData()
    fd.set("eventId", event.id)
    fd.set("attended", next)
    fetcher.submit(fd, {
      method: "post",
      action: "/api/events?intent=mark_attendance",
    })
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer text-[12px] rounded-lg bg-white pl-3 pr-7 py-[4px] text-brand_gray border border-gray-200 outline-none focus:outline-none hover:bg-brand_blue/5 transition-colors bg-no-repeat text-left min-w-[120px]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'><path d='M1 1L5 5L9 1' stroke='%238A90A2' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
          backgroundPosition: "right 8px center",
          backgroundSize: "10px 6px",
        }}
      >
        {currentLabel}
      </button>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                style={{
                  position: "fixed",
                  top: pos.top,
                  left: pos.left,
                  width: pos.width,
                }}
                className="z-50 bg-white rounded-xl shadow-[0_8px_24px_rgba(16,24,40,0.12)] p-1 border-0 outline-none"
              >
                {ATTENDANCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handlePick(opt.value)}
                    className={twMerge(
                      "w-full text-left text-[12px] px-3 py-2 rounded-lg text-brand_gray hover:bg-brand_blue/5 transition-colors",
                      opt.value === value && "bg-brand_blue/5 text-brand_dark font-satoMedium",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}

// ── Table ───────────────────────────────────────────────────────

const GRID_WITH_CLIENT = "grid gap-x-4 grid-cols-[150px_1.5fr_1fr_1fr_90px_1fr_120px_44px]"
const GRID_NO_CLIENT = "grid gap-x-4 grid-cols-[150px_1fr_1fr_90px_90px_1fr_120px_44px]"

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
            <div className="text-left">Asistencia</div>
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
  const isPast = new Date(event.start) < new Date()
  const canDelete = canDeleteEvent(event.start)
  return (
    <div className={`${grid} items-center px-6 py-3 hover:bg-slate-50 transition-colors`}>
      <div className="flex items-center gap-2">
        <DatePill start={event.start} isPast={isPast} />
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
      <div className="flex items-center gap-2 flex-wrap">
        <StatusTag variant={getStatusVariant(event.status)} />
        <StatusTag variant={event.paid ? "paid" : "unpaid"} />
      </div>
      <div className="flex items-center">
        {isPast ? (
          <AttendanceDropdown event={event} />
        ) : (
          <span className="text-[12px] text-brand_iron">—</span>
        )}
      </div>
      <div className="flex items-center justify-end">
        <RowMenu eventId={event.id} canDelete={canDelete} />
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
  const isPast = new Date(event.start) < new Date()
  const canDelete = canDeleteEvent(event.start)
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <DatePill start={event.start} isPast={isPast} />
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
          <RowMenu eventId={event.id} canDelete={canDelete} />
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
      {isPast && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] font-satoMedium text-brand_gray uppercase tracking-wide">
            Asistencia
          </span>
          <AttendanceDropdown event={event} />
        </div>
      )}
    </div>
  )
}
