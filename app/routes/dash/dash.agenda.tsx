import {
  Calendar,
  type CalendarEvent,
  completeWeek,
  isToday as isTodayFn,
  type Resource,
  useCalendarControls,
} from "@hectorbliss/denik-calendar"
import { type Event as PrismaEvent } from "@prisma/client"
import { useEffect, useMemo, useRef, useState } from "react"
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5"
import { useFetcher, useNavigate, useSearchParams } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import {
  branchEventFilter,
  getActiveBranchFromRequest,
} from "~/lib/branches.server"
import { ConfirmModal } from "~/components/common/ConfirmModal"
import { CopyLinkButton } from "~/components/common/CopyLinkButton"
import { AppointmentItem } from "~/components/dash/AppointmentItem"
import { UNASSIGNED_EMPLOYEE } from "~/components/dash/CitasFilter"
import {
  EventHoverCard,
  type EventHoverData,
} from "~/components/dash/agenda/EventHoverCard"
import { ClientFormDrawer } from "~/components/forms/ClientFormDrawer"
import { EventFormDrawer } from "~/components/forms/EventFormDrawer"
import { cancelEventFully } from "~/lib/event-cancel.server"
import { createMeetLink } from "~/lib/google-meet.server"
import { db } from "~/utils/db.server"
import { computeCalendarHoursRange, isHourOpen } from "~/utils/weekDays"
import { newEventSchema } from "~/utils/zod_schemas"
import type { Route } from "./+types/dash.agenda"

type AgendaView = "week" | "day" | "staff" | "month"

type EventWithRelations = PrismaEvent & {
  service: { name: string; employeeName: string | null } | null
  customer: { displayName: string; email: string; tel: string } | null
}

