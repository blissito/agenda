import {
  type CalendarEvent,
  completeWeek,
  Calendar,
  useCalendarControls,
  type CalendarView,
  isToday as isTodayFn,
} from "@hectorbliss/denik-calendar"
import { type Event as PrismaEvent } from "@prisma/client"
import { useEffect, useMemo, useRef, useState } from "react"
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5"
import { Link, useFetcher, useNavigate } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { AppointmentItem } from "~/components/dash/AppointmentItem"
import { Spinner } from "~/components/common/Spinner"
import { ClientFormDrawer } from "~/components/forms/ClientFormDrawer"
import { EventFormDrawer } from "~/components/forms/EventFormDrawer"
import { db } from "~/utils/db.server"
import { newEventSchema } from "~/utils/zod_schemas"
import type { Route } from "./+types/dash.agenda"

type EventWithService = PrismaEvent & {
  service: { name: string } | null
}

type OptimisticOp =
  | { type: "add"; event: EventWithService }
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

    await db.event.create({
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
        title: "Bloqueo",
        paid: false,
        duration: 60,
      },
    })
    return { success: true }
  }

  if (intent === "move_event") {
    const eventId = formData.get("eventId") as string
    const newStart = formData.get("newStart") as string

    await db.event.update({
      where: { id: eventId },
      data: { start: new Date(newStart) },
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

  // Set sunday to end of day to include all events on sunday
  const sundayEnd = new Date(sunday)
  sundayEnd.setHours(23, 59, 59, 999)

  const [events, customers, employees, services, upcomingEvents] =
    await Promise.all([
      db.event.findMany({
        where: {
          orgId: org.id,
          archived: false,
          start: { gte: monday, lte: sundayEnd },
        },
        include: { service: true },
      }),
      db.customer.findMany({ take: 1, where: { orgId: org.id } }),
      db.user.findMany({ take: 1, where: { orgId: org.id } }),
      db.service.findMany({ take: 1, where: { orgId: org.id } }),
      db.event.findMany({
        where: {
          orgId: org.id,
          archived: false,
          status: { not: "CANCELLED" },
          start: { gte: new Date() },
        },
        include: { service: true, customer: true },
        orderBy: { start: "asc" },
        take: 5,
      }),
    ])

  return {
    events,
    customers,
    services,
    employees,
    monday: monday.toISOString(),
    sunday: sunday.toISOString(),
    orgSlug: org.slug,
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
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function MiniCalendar({
  week,
  onDateClick,
}: {
  week: Date[]
  onDateClick: (date: Date) => void
}) {
  const [viewMonth, setViewMonth] = useState(
    () => new Date(week[0].getFullYear(), week[0].getMonth(), 1)
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
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <IoChevronBackOutline className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <IoChevronForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {MINI_DAY_LABELS.map((d) => (
          <span key={d} className="text-brand_gray py-1">{d}</span>
        ))}
        {days.map((d, i) => {
          const isCurrentMonth = d.getMonth() === currentMonth
          const today = isTodayFn(d)
          const inWeek = isInWeek(d)
          return (
            <button
              key={i}
              onClick={() => onDateClick(d)}
              className={`w-7 h-7 mx-auto rounded-full text-xs flex items-center justify-center transition-colors ${
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
  events: { id: string; customerName: string; serviceName: string; start: string; duration: number }[]
  orgSlug: string
}) {
  const formatTime = (iso: string) => {
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
        <span className="font-satoMedium text-brand_dark text-sm">Citas agendadas</span>
        <Link to="/dash/clientes" className="text-xs text-[#615FFF] underline">
          Ver todas
        </Link>
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
          <img    src="/images/emptyState/clients-empty.webp" className="w-full mb-4 " alt="" />
          <p className="font-satoBold text-brand_dark text-base">
            Aún no tienes citas agendadas
          </p>
          <p className="text-sm text-brand_gray mt-2 max-w-[200px]">
            Comparte tu sitio web y empieza a recibir a tus clientes
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://${orgSlug}.denik.me`)
            }}
            className="mt-4 flex items-center gap-2 border border-brand_stroke rounded-full px-4 py-2 text-sm text-brand_dark hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Copiar link
          </button>
        </div>
      )}
    </div>
  )
}

// ==================== CALENDAR CONTROLS ====================

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: "week", label: "Semanal" },
  { value: "day", label: "Diario" },
]

function AgendaControls({
  controls,
}: {
  controls: ReturnType<typeof useCalendarControls>
}) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const currentLabel = VIEW_OPTIONS.find((o) => o.value === controls.view)?.label ?? "Semanal"

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={controls.goToToday}
          disabled={controls.isToday}
          className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
            controls.isToday
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-brand_dark text-white hover:bg-brand_dark/90"
          }`}
        >
          Hoy
        </button>
        <button
          onClick={controls.goToPrev}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <IoChevronBackOutline className="w-4 h-4" />
        </button>
        <button
          onClick={controls.goToNext}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <IoChevronForward className="w-4 h-4" />
        </button>
        <span className="text-lg font-medium capitalize ml-2">{controls.label}</span>
      </div>
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 h-[48px] text-sm font-medium border border-brand_stroke rounded-full bg-white hover:shadow-sm transition-shadow"
        >
          {currentLabel}
          <svg
            className={`w-3 h-3 text-brand_gray transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-brand_stroke rounded-2xl shadow-lg z-20 min-w-[140px] p-1">
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  controls.toggleView(opt.value)
                  setOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
                  controls.view === opt.value
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

// ==================== MAIN PAGE ====================

export default function Page({ loaderData }: Route.ComponentProps) {
  const { events, customers, services, employees, monday, upcomingEvents, orgSlug } = loaderData
  const navigate = useNavigate()
  const mutationFetcher = useFetcher()
  const [editableEvent, setEditableEvent] =
    useState<Partial<PrismaEvent> | null>(null)
  const [optimisticOps, setOptimisticOps] = useState<OptimisticOp[]>([])

  const controls = useCalendarControls({
    initialDate: new Date(monday),
    initialView: "week",
    locale: "es-MX",
  })

  // Derive week from controls
  const week = controls.week

  // Sync navigation when controls date changes
  useEffect(() => {
    const w = completeWeek(controls.date)
    navigate(
      `/dash/agenda?monday=${w[0].toISOString()}&sunday=${w[6].toISOString()}`,
      { replace: true },
    )
  }, [controls.date])

  // Clear optimistic ops when mutation completes (loader revalidates automatically)
  useEffect(() => {
    if (mutationFetcher.state === "idle") {
      setOptimisticOps([])
    }
  }, [mutationFetcher.state])

  // Apply optimistic operations on top of loader data
  const displayEvents = useMemo(() => {
    let result = [...events] as EventWithService[]
    for (const op of optimisticOps) {
      if (op.type === "add") result.push(op.event)
      if (op.type === "remove") result = result.filter((e) => e.id !== op.eventId)
      if (op.type === "move")
        result = result.map((e) =>
          e.id === op.eventId ? { ...e, start: op.newStart } : e,
        )
    }
    return result
  }, [events, optimisticOps])

  // Map to CalendarEvent format
  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      displayEvents.map((e) => ({
        id: e.id,
        start: new Date(e.start),
        duration: Number(e.duration),
        title: e.title,
        type: e.type as "BLOCK" | "EVENT",
        service: e.service ? { name: e.service.name } : null,
        color: e.type === "BLOCK" ? undefined : "#FFD75E",
      })),
    [displayEvents],
  )

  const handleEventClick = (event: CalendarEvent) => {
    const fullEvent = displayEvents.find((e) => e.id === event.id)
    if (fullEvent) {
      setEditableEvent(fullEvent)
    }
  }

  const handleNewEvent = (date: Date) => {
    setEditableEvent({ start: date })
  }

  const handleEventMove = (eventId: string, newStart: Date) => {
    setOptimisticOps((prev) => [...prev, { type: "move", eventId, newStart }])
    mutationFetcher.submit(
      { intent: "move_event", eventId, newStart: newStart.toISOString() },
      { method: "POST" },
    )
  }

  const handleAddBlock = (start: Date) => {
    const tempBlock = {
      id: `temp-${Date.now()}`,
      start,
      duration: BigInt(60),
      type: "BLOCK",
      title: "Bloqueo",
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
    } as EventWithService
    setOptimisticOps((prev) => [...prev, { type: "add", event: tempBlock }])
    mutationFetcher.submit(
      { intent: "add_block", start: start.toISOString() },
      { method: "POST" },
    )
  }

  const handleRemoveBlock = (eventId: string) => {
    setOptimisticOps((prev) => [...prev, { type: "remove", eventId }])
    mutationFetcher.submit({ intent: "remove_block", eventId }, { method: "POST" })
  }

  const [showNewClientDrawer, setShowNewClientDrawer] = useState(false)
  const handleNewClientClick = () => {
    setShowNewClientDrawer(true)
  }

  const calendarRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = calendarRef.current?.querySelector(".text-sm.text-gray-500")
    if (el) {
      const short = new Intl.DateTimeFormat("es-MX", { timeZoneName: "short" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value
      el.textContent = short ?? ""
    }
  }, [controls.date])

  const handleMiniDateClick = (date: Date) => {
    controls.setDate(date)
  }

  return (
    <>
      <h1 className="text-3xl font-satoBold mb-2">Mi agenda</h1>
      {mutationFetcher.state !== "idle" && <Spinner />}
      <div className="flex gap-6">
        <div ref={calendarRef} className="flex-1 min-w-0">
          <AgendaControls controls={controls} />
          <Calendar
            onNewEvent={handleNewEvent}
            events={calendarEvents}
            date={controls.date}
            onEventClick={handleEventClick}
            onEventMove={handleEventMove}
            onAddBlock={handleAddBlock}
            onRemoveBlock={handleRemoveBlock}
            config={{
              hoursStart: 8,
              hoursEnd: 21,
              locale: "es-MX",
            }}
          />
        </div>
        <aside className="hidden xl:flex flex-col gap-6 w-[300px] shrink-0">
          <MiniCalendar week={week} onDateClick={handleMiniDateClick} />
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
      />
      <ClientFormDrawer
        onClose={() => setShowNewClientDrawer(false)}
        isOpen={showNewClientDrawer}
      />
    </>
  )
}