type OptimisticOp =
  | { type: "add"; event: EventWithRelations }
  | { type: "remove"; eventId: string }
  | { type: "move"; eventId: string; newStart: Date }

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "add_event") {
    const { org, user } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    const validData = newEventSchema.parse(
      JSON.parse(formData.get("data") as string),
    )

    const newEvent = await db.event.create({
      data: {
        ...validData,
        orgId: org.id,
        userId: user.id,
        title: "Nuevo evento",
        allDay: false,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "pending",
        type: "EVENT",
      },
    })

    // Create Google Meet link if connected
    if (
      org.googleCalendarToken &&
      validData.serviceId &&
      validData.customerId
    ) {
      console.log(
        "[Meet] Attempting Google Calendar event creation for org:",
        org.id,
      )
      const token = org.googleCalendarToken as any
      console.log(
        "[Meet] Token exists:",
        !!token,
        "expires_at:",
        token?.expires_at,
        "now:",
        Date.now(),
      )
      try {
        const [service, customer] = await Promise.all([
          db.service.findUnique({ where: { id: validData.serviceId } }),
          db.customer.findUnique({ where: { id: validData.customerId } }),
        ])
        console.log("[Meet] Service:", service?.id, "Customer:", customer?.id)
        if (service && customer) {
          const { meetingLink, calendarEventId } = await createMeetLink({
            org,
            event: newEvent,
            service,
            customer,
          })
          console.log(
            "[Meet] SUCCESS - meetingLink:",
            meetingLink,
            "calendarEventId:",
            calendarEventId,
          )
          await db.event.update({
            where: { id: newEvent.id },
            data: { meetingLink, calendarEventId },
          })
        } else {
          console.log("[Meet] Skipped - service or customer not found")
        }
      } catch (e) {
        console.error("[Meet] FAILED:", e instanceof Error ? e.message : e)
      }
    } else {
      console.log(
        "[Meet] Skipped - googleCalendarToken:",
        !!org.googleCalendarToken,
        "serviceId:",
        !!validData.serviceId,
        "customerId:",
        !!validData.customerId,
      )
    }
  }

  if (intent === "remove_block") {
    const id = formData.get("eventId") as string
    const block = await db.event.findUnique({ where: { id } })
    if (block?.type === "BLOCK") {
      await db.event.delete({ where: { id } })
    }
  }

  if (intent === "add_block") {
    const start = formData.get("start") as string
    const d = new Date(start)
    d.setMinutes(0)
    const { org, user } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    await db.event.create({
      data: {
        type: "BLOCK",
        start: d,
        orgId: org.id,
        userId: user.id,
        allDay: false,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "confirmed",
        title: "Bloqueado",
        paid: false,
        duration: 60,
      },
    })
    return { success: true }
  }

  if (intent === "delete_event") {
    const id = formData.get("eventId") as string
    const refunded = formData.get("refunded") === "true"
    const { org } = await getUserAndOrgOrRedirect(request)
    if (!org) return Response.json({ error: "Org not found" }, { status: 404 })
    await cancelEventFully({ eventId: id, orgId: org.id, refunded })
    return { success: true }
  }

  if (intent === "move_event") {
    const eventId = formData.get("eventId") as string
    const newStart = formData.get("newStart") as string
    const start = new Date(newStart)

    // Preserve duration: shift end relative to original event
    const existing = await db.event.findUnique({
      where: { id: eventId },
      select: { start: true, end: true },
    })
    const end = existing?.end
      ? new Date(start.getTime() + (existing.end.getTime() - existing.start.getTime()))
      : start

    const { updateEventFully } = await import("~/lib/event-update.server")
    await updateEventFully({
      eventId,
      changes: { start, end },
    })

    return { success: true }
  }

  return null
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request, {
    redirectURL: "/signup/1",
  })
  if (!org) {
    throw new Response("Organization not found", { status: 404 })
  }

  // Filtro de sede (null = "Todas las sucursales").
  const activeBranch = await getActiveBranchFromRequest(request, org.id)
  const branchFilter = branchEventFilter(activeBranch)

  const url = new URL(request.url)
  const mondayParam = url.searchParams.get("monday")
  const sundayParam = url.searchParams.get("sunday")

  let monday: Date
  let sunday: Date

  if (mondayParam && sundayParam) {
    monday = new Date(mondayParam)
    sunday = new Date(sundayParam)
  } else {
    const week = completeWeek(new Date())
    monday = week[0]
    sunday = week[6]
  }

  // `sunday` from client's completeWeek is local-Sunday-at-midnight, serialized
  // as UTC (e.g. Sun 06:00 UTC for Mexico). To cover the full local Sunday
  // (including late-evening events whose UTC date is already Monday), add 24h
  // minus 1ms rather than setHours(23,59,59) — which would set UTC hours and
  // cut off 6h of Sunday evening in UTC-6 locales.
  const sundayEnd = new Date(sunday.getTime() + 24 * 60 * 60 * 1000 - 1)

  // Month range for mini calendar dots (extend to cover full visible grid ~6 weeks)
  const monthStart = new Date(monday.getFullYear(), monday.getMonth(), 1)
  monthStart.setDate(monthStart.getDate() - 7) // include prev month tail
  const monthEnd = new Date(
    monday.getFullYear(),
    monday.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  )
  monthEnd.setDate(monthEnd.getDate() + 7) // include next month head

  const [
    events,
    customers,
    employees,
    services,
    upcomingEvents,
    monthEvents,
    orgUsers,
  ] = await Promise.all([
    db.event.findMany({
      where: {
        orgId: org.id,
        archived: false,
        start: { gte: monday, lte: sundayEnd },
        ...branchFilter,
      },
      include: { service: true, customer: true },
    }),
    db.customer.findMany({ where: { orgId: org.id } }),
    // Incluye colaboradores multi-org (ligados vía orgIds) además del owner.
    db.user.findMany({
      where: { OR: [{ orgIds: { has: org.id } }, { orgId: org.id }] },
    }),
    db.service.findMany({ where: { orgId: org.id, archived: false } }),
    db.event.findMany({
      where: {
        orgId: org.id,
        archived: false,
        type: { not: "BLOCK" },
        status: { not: "CANCELLED" },
        start: { gte: new Date() },
        ...branchFilter,
      },
      include: { service: true, customer: true },
      orderBy: { start: "asc" },
      take: 5,
    }),
    db.event.findMany({
      where: {
        orgId: org.id,
        archived: false,
        type: { not: "BLOCK" },
        start: { gte: monthStart, lte: monthEnd },
        ...branchFilter,
      },
      select: { start: true },
    }),
    db.user.findMany({
      where: { orgId: org.id },
      select: { id: true, displayName: true },
    }),
  ])

  const orgWeekDays = org.weekDays as Record<string, any> | null
  const [hoursStart, hoursEnd] = computeCalendarHoursRange(orgWeekDays)

  return {
    events,
    customers,
    services,
    employees,
    monday: monday.toISOString(),
    sunday: sunday.toISOString(),
    orgSlug: org.slug,
    weekDays: orgWeekDays,
    hoursStart,
    hoursEnd,
    isGoogleCalendarConnected: Boolean(org.googleCalendarToken),
    isZoomConnected: Boolean(org.zoomToken),
    employeeMap: Object.fromEntries(
      orgUsers.map((u) => [u.id, u.displayName ?? ""]),
    ),
    monthEventDates: monthEvents.map((e) => e.start.toISOString()),
    upcomingEvents: upcomingEvents.map((e) => ({
      id: e.id,
      title: e.title,
      customerName: e.customer?.displayName ?? "Sin cliente",
      serviceName: e.service?.name ?? "",
      start: e.start.toISOString(),
      duration: Number(e.duration),
    })),
  }
}

// ==================== SIDEBAR COMPONENTS ====================

const MINI_DAY_LABELS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"]
const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

function MiniCalendar({
  week,
  onDateClick,
  eventDates,
}: {
  week: Date[]
  onDateClick: (date: Date) => void
  eventDates: Set<string>
}) {
  const [viewMonth, setViewMonth] = useState(
    () => new Date(week[0].getFullYear(), week[0].getMonth(), 1),
  )
  // Build days grid starting from Monday
  const days = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
    const last = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0)
    // getDay(): 0=Sun. We want Monday=0, so offset = (getDay()+6)%7
    const leftOffset = (first.getDay() + 6) % 7
    const start = new Date(first)
    start.setDate(start.getDate() - leftOffset)
    const result: Date[] = []
    const d = new Date(start)
    while (result.length < 35 || (result.length < 42 && d <= last)) {
      result.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return result
  }, [viewMonth])
  const currentMonth = viewMonth.getMonth()

  const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  const weekKeys = new Set(week.map(toDateKey))

  const isInWeek = (d: Date) => weekKeys.has(toDateKey(d))

  return (
    <div className="bg-white rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-satoMedium text-brand_dark text-sm">
          {MONTH_NAMES[currentMonth]} {viewMonth.getFullYear()}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() =>
              setViewMonth(
                new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
              )
            }
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <IoChevronBackOutline className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              setViewMonth(
                new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
              )
            }
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <IoChevronForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {MINI_DAY_LABELS.map((d) => (
          <span key={d} className="text-brand_gray py-1">
            {d}
          </span>
        ))}
        {days.map((d, i) => {
          const isCurrentMonth = d.getMonth() === currentMonth
          const today = isTodayFn(d)
          const inWeek = isInWeek(d)
          const hasEvent = eventDates.has(toDateKey(d))
          return (
            <button
              key={i}
              onClick={() => onDateClick(d)}
              className="flex flex-col items-center mx-auto"
            >
              <span
                className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-colors ${
                  today
                    ? "bg-brand_blue text-white"
                    : inWeek
                      ? "bg-brand_blue/10 text-brand_dark font-medium"
                      : isCurrentMonth
                        ? "text-brand_dark hover:bg-gray-100"
                        : "text-brand_gray/40"
                }`}
              >
                {d.getDate()}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full -mt-[4px] ${
                  hasEvent ? "bg-brand_yellow" : "bg-transparent"
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function UpcomingAppointments({
  events,
  orgSlug,
}: {
  events: {
    id: string
    customerName: string
    serviceName: string
    start: string
    duration: number
  }[]
  orgSlug: string
}) {
  const _formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
  }
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" })
  }

  return (
    <div className="bg-white rounded-2xl p-5 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <span className="font-satoMedium text-brand_dark text-base">
          Citas agendadas
        </span>
        <a
          href="/dash/agenda/citas"
          className="text-xs text-[#615FFF] underline"
        >
          Ver todas
        </a>
      </div>
      {events.length > 0 ? (
        <div className="overflow-y-auto flex-1">
          {events.map((e) => (
            <AppointmentItem
              key={e.id}
              service={e.serviceName}
              client={e.customerName}
              date={formatDate(e.start)}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <img
            src="/images/emptyState/clients-empty.webp"
            className="w-40 md:w-[200px] mb-4"
            alt=""
          />
          <p className="font-satoBold text-brand_dark text-xl">
            Aún no tienes citas agendadas
          </p>
          <p className="text-base text-brand_gray mt-2 max-w-[200px]">
            Comparte tu sitio web y empieza a recibir a tus clientes
          </p>
          <div className="mt-8">
            <CopyLinkButton url={`https://${orgSlug}.denik.me`} />
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== CALENDAR CONTROLS ====================

const VIEW_OPTIONS: { value: AgendaView; label: string }[] = [
  { value: "week", label: "Semanal" },
  { value: "day", label: "Diario" },
  { value: "month", label: "Mensual" },
  { value: "staff", label: "Staff" },
]

function AgendaControls({
  controls,
  viewMode,
  onViewChange,
}: {
  controls: ReturnType<typeof useCalendarControls>
  viewMode: AgendaView
  onViewChange: (view: AgendaView) => void
}) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const currentLabel =
    VIEW_OPTIONS.find((o) => o.value === viewMode)?.label ?? "Semanal"

  const handlePrev = () => {
    if (viewMode === "month") {
      const d = new Date(controls.date)
      d.setMonth(d.getMonth() - 1)
      controls.setDate(d)
    } else {
      controls.goToPrev()
    }
  }

  const handleNext = () => {
    if (viewMode === "month") {
      const d = new Date(controls.date)
      d.setMonth(d.getMonth() + 1)
      controls.setDate(d)
    } else {
      controls.goToNext()
    }
  }

  const label =
    viewMode === "month"
      ? `${MONTH_NAMES[controls.date.getMonth()]} ${controls.date.getFullYear()}`
      : controls.label

  return (
    <div className="flex items-center justify-between py-2 md:py-3 gap-2">
      <div className="flex items-center gap-1 md:gap-2 min-w-0">
        <button
          onClick={controls.goToToday}
          disabled={controls.isToday}
          className={`px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-full border transition-colors shrink-0 ${
            controls.isToday
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-brand_dark text-white hover:bg-brand_dark/90"
          }`}
        >
          Hoy
        </button>
        <div className="flex items-center -space-x-1 md:space-x-0 shrink-0">
          <button
            onClick={handlePrev}
            className="p-1 md:p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <IoChevronBackOutline className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1 md:p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <IoChevronForward className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
        <span className="text-sm md:text-lg font-medium capitalize ml-1 md:ml-2 truncate">
          {label}
        </span>
      </div>
      <div ref={dropdownRef} className="relative shrink-0">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 md:gap-2 px-3 md:px-4 h-[40px] md:h-[48px] text-xs md:text-sm font-medium border border-brand_stroke rounded-full bg-white hover:shadow-sm transition-shadow"
        >
          {currentLabel}
          <svg
            className={`w-3 h-3 text-brand_gray transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 9l6 6 6-6"
            />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-brand_stroke rounded-2xl shadow-lg z-50 min-w-[140px] p-1">
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onViewChange(opt.value)
                  setOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
                  viewMode === opt.value
                    ? "bg-brand_blue/10 font-medium"
                    : "hover:bg-brand_blue/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== MONTH CALENDAR ====================

const MONTH_DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

function MonthCalendar({
  date,
  events,
  onEventClick,
  onDayClick,
}: {
  date: Date
  events: EventWithRelations[]
  onEventClick: (event: EventWithRelations) => void
  onDayClick: (date: Date) => void
}) {
  const days = useMemo(() => {
    const first = new Date(date.getFullYear(), date.getMonth(), 1)
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const leftOffset = (first.getDay() + 6) % 7
    const start = new Date(first)
    start.setDate(start.getDate() - leftOffset)
    const result: Date[] = []
    const d = new Date(start)
    while (result.length < 35 || (result.length < 42 && d <= last)) {
      result.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return result
  }, [date])

  const currentMonth = date.getMonth()

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventWithRelations[]>()
    for (const e of events) {
      const d = new Date(e.start)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    for (const [, dayEvents] of map) {
      dayEvents.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      )
    }
    return map
  }, [events])

  const toKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

  const MAX_VISIBLE = 3

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden flex flex-col min-h-[calc(100vh-13rem)]">
      <div className="grid grid-cols-7 border-b">
        {MONTH_DAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-3 text-center text-sm font-medium text-brand_gray"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: "1fr" }}>
        {days.map((d, i) => {
          const isCurrentMonth = d.getMonth() === currentMonth
          const today = isTodayFn(d)
          const dayEvents = eventsByDay.get(toKey(d)) || []
          const visible = dayEvents.slice(0, MAX_VISIBLE)
          const overflow = dayEvents.length - MAX_VISIBLE

          return (
            <div
              key={i}
              className={`border-b border-r p-1.5 ${
                !isCurrentMonth ? "bg-gray-50" : ""
              }`}
            >
              <button
                onClick={() => onDayClick(d)}
                className={`text-sm w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                  today
                    ? "bg-brand_blue text-white font-bold"
                    : isCurrentMonth
                      ? "text-brand_dark hover:bg-gray-100"
                      : "text-brand_gray/40"
                }`}
              >
                {d.getDate()}
              </button>
              <div className="space-y-0.5">
                {visible.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onEventClick(e)}
                    className={`w-full text-left text-[11px] leading-tight px-1.5 py-0.5 rounded truncate ${
                      e.type === "BLOCK"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-[#FFD75E]/30 text-brand_dark"
                    }`}
                  >
                    {new Date(e.start).toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    {e.type === "BLOCK"
                      ? e.title
                      : e.customer?.displayName || e.title}
                  </button>
                ))}
                {overflow > 0 && (
                  <button
                    onClick={() => onDayClick(d)}
                    className="text-[11px] text-brand_blue px-1.5"
                  >
                    +{overflow} más
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== MAIN PAGE ====================

export default function Page({ loaderData }: Route.ComponentProps) {
  const {
    events,
    customers,
    services,
    employees,
    upcomingEvents,
    orgSlug,
    monthEventDates,
    employeeMap,
    weekDays,
    hoursStart,
    hoursEnd,
    isGoogleCalendarConnected,
    isZoomConnected,
  } = loaderData
  const navigate = useNavigate()
  const mutationFetcher = useFetcher()
  const [searchParams, setSearchParams] = useSearchParams()
  const [editableEvent, setEditableEvent] =
    useState<Partial<PrismaEvent> | null>(null)
  const [optimisticOps, setOptimisticOps] = useState<OptimisticOp[]>([])
  // Movimiento de drag&drop a la espera de confirmación del usuario
  const [pendingMove, setPendingMove] = useState<{
    eventId: string
    newStart: Date
  } | null>(null)

  // Open drawer with pre-selected customer from URL param
  useEffect(() => {
    const customerId = searchParams.get("customerId")
    if (customerId) {
      setEditableEvent({
        start: new Date(),
        customerId,
      } as Partial<PrismaEvent>)
      setSearchParams(
        (prev) => {
          prev.delete("customerId")
          return prev
        },
        { replace: true },
      )
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const controls = useCalendarControls({
    initialDate: new Date(),
    initialView: "week",
    locale: "es-MX",
  })
  const [viewMode, setViewMode] = useState<AgendaView>("week")
  // Filtro por encargado: solo aplica en la vista diaria
  const [employeeFilter, setEmployeeFilter] = useState("")

  const handleViewChange = (view: AgendaView) => {
    setViewMode(view)
    if (view === "week" || view === "day") {
      controls.setView(view)
    } else if (view === "staff") {
      // La vista Staff es de un solo día con columnas por colaborador.
      controls.setView("day")
    }
  }

  // Encargados distintos presentes en las citas de la semana cargada
  const encargados = useMemo(
    () =>
      Array.from(
        new Set(
          events
            .map((e) => e.service?.employeeName)
            .filter((n): n is string => !!n),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [events],
  )

  // Derive week from controls
  const week = controls.week

  // Sync navigation when controls date or viewMode changes.
  // Skip the first render: the loader already returned the correct week for the
  // URL (params or today's default), and navigating here would trigger a second
  // fetch whose range can drift by a day under UTC↔local timezone mismatches,
  // dropping events the server already fetched.
  const didInitNavSync = useRef(false)
  useEffect(() => {
    if (!didInitNavSync.current) {
      didInitNavSync.current = true
      return
    }
    // Normalize to local midnight so week/month boundaries don't drift across
    // the UTC day boundary just because the user happened to be browsing in
    // the evening. Without this, `completeWeek` preserves controls.date's
    // time-of-day, producing a Monday ISO like "Tue 03:52 UTC" for Mexico
    // evenings — which makes the loader's `start >= monday` query miss real
    // Monday events (stored as UTC timestamps).
    const dateForRange = new Date(controls.date)
    dateForRange.setHours(0, 0, 0, 0)
    if (viewMode === "month") {
      const monthStart = new Date(
        dateForRange.getFullYear(),
        dateForRange.getMonth(),
        1,
      )
      const monthEnd = new Date(
        dateForRange.getFullYear(),
        dateForRange.getMonth() + 1,
        0,
      )
      navigate(
        `/dash/agenda?monday=${monthStart.toISOString()}&sunday=${monthEnd.toISOString()}`,
        { replace: true },
      )
    } else {
      const w = completeWeek(dateForRange)
      navigate(
        `/dash/agenda?monday=${w[0].toISOString()}&sunday=${w[6].toISOString()}`,
        { replace: true },
      )
    }
  }, [controls.date, viewMode])

  // Clear optimistic ops when mutation completes (loader revalidates automatically)
  useEffect(() => {
    if (mutationFetcher.state === "idle") {
      setOptimisticOps([])
      setPendingMove(null)
    }
  }, [mutationFetcher.state])

  // Apply optimistic operations on top of loader data
  const displayEvents = useMemo(() => {
    let result = [...events] as EventWithRelations[]
    for (const op of optimisticOps) {
      if (op.type === "add") result.push(op.event)
      if (op.type === "remove")
        result = result.filter((e) => e.id !== op.eventId)
      if (op.type === "move")
        result = result.map((e) =>
          e.id === op.eventId ? { ...e, start: op.newStart } : e,
        )
    }
    return result
  }, [events, optimisticOps])

  // Filtro por encargado del servicio (employeeName): solo aplica en la vista
  // diaria. En semanal/staff/mensual se ignora y se muestran todas las citas.
  const visibleEvents = useMemo(() => {
    if (viewMode !== "day" || !employeeFilter) return displayEvents
    return displayEvents.filter((e) => {
      const name = e.service?.employeeName || ""
      if (employeeFilter === UNASSIGNED_EMPLOYEE) return !name
      return name === employeeFilter
    })
  }, [displayEvents, viewMode, employeeFilter])

  // Lookup map for full event data (used by hover card)
  const eventsMap = useMemo(() => {
    const map = new Map<string, EventWithRelations>()
    for (const e of visibleEvents) map.set(e.id, e)
    return map
  }, [visibleEvents])

  // Day view: single resource so Calendar renders one column.
  // Staff view: one resource column per colaborador (+ "Sin asignar").
  const isDayView = viewMode === "day"
  const isStaffView = viewMode === "staff"

  // Las citas se asignan a un staff por el "encargado" de su servicio
  // (Service.employeeName), no por Event.employeeId (que suele venir null).
  // ¿Hay citas en la semana cargada sin encargado?
  const hasUnassigned = useMemo(
    () =>
      isStaffView &&
      displayEvents.some((e) => e.type !== "BLOCK" && !e.service?.employeeName),
    [isStaffView, displayEvents],
  )

  // Recursos del calendario. En vista Staff las columnas son la unión del
  // equipo (colaboradores) y los encargados de servicios; las citas se agrupan
  // por Service.employeeName. Se añade "Sin asignar" si hay citas sin encargado.
  const calendarResources = useMemo<Resource[] | undefined>(() => {
    if (isDayView) return [{ id: "day", name: "" }]
    if (!isStaffView) return undefined
    const names = new Set<string>()
    for (const u of employees) {
      const n = (u.displayName || "").trim()
      if (n) names.add(n)
    }
    for (const s of services) {
      const n = (s.employeeName || "").trim()
      if (n) names.add(n)
    }
    const base: Resource[] = Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ id: name, name }))
    if (hasUnassigned) {
      base.push({ id: UNASSIGNED_EMPLOYEE, name: "Sin asignar" })
    }
    return base
  }, [isDayView, isStaffView, employees, services, hasUnassigned])

  // Foto de cada staff por nombre (para el encabezado de columna en vista Staff)
  const staffPhotos = useMemo(() => {
    const map: Record<string, string> = {}
    for (const u of employees) {
      const n = (u.displayName || "").trim()
      if (n && u.photoURL) map[n] = u.photoURL
    }
    return map
  }, [employees])

  // Map to CalendarEvent format
  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      visibleEvents.map((e) => ({
        id: e.id,
        start: new Date(e.start),
        duration: Number(e.duration),
        title: e.title,
        type: e.type as "BLOCK" | "EVENT",
        service: e.service ? { name: e.service.name } : null,
        color:
          e.type === "BLOCK"
            ? undefined
            : e.status === "confirmed"
              ? "#BFDD78"
              : "#FFD75E",
        ...(isDayView
          ? { resourceId: "day" }
          : isStaffView
            ? { resourceId: e.service?.employeeName || UNASSIGNED_EMPLOYEE }
            : {}),
      })),
    [visibleEvents, isDayView, isStaffView],
  )

  const handleEventClick = (event: CalendarEvent) => {
    const fullEvent = visibleEvents.find((e) => e.id === event.id)
    if (fullEvent) {
      setEditableEvent(fullEvent)
    }
  }

  const handleNewEvent = (date: Date) => {
    setEditableEvent({ start: date })
  }

  // Al soltar: mostramos el cambio de forma optimista pero NO lo guardamos.
  // El usuario debe confirmar (o cancelar) desde el toast.
  const handleEventMove = (eventId: string, newStart: Date) => {
    setOptimisticOps((prev) => [
      ...prev.filter((op) => !(op.type === "move" && op.eventId === eventId)),
      { type: "move", eventId, newStart },
    ])
    setPendingMove({ eventId, newStart })
  }

  const confirmMove = () => {
    if (!pendingMove) return
    mutationFetcher.submit(
      {
        intent: "move_event",
        eventId: pendingMove.eventId,
        newStart: pendingMove.newStart.toISOString(),
      },
      { method: "POST" },
    )
    setPendingMove(null)
  }

  const cancelMove = () => {
    if (!pendingMove) return
    // Revertimos: quitamos la op optimista para que la cita vuelva a su lugar
    setOptimisticOps((prev) =>
      prev.filter(
        (op) => !(op.type === "move" && op.eventId === pendingMove.eventId),
      ),
    )
    setPendingMove(null)
  }

  const handleAddBlock = (start: Date) => {
    const tempBlock = {
      id: `temp-${Date.now()}`,
      start,
      duration: BigInt(60),
      type: "BLOCK",
      title: "Bloqueado",
      status: "confirmed",
      allDay: false,
      archived: false,
      paid: false,
      orgId: "",
      userId: "",
      serviceId: null,
      customerId: null,
      employeeId: null,
      end: null,
      stripe_session_id: null,
      stripe_payment_intent_id: null,
      mp_preference_id: null,
      mp_payment_id: null,
      payment_method: null,
      notes: null,
      reminderSentAt: null,
      surveySentAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      service: null,
    } as EventWithRelations
    setOptimisticOps((prev) => [...prev, { type: "add", event: tempBlock }])
    mutationFetcher.submit(
      { intent: "add_block", start: start.toISOString() },
      { method: "POST" },
    )
  }

  const handleRemoveBlock = (eventId: string) => {
    setOptimisticOps((prev) => [...prev, { type: "remove", eventId }])
    mutationFetcher.submit(
      { intent: "remove_block", eventId },
      { method: "POST" },
    )
  }

  const [confirmDelete, setConfirmDelete] = useState<{
    id: string
    customerName: string
    paid: boolean
  } | null>(null)
  const [refundOnCancel, setRefundOnCancel] = useState(false)
  const handleRemoveEvent = (eventId: string) => {
    setHoveredEventId(null)
    const full = eventsMap.get(eventId)
    setRefundOnCancel(false)
    setConfirmDelete({
      id: eventId,
      customerName: full?.customer?.displayName ?? "el cliente",
      paid: !!full?.paid,
    })
  }
  const handleConfirmDelete = () => {
    if (!confirmDelete) return
    setOptimisticOps((prev) => [
      ...prev,
      { type: "remove", eventId: confirmDelete.id },
    ])
    mutationFetcher.submit(
      {
        intent: "delete_event",
        eventId: confirmDelete.id,
        refunded: confirmDelete.paid && refundOnCancel ? "true" : "false",
      },
      { method: "POST" },
    )
    setConfirmDelete(null)
  }

  // Hover card state
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null)
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEventMouseEnter = (eventId: string, rect: DOMRect) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setHoveredEventId(eventId)
    setHoverRect(rect)
  }
  const handleEventMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredEventId(null), 150)
  }
  const handlePopoverMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
  }
  const handlePopoverMouseLeave = () => {
    setHoveredEventId(null)
  }

  const [showNewClientDrawer, setShowNewClientDrawer] = useState(false)
  const handleNewClientClick = () => {
    setShowNewClientDrawer(true)
  }

  const calendarRef = useRef<HTMLDivElement>(null)
  const [cellHeight, setCellHeight] = useState(64)

  // Measure available height and compute cellHeight to fill the calendar area
  useEffect(() => {
    const measure = () => {
      const container = calendarRef.current
      if (!container) return
      const article = container.querySelector("article") as HTMLElement | null
      if (!article) return
      // Available height = container height minus the controls above the calendar
      const containerRect = container.getBoundingClientRect()
      const articleRect = article.getBoundingClientRect()
      const headerSection = article.querySelector(
        "section:first-child",
      ) as HTMLElement | null
      const headerH = headerSection?.offsetHeight || 0
      const availableH = containerRect.bottom - articleRect.top - headerH
      const totalHours = Math.max(1, hoursEnd - hoursStart)
      const target = Math.max(64, Math.floor(availableH / totalHours))
      setCellHeight(target)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [viewMode, hoursStart, hoursEnd])

  // Paint cells outside business hours with a light gray background. The
  // Calendar lib doesn't expose a hook for this, so we walk the rendered grid
  // and apply inline styles. We target Column divs by their unique class
  // signature `.grid.relative` (TimeColumn uses `sticky left-0 z-10` and
  // headers use `grid place-items-center`, so neither match). Cells inside
  // each column have `role="button"` AND `border-dashed` — the inner
  // EmptyButton also has role=button but lacks `border-dashed`, so the
  // combined selector pinpoints the outer cells only. The optional now-line
  // is absolutely positioned without those classes — also excluded.
  // Inline style wins over Tailwind classes, surviving lib re-renders.
  useEffect(() => {
    const root = calendarRef.current
    if (!root) return
    if (viewMode === "month") return

    const isDay = viewMode === "day"
    const isStaff = viewMode === "staff"
    // En vista Staff todas las columnas son el mismo día (una por colaborador).
    const columnsDates = isStaff
      ? (calendarResources ?? []).map(() => controls.date)
      : isDay
        ? [controls.date]
        : week
    const closedColor = "rgba(227, 226, 226, 0.15)" // brand_ash/15

    const apply = () => {
      const columns = root.querySelectorAll<HTMLElement>(
        "section > div.grid.relative",
      )
      if (columns.length === 0) return
      const totalCells = hoursEnd - hoursStart
      columns.forEach((col, colIdx) => {
        const dayDate = columnsDates[colIdx]
        if (!dayDate) return
        const cells = col.querySelectorAll<HTMLElement>(
          ':scope > [role="button"].border-dashed',
        )
        for (let i = 0; i < totalCells; i++) {
          const cell = cells[i]
          if (!cell) continue
          const hour = hoursStart + i
          const open = isHourOpen(weekDays, dayDate, hour)
          // Must use `important` because app.css forces .bg-slate-50 to white
          // with !important, which would otherwise win over a normal inline.
          if (open) {
            cell.style.removeProperty("background-color")
          } else {
            cell.style.setProperty("background-color", closedColor, "important")
          }
        }
      })
    }

    apply()
    const raf = requestAnimationFrame(apply)
    const obs = new MutationObserver(apply)
    obs.observe(root, { childList: true, subtree: true })
    return () => {
      cancelAnimationFrame(raf)
      obs.disconnect()
    }
  }, [
    viewMode,
    controls.date,
    week,
    weekDays,
    hoursStart,
    hoursEnd,
    calendarResources,
  ])

  // Pin the timezone label inside Calendar — observer re-applies the short
  // form whenever the lib re-renders the long name internally.
  useEffect(() => {
    const root = calendarRef.current
    if (!root) return

    const tzShort =
      new Intl.DateTimeFormat("es-MX", { timeZoneName: "short" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value ?? ""

    const apply = () => {
      const el = root.querySelector(".text-sm.text-gray-500")
      if (el && el.textContent !== tzShort) el.textContent = tzShort
    }
    apply()

    const obs = new MutationObserver(apply)
    obs.observe(root, { childList: true, characterData: true, subtree: true })
    return () => obs.disconnect()
  }, [viewMode])

  const eventDateKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const iso of monthEventDates) {
      const d = new Date(iso)
      keys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
    }
    return keys
  }, [monthEventDates])

  const handleMiniDateClick = (date: Date) => {
    controls.setDate(date)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-8xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-satoBold mb-1 md:mb-2">
        Mi agenda
      </h1>

      <div className="flex gap-6 flex-1">
        <div ref={calendarRef} className="flex-1 min-w-0 flex flex-col">
          <AgendaControls
            controls={controls}
            viewMode={viewMode}
            onViewChange={handleViewChange}
          />
          {isDayView && encargados.length > 0 && (
            <div className="flex items-center gap-2 pb-2">
              <label
                htmlFor="employeeFilter"
                className="text-sm text-brand_gray shrink-0"
              >
                Encargado
              </label>
              <select
                id="employeeFilter"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="h-10 rounded-full border border-brand_stroke bg-white px-4 text-sm text-brand_dark focus:border-brand_blue focus:outline-none focus:ring-0"
              >
                <option value="">Todos</option>
                {encargados.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                <option value={UNASSIGNED_EMPLOYEE}>Sin asignar</option>
              </select>
            </div>
          )}
          {viewMode === "month" ? (
            <MonthCalendar
              date={controls.date}
              events={displayEvents}
              onEventClick={(e) => setEditableEvent(e)}
              onDayClick={(d) => {
                controls.setDate(d)
                handleViewChange("day")
              }}
            />
          ) : (
            <Calendar
              onNewEvent={handleNewEvent}
              events={calendarEvents}
              date={controls.date}
              resources={calendarResources}
              onEventClick={handleEventClick}
              onEventMove={handleEventMove}
              onAddBlock={handleAddBlock}
              onRemoveBlock={handleRemoveBlock}
              config={{
                hoursStart,
                hoursEnd,
                cellHeight,
                locale: "es-MX",
                renderColumnHeader: isStaffView
                  ? ({ resource }) => {
                      const name = resource?.name || "Sin asignar"
                      const photo = resource
                        ? staffPhotos[resource.id]
                        : undefined
                      return (
                        <p className="grid place-items-center gap-1 py-1">
                          {photo ? (
                            <img
                              src={photo}
                              alt={name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand_blue/10 text-sm font-bold text-brand_blue">
                              {(name.trim()[0] || "?").toUpperCase()}
                            </span>
                          )}
                          <span className="max-w-[140px] truncate px-1 text-sm font-medium text-brand_dark">
                            {name}
                          </span>
                        </p>
                      )
                    }
                  : isDayView
                    ? ({ date, isToday, locale }) => (
                        <p className="grid place-items-center">
                          <span className="text-sm text-gray-500">
                            {date.toLocaleDateString(locale, {
                              weekday: "short",
                            })}
                          </span>
                          <span
                            className={`text-2xl font-bold ${
                              isToday
                                ? "bg-brand_blue text-white rounded-full w-10 h-10 flex items-center justify-center"
                                : ""
                            }`}
                          >
                            {date.getDate()}
                          </span>
                        </p>
                      )
                    : undefined,
                renderEvent: ({ event, isDragging }) => {
                  const full = eventsMap.get(event.id)
                  const isBlock = event.type === "BLOCK"
                  const primary = isBlock
                    ? event.title
                    : full?.customer?.displayName || event.title
                  const secondary = isBlock ? null : full?.service?.name
                  return (
                    <div
                      className="w-full relative grid place-content-start gap-y-0 overflow-hidden text-xs text-left pl-3 pr-1 py-1 rounded-lg shadow-sm"
                      style={{
                        height: "98%",
                        backgroundColor: event.color || "#FFD75E",
                      }}
                      onMouseEnter={(e) => {
                        if (!isDragging)
                          handleEventMouseEnter(
                            event.id,
                            e.currentTarget.getBoundingClientRect(),
                          )
                      }}
                      onMouseLeave={handleEventMouseLeave}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 rounded-l-lg pointer-events-none" />
                      <span className="font-medium truncate text-brand_dark">
                        {primary}
                      </span>
                      {secondary && (
                        <span className="text-brand_gray truncate text-[10px]">
                          {secondary}
                        </span>
                      )}
                    </div>
                  )
                },
              }}
            />
          )}
        </div>
        <aside className="hidden xl:flex flex-col gap-6 w-[300px] shrink-0">
          <MiniCalendar
            week={week}
            onDateClick={handleMiniDateClick}
            eventDates={eventDateKeys}
          />
          <UpcomingAppointments events={upcomingEvents} orgSlug={orgSlug} />
        </aside>
      </div>
      <EventFormDrawer
        services={services}
        employees={employees}
        customers={customers}
        onClose={() => setEditableEvent(null)}
        event={editableEvent as PrismaEvent}
        isOpen={!!editableEvent}
        onNewClientClick={handleNewClientClick}
        isGoogleCalendarConnected={isGoogleCalendarConnected}
        isZoomConnected={isZoomConnected}
      />
      <ClientFormDrawer
        onClose={() => setShowNewClientDrawer(false)}
        isOpen={showNewClientDrawer}
      />
      {/* Hover card rendered at page level to avoid overflow clipping */}
      {hoveredEventId &&
        hoverRect &&
        (() => {
          const full = eventsMap.get(hoveredEventId)
          if (!full) return null
          const hoverData: EventHoverData = {
            customerName: full.customer?.displayName,
            serviceName: full.service?.name,
            employeeName: full.employeeId
              ? employeeMap[full.employeeId]
              : undefined,
            phone: full.customer?.tel,
            email: full.customer?.email,
            notes: full.notes ?? undefined,
            status: full.status,
            paid: full.paid,
            meetingLink: full.meetingLink,
            videoProvider: full.videoProvider,
          }
          const showAbove = hoverRect.top > 320
          return (
            <div
              className="fixed z-50"
              style={{
                top: showAbove ? hoverRect.top - 8 : hoverRect.bottom + 8,
                left: hoverRect.left,
                transform: showAbove ? "translateY(-100%)" : undefined,
              }}
              onMouseEnter={handlePopoverMouseEnter}
              onMouseLeave={handlePopoverMouseLeave}
            >
              <EventHoverCard
                data={hoverData}
                onEdit={() => {
                  setEditableEvent(full)
                  setHoveredEventId(null)
                }}
                onDelete={() => {
                  handleRemoveEvent(full.id)
                  setHoveredEventId(null)
                }}
              />
            </div>
          )
        })()}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Seguro que quieres cancelar esta cita? 🫣"
        description={
          <>
            Al cancelar, la cita será eliminada de la agenda. Enviaremos una
            notificación a{" "}
            <span className="font-satoBold">
              {confirmDelete?.customerName ?? "el cliente"}
            </span>
            .
          </>
        }
        confirmText="Sí, cancelar"
        cancelText="Volver"
        variant="danger"
      >
        {confirmDelete?.paid && (
          <label className="mt-6 flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={refundOnCancel}
              onChange={(e) => setRefundOnCancel(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-brand_blue cursor-pointer"
            />
            <span className="text-sm text-brand_dark text-left">
              Realizaré un reembolso al cliente
              <span className="block text-xs text-brand_gray mt-0.5">
                Si lo marcas, esta venta no contará en tus ingresos.
              </span>
            </span>
          </label>
        )}
      </ConfirmModal>
      {pendingMove && (
        <div className="fixed bottom-6 left-0 right-0 z-[600] flex justify-center pointer-events-none">
          <div className="px-4 py-3 bg-white text-brand_dark rounded-2xl shadow-lg flex items-center gap-4 max-w-[90vw] pointer-events-auto border border-gray-100">
            <div className="text-sm">
              <p className="font-medium">¿Mover la cita a este horario?</p>
              <p className="text-xs text-brand_gray mt-0.5 capitalize">
                {pendingMove.newStart.toLocaleString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={cancelMove}
                className="px-3 py-1.5 text-sm font-medium text-brand_gray hover:text-brand_dark rounded-full transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmMove}
                className="px-4 py-1.5 text-sm font-medium text-white bg-brand_blue rounded-full hover:opacity-90 transition-opacity"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
