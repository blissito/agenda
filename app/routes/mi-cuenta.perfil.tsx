import {
  Calendar,
  type CalendarEvent,
  useCalendarControls,
} from "@hectorbliss/denik-calendar"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Form, redirect } from "react-router"
import { getUserOrNull } from "~/.server/userGetters"
import { destroySession, getSession } from "~/sessions"
import { Avatar } from "~/components/common/Avatar"
import { TabButton } from "~/components/common/TabButton"
import { type CitaEvent, getStatusVariant } from "~/components/dash/CitasTable"
import { DropdownMenu, MenuButton } from "~/components/common/DropDownMenu"
import { FaRegCalendarCheck } from "react-icons/fa6"
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5"
import { TbCalendarCancel, TbList } from "react-icons/tb"
import { ReviewStar } from "~/components/icons/reviewStar"
import { Calendar2 } from "~/components/icons/calendar2"
import { EventHoverCard, type EventHoverData } from "~/components/dash/agenda/EventHoverCard"
import { FiClock, FiPhone } from "react-icons/fi"
import { EditPen } from "~/components/icons/editPen"
import { Trash } from "~/components/icons/trash"
import { Mail } from "~/components/icons/mail"
import { MapPin } from "~/components/icons/mapPin"
import { Phone } from "~/components/icons/phone"
import {
  getCustomerPortalData,
  type PortalLoyalty,
  type PortalOrgInfo,
} from "~/lib/customer-portal.server"
import SelectStylized from "~/components/ui/select"
import type { Route } from "./+types/mi-cuenta.perfil"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await getUserOrNull(request)
  if (!user) throw redirect("/mi-cuenta")
  const data = await getCustomerPortalData(user.email)
  return { user, data }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  if (formData.get("intent") === "logout") {
    const session = await getSession(request.headers.get("Cookie"))
    return redirect("/mi-cuenta", {
      headers: { "Set-Cookie": await destroySession(session) },
    })
  }
  return null
}

const TABS = [
  { id: "upcoming", label: "Proximas citas" },
  { id: "history", label: "Historial" },
  { id: "comments", label: "Comentarios" },
  { id: "favorites", label: "Negocios favoritos" },
  { id: "loyalty", label: "Lealtad" },
] as const

type TabId = (typeof TABS)[number]["id"]

export default function MiCuenta({ loaderData }: Route.ComponentProps) {
  const { user, data } = loaderData
  const [activeTab, setActiveTab] = useState<TabId>("upcoming")
  const [orgFilter, setOrgFilter] = useState<string>("all")
  const [upcomingView, setUpcomingView] = useState<"calendar" | "table">("calendar")
  const [cellHeight, setCellHeight] = useState(64)

  useEffect(() => {
    const update = () => setCellHeight(window.innerWidth < 768 ? 40 : 64)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const controls = useCalendarControls({
    initialDate: new Date(),
    initialView: "week",
    locale: "es-MX",
  })

  const filterByOrg = (events: CitaEvent[]) => {
    if (!data || orgFilter === "all") return events
    return events.filter((e) => data.eventOrgMap[e.id] === orgFilter)
  }

  const filteredUpcoming = useMemo(
    () => filterByOrg(data?.upcoming ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, orgFilter],
  )
  const filteredPast = useMemo(
    () => filterByOrg(data?.past ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, orgFilter],
  )

  const orgById = useMemo(() => {
    if (!data) return new Map<string, PortalOrgInfo>()
    return new Map(data.orgs.map((o) => [o.id, o]))
  }, [data])

  const getOrgForEvent = (event: CitaEvent) =>
    data ? orgById.get(data.eventOrgMap[event.id]) ?? null : null

  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      filteredUpcoming.map((e) => ({
        id: e.id,
        start: new Date(e.start),
        duration: Number(e.duration),
        title: e.service?.name ?? "Cita",
        type: "EVENT" as const,
        service: e.service ? { name: e.service.name } : null,
        color: e.status === "CONFIRMED" || e.status === "confirmed"
          ? "#BFDD78"
          : "#FFD75E",
      })),
    [filteredUpcoming],
  )

  // Inject timezone abbreviation into the calendar (same as dash/agenda)
  const calendarRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const inject = () => {
      const el = calendarRef.current?.querySelector(".text-sm.text-gray-500")
      if (el) {
        const short = new Intl.DateTimeFormat("es-MX", { timeZoneName: "short" })
          .formatToParts(new Date())
          .find((p) => p.type === "timeZoneName")?.value
        el.textContent = short ?? ""
      }
    }
    inject()
    // Retry after render in case Calendar DOM isn't ready yet
    const raf = requestAnimationFrame(inject)
    return () => cancelAnimationFrame(raf)
  }, [controls.date, upcomingView, activeTab])

  // Hover card state for calendar events
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

  // Lookup map for hover data
  const eventsMap = useMemo(() => {
    const map = new Map<string, CitaEvent>()
    for (const e of filteredUpcoming) map.set(e.id, e)
    return map
  }, [filteredUpcoming])

  // Mobile bottom sheet state (tap on event)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedEventId) {
      document.documentElement.style.overflow = "hidden"
      document.body.style.overflow = "hidden"
    } else {
      document.documentElement.style.overflow = ""
      document.body.style.overflow = ""
    }
    return () => {
      document.documentElement.style.overflow = ""
      document.body.style.overflow = ""
    }
  }, [selectedEventId])

  return (
    <div className="min-h-screen relative pb-8 bg-brand_light_gray">
      {/* Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[164px] sm:h-[240px] rounded-b-2xl overflow-hidden z-0">
        <img
          src="https://i.imgur.com/w038IV9.jpg"
          alt="header background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4 sm:px-6">
        {/* Top bar spacer */}
        <div className="pt-6 mb-10 sm:mb-16 flex items-center justify-between">
          <h2 className="text-white text-sm font-satoMedium">Mi cuenta</h2>
          <Form method="post">
            <button
              type="submit"
              name="intent"
              value="logout"
              className="text-white/80 hover:text-white text-sm font-satoMedium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogoutIcon />
              Cerrar sesion
            </button>
          </Form>
        </div>

        {/* Profile Card */}
        <div className="relative mt-8">
          {/* DESKTOP: Avatar absolute + mask */}
          <div className="hidden sm:block absolute -top-4 left-0 z-10">
            <Avatar
              image={user.photoURL}
              className="w-[120px] h-[120px] ml-0 border-4 border-transparent"
            />
          </div>

          {/* Card */}
          <div
            className="
              bg-white rounded-2xl pt-6 pb-6 px-4 sm:px-6 sm:pt-8 relative
              sm:[mask-image:radial-gradient(circle_75px_at_60px_44px,transparent_74px,black_75px)]
              sm:[--webkit-mask-image:radial-gradient(circle_75px_at_60px_44px,transparent_74px,black_75px)]
            "
            style={{
              WebkitMaskImage: "var(--webkit-mask-image)",
              maskImage: "var(--webkit-mask-image)",
            }}
          >
            {/* MOBILE layout: centered avatar, name, info, stats */}
            <div className="sm:hidden flex flex-col items-center text-center">
              <Avatar
                image={user.photoURL}
                className="w-20 h-20 border-4 border-white shadow-md -mt-16"
              />
              <div className="flex items-center gap-2 mt-3">
                <h1 className="text-xl font-satoBold text-brand_dark">
                  {data?.displayName ?? user.displayName ?? "Mi cuenta"}
                </h1>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full border border-brand_stroke flex items-center justify-center text-brand_gray hover:bg-gray-50 transition"
                  aria-label="Editar"
                >
                  <EditPen fill="#4B5563" className="w-4 h-4" />
                </button>
              </div>

              {/* Contact info */}
              <div className="flex flex-col gap-2 mt-3 text-sm w-full items-center">
                <div className="flex items-center gap-2">
                  <Mail className="text-brand_gray shrink-0" />
                  <span className="text-[14px] font-satoMedium text-brand_gray truncate">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="text-brand_gray shrink-0" />
                  <span className="text-[14px] font-satoMedium text-brand_gray">
                    {data?.tel || "----"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="text-brand_gray shrink-0" />
                  <span className="text-[14px] font-satoMedium text-brand_gray">
                    ----
                  </span>
                </div>
              </div>

              {/* Stats */}
              {data && (
                <>
                  <div className="border-t border-brand_stroke w-full my-4" />
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div>
                      <p className="text-xl font-satoBold text-brand_dark">
                        {data.stats.eventCount}{" "}
                        <span className="text-sm">
                          {data.stats.eventCount === 1 ? "cita" : "citas"}
                        </span>
                      </p>
                      {data.stats.since && (
                        <p className="text-xs font-satoMedium text-brand_gray">
                          desde el {data.stats.since}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xl font-satoBold text-brand_dark">0</span>
                        <span className="text-brand_yellow">⭐</span>
                      </div>
                      <p className="text-xs font-satoMedium text-brand_gray">reseñas</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* DESKTOP layout: original horizontal */}
            <div className="hidden sm:flex flex-row items-stretch">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6 pl-[150px]">
                  <h1 className="text-2xl font-satoBold text-brand_dark">
                    {data?.displayName ?? user.displayName ?? "Mi cuenta"}
                  </h1>
                  <button
                    type="button"
                    className="ml-auto mr-6 w-9 h-9 rounded-full border border-brand_stroke flex items-center justify-center text-brand_gray hover:bg-gray-50 transition"
                    aria-label="Editar"
                  >
                    <EditPen fill="#4B5563" className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-x-10 text-sm mt-4 pl-[150px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="text-brand_gray shrink-0" />
                    <span className="text-[14px] font-satoMedium text-brand_gray leading-[20px] truncate">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="text-brand_gray shrink-0" />
                    <span className="text-[14px] font-satoMedium text-brand_gray leading-[20px]">
                      {data?.tel || "----"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin className="text-brand_gray mt-0.5 shrink-0" />
                    <span className="text-[14px] font-satoMedium text-brand_gray leading-[20px]">
                      ----
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {data && (
                <div className="border-l border-brand_stroke pl-6 min-w-[180px]">
                  <div className="mb-4">
                    <p className="text-2xl font-satoBold text-brand_dark">
                      {data.stats.eventCount}{" "}
                      <span>{data.stats.eventCount === 1 ? "cita" : "citas"}</span>
                    </p>
                    {data.stats.since && (
                      <p className="text-xs font-satoMedium text-brand_gray">
                        desde el {data.stats.since}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-satoBold text-brand_dark">0</span>
                      <span className="text-brand_yellow">⭐</span>
                    </div>
                    <p className="text-xs font-satoMedium text-brand_gray">reseñas</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mt-8 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Filters bar */}
        {(activeTab === "upcoming" || activeTab === "history") && data && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Week controls */}
            {activeTab === "upcoming" && upcomingView === "calendar" && filteredUpcoming.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={controls.goToToday}
                  disabled={controls.isToday}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors shrink-0 ${
                    controls.isToday
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-brand_dark text-white hover:bg-brand_dark/90"
                  }`}
                >
                  Hoy
                </button>
                <button
                  onClick={controls.goToPrev}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <IoChevronBackOutline className="w-4 h-4" />
                </button>
                <button
                  onClick={controls.goToNext}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <IoChevronForward className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium capitalize ml-1 truncate">
                  {controls.label}
                </span>
              </div>
            )}

            {/* Select + view toggle — same row on desktop, wraps on mobile */}
            <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
              {data.orgs.length > 1 &&
                (activeTab === "upcoming"
                  ? data.upcoming.length > 0
                  : data.past.length > 0) && (
                  <SelectStylized
                    choices={[
                      { value: "all", label: "Todos los negocios" },
                      ...data.orgs.map((org) => ({
                        value: org.id,
                        label: org.name,
                      })),
                    ]}
                    value={orgFilter}
                    onChange={(value) => setOrgFilter(value)}
                    placeholder="Todos los negocios"
                    className="w-[240px]"
                    inputClassName="rounded-full border-0"
                  />
                )}
              {activeTab === "upcoming" && filteredUpcoming.length > 0 && (
                <div className="flex items-center bg-white rounded-full h-12 p-1 ml-auto sm:ml-0">
              
                  <button
                    type="button"
                    onClick={() => setUpcomingView("calendar")}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                      upcomingView === "calendar"
                        ? "bg-brand_blue text-white"
                        : "text-brand_gray hover:text-brand_dark"
                    }`}
                    title="Vista calendario"
                  >
                    <Calendar2 className="w-[22px] h-[22px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpcomingView("table")}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                      upcomingView === "table"
                        ? "bg-brand_blue text-white"
                        : "text-brand_gray hover:text-brand_dark"
                    }`}
                    title="Vista tabla"
                  >
                    <TbList size={22} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab content */}
        <div className="mt-4 relative">
          {activeTab === "upcoming" && upcomingView === "calendar" && filteredUpcoming.length > 0 && (
            <img src="/images/nik.svg" alt="calendar" className="w-16 h-16 absolute -top-14 left-1/2 hidden md:block" />
          )}
          {!data ? (
            <EmptyState />
          ) : activeTab === "upcoming" ? (
            filteredUpcoming.length === 0 ? (
              <EmptyState />
            ) : upcomingView === "calendar" ? (
              <div ref={calendarRef} className="bg-white rounded-2xl overflow-hidden relative portal-calendar">
                <Calendar
                  events={calendarEvents}
                  date={controls.date}
                  config={{
                    hoursStart: 8,
                    hoursEnd: 21,
                    cellHeight,
                    locale: "es-MX",
                    renderEvent: ({ event }) => {
                      const full = eventsMap.get(event.id)
                      const org = full ? getOrgForEvent(full) : null
                      return (
                        <div
                          className="w-full h-full relative grid place-content-start gap-y-0 overflow-hidden text-xs text-left pl-3 pr-1 py-1 rounded-lg shadow-sm cursor-pointer"
                          style={{ backgroundColor: event.color || "#FFD75E" }}
                          onClick={() => setSelectedEventId(event.id)}
                          onMouseEnter={(e) =>
                            handleEventMouseEnter(event.id, e.currentTarget.getBoundingClientRect())
                          }
                          onMouseLeave={handleEventMouseLeave}
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20 rounded-l-lg pointer-events-none" />
                          <span className="font-medium truncate text-brand_dark">{event.title}</span>
                          <span className="text-brand_gray truncate text-[10px]">{org?.name}</span>
                        </div>
                      )
                    },
                  }}
                />
                {/* Desktop hover card */}
                {hoveredEventId && hoverRect && (() => {
                  const full = eventsMap.get(hoveredEventId)
                  if (!full) return null
                  const hoverData = buildEventHoverData(full, getOrgForEvent(full))
                  const showAbove = hoverRect.top > 320
                  return (
                    <div
                      className="hidden lg:block fixed z-50"
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
                        hidePayment
                        onEdit={() => setHoveredEventId(null)}
                        onDelete={() => setHoveredEventId(null)}
                      />
                    </div>
                  )
                })()}
              </div>

            ) : (
              <PortalEventList events={filteredUpcoming} getOrg={getOrgForEvent} />
            )
          ) : activeTab === "history" ? (
            filteredPast.length === 0 ? (
              <EmptyState />
            ) : (
              <PortalEventList events={filteredPast} getOrg={getOrgForEvent} isPast />
            )
          ) : activeTab === "comments" ? (
            <EmptyState
              title="Ayuda a otros con tus experiencias"
              subtitle="Cuando visites un negocio, deja tu reseña y compártelo con la comunidad."
            />
          ) : activeTab === "favorites" ? (
            <FavoritesTab orgs={data.orgs} />
          ) : activeTab === "loyalty" ? (
            <LoyaltyTab loyalty={data.loyalty} />
          ) : null}
        </div>
      </div>

      {/* Mobile bottom sheet for calendar event details */}
      <AnimatePresence>
        {selectedEventId && (() => {
          const full = eventsMap.get(selectedEventId)
          if (!full) return null
          const sheetData = buildEventHoverData(full, getOrgForEvent(full))
          return (
            <motion.div
              key="event-sheet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/30 z-[60]"
              onClick={() => setSelectedEventId(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                drag="y"
                dragConstraints={{ top: 0 }}
                dragElastic={0.2}
                onDragEnd={(_e, info) => {
                  if (info.offset.y > 80 || info.velocity.y > 300) {
                    setSelectedEventId(null)
                  }
                }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl safe-bottom touch-none"
              >
                <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
                <div className="px-5 pb-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-satoBold text-brand_dark text-lg">
                        {sheetData.customerName}
                      </p>
                      <p className="text-sm text-brand_gray">
                        {sheetData.serviceName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedEventId(null)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <EditPen fill="#4B5563" className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setSelectedEventId(null)}
                        className="p-2 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash fill="#CA5757" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-sm text-brand_gray">
                    {sheetData.time && (
                      <div className="flex items-center gap-3">
                        <FiClock className="w-5 h-5 text-gray-400 shrink-0" />
                        <span>{sheetData.time}</span>
                      </div>
                    )}
                    {sheetData.phone && (
                      <div className="flex items-center gap-3">
                        <FiPhone className="w-5 h-5 text-gray-400 shrink-0" />
                        <span>{sheetData.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mt-4">
                    <MobileStatusTag status={sheetData.status ?? "pending"} />
                    <MobileStatusTag status={sheetData.paid ? "paid" : "unpaid"} />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}

// ==================== LOYALTY TAB ====================

function LoyaltyTab({ loyalty }: { loyalty: PortalLoyalty[] }) {
  if (loyalty.length === 0) {
    return (
      <EmptyState
        title="Acumula puntos con cada visita"
        subtitle="Los negocios que visites pueden premiarte con puntos, descuentos y recompensas."
      />
    )
  }

  return (
    <div className="grid gap-4">
      {loyalty.map((l) => (
        <LoyaltyCard key={l.org.id} loyalty={l} />
      ))}
    </div>
  )
}

function LoyaltyCard({ loyalty }: { loyalty: PortalLoyalty }) {
  const progress = loyalty.nextLevel
    ? Math.min(
        100,
        (loyalty.totalEarned /
          (loyalty.totalEarned + loyalty.nextLevel.pointsNeeded)) *
          100,
      )
    : 100

  return (
    <div className="bg-white rounded-2xl p-6">
      {/* Org header */}
      <div className="flex items-center gap-2.5 mb-4">
        {loyalty.org.logo ? (
          <img
            src={loyalty.org.logo}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand_blue/10 flex items-center justify-center text-sm font-satoMedium text-brand_blue">
            {loyalty.org.name.charAt(0)}
          </div>
        )}
        <span className="font-satoMedium text-brand_dark">
          {loyalty.org.name}
        </span>
      </div>

      <div className="bg-gradient-to-br from-brand_blue/5 to-brand_blue/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-brand_gray">Tu nivel</p>
            <p className="font-satoMedium text-brand_dark">
              {loyalty.level?.name ?? "Sin nivel"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-satoBold text-brand_blue">
              {loyalty.points}
            </p>
            <p className="text-xs text-brand_gray">puntos disponibles</p>
          </div>
        </div>

        {loyalty.nextLevel && (
          <div>
            <div className="flex justify-between text-[11px] text-brand_gray mb-1">
              <span>{loyalty.level?.name ?? "Inicio"}</span>
              <span>{loyalty.nextLevel.name}</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-brand_blue rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-brand_gray mt-1">
              Te faltan{" "}
              <strong className="text-brand_dark">
                {loyalty.nextLevel.pointsNeeded} pts
              </strong>{" "}
              para {loyalty.nextLevel.name}
            </p>
          </div>
        )}

        {loyalty.redemptions.length > 0 && (
          <div className="mt-4 border-t border-brand_blue/10 pt-3">
            <p className="text-xs font-satoMedium text-brand_dark mb-2">
              Recompensas activas
            </p>
            {loyalty.redemptions.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 mb-1"
              >
                <span className="text-sm text-brand_dark">
                  {r.reward.name}
                </span>
                <code className="text-xs bg-brand_blue/10 text-brand_blue px-2 py-0.5 rounded font-mono">
                  {r.code}
                </code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== EMPTY STATE ====================

// ==================== MOBILE STATUS TAG ====================

function MobileStatusTag({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; label: string; icon: string }> = {
    confirmed: { bg: "bg-[#effbd0]", text: "text-[#4f7222]", label: "Confirmada", icon: "🔔" },
    canceled: { bg: "bg-[#f9e7eb]", text: "text-[#ab4265]", label: "Cancelada", icon: "🚫" },
    paid: { bg: "bg-[#d5faf1]", text: "text-[#2a645f]", label: "Pagada", icon: "💸" },
    unpaid: { bg: "bg-[#eef9fd]", text: "text-[#276297]", label: "Sin pagar", icon: "💰" },
    pending: { bg: "bg-[#fff8e1]", text: "text-[#8b6914]", label: "Reservada", icon: "📣" },
  }
  const variant =
    status === "CANCELLED" || status === "canceled" ? "canceled"
    : status === "CONFIRMED" || status === "confirmed" || status === "ACTIVE" ? "confirmed"
    : status === "paid" ? "paid"
    : status === "unpaid" ? "unpaid"
    : "pending"
  const s = styles[variant]
  return (
    <span className={`${s.bg} ${s.text} inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-satoMedium`}>
      <span>{s.icon}</span>{s.label}
    </span>
  )
}

// ==================== HELPERS ====================

function buildEventHoverData(
  event: CitaEvent,
  org: PortalOrgInfo | null,
): EventHoverData {
  const startDate = new Date(event.start)
  const timeStr = startDate.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })
  return {
    customerName: event.service?.name ?? "Cita",
    serviceName: org?.name,
    time: timeStr,
    phone: org?.tel ?? undefined,
    status: event.status,
    paid: event.paid,
  }
}

// ==================== PORTAL EVENTS TABLE ====================

const STATUS_STYLES = {
  confirmed: { bg: "bg-[#effbd0]", text: "text-[#4f7222]", label: "Confirmada", icon: "🔔" },
  canceled: { bg: "bg-[#f9e7eb]", text: "text-[#ab4265]", label: "Cancelada", icon: "🚫" },
  paid: { bg: "bg-[#d5faf1]", text: "text-[#2a645f]", label: "Pagada", icon: "💸" },
  unpaid: { bg: "bg-[#eef9fd]", text: "text-[#276297]", label: "Sin pagar", icon: "💰" },
  pending: { bg: "bg-[#fff8e1]", text: "text-[#8b6914]", label: "Reservada", icon: "📣" },
} as const

type StatusVariant = keyof typeof STATUS_STYLES

const StatusTag = ({ variant }: { variant: StatusVariant }) => {
  const s = STATUS_STYLES[variant]
  return (
    <span
      className={`${s.bg} ${s.text} inline-flex items-center justify-center gap-1 px-2 py-[3px] rounded text-[12px] font-satoMedium whitespace-nowrap`}
    >
      <span>{s.icon}</span>
      {s.label}
    </span>
  )
}

function PortalEventList({
  events,
  getOrg,
  isPast,
}: {
  events: CitaEvent[]
  getOrg: (e: CitaEvent) => PortalOrgInfo | null
  isPast?: boolean
}) {
  return (
    <section className="w-full">
      {/* Desktop */}
      <div className="hidden lg:block w-full overflow-x-auto rounded-2xl">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[140px_1.2fr_1fr_90px_90px_1fr_44px] rounded-t-2xl border-b border-brand_stroke bg-white px-6 py-3 text-[12px] font-satoMedium text-brand_gray uppercase tracking-wide">
            <div>Fecha</div>
            <div>Negocio</div>
            <div>Servicio</div>
            <div>Puntos</div>
            <div>Precio</div>
            <div>Estatus</div>
            <div />
          </div>
          <div className="rounded-b-2xl bg-white divide-y divide-brand_stroke">
            {events.map((event) => (
              <PortalEventRow
                key={event.id}
                event={event}
                org={getOrg(event)}
                isPast={isPast}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden rounded-2xl bg-white overflow-hidden divide-y divide-brand_stroke">
        {events.map((event) => (
          <PortalEventCardMobile
            key={event.id}
            event={event}
            org={getOrg(event)}
            isPast={isPast}
          />
        ))}
      </div>
    </section>
  )
}

function PortalEventRow({
  event,
  org,
  isPast,
}: {
  event: CitaEvent
  org: PortalOrgInfo | null
  isPast?: boolean
}) {
  const date = new Date(event.start)
  const monthShort = date
    .toLocaleDateString("es-MX", { month: "short" })
    .replace(".", "")
    .toUpperCase()
  const day = date.getDate()

  const timeStr = date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div
      className={`grid grid-cols-[140px_1.2fr_1fr_90px_90px_1fr_44px] items-center px-6 py-3 hover:bg-slate-50 transition-colors ${isPast ? "opacity-1" : ""}`}
    >
      {/* Date pill + time */}
      <div className="flex items-center gap-2">
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
        <span className="text-[12px] font-satoMedium text-brand_gray">
          {timeStr}
        </span>
      </div>

      {/* Org */}
      <div className="flex items-center gap-2.5 min-w-0">
        {org?.logo ? (
          <img
            src={org.logo as string}
            alt=""
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-satoMedium text-brand_gray flex-shrink-0">
            {org?.name.charAt(0) ?? "?"}
          </div>
        )}
        <span className="text-sm font-satoBold text-brand_dark truncate">
          {org?.name ?? "—"}
        </span>
      </div>

      {/* Service */}
      <div className="min-w-0">
        <p className="text-[14px] font-satoBold text-brand_dark truncate">
          {event.service?.name || "—"}
        </p>
      </div>

      {/* Points */}
      <div className="font-satoMedium text-[14px] text-brand_gray">
        {String(event.service?.points ?? 0)}
      </div>

      {/* Price */}
      <div className="font-satoMedium text-[14px] text-brand_gray">
        {event.service ? `$${Number(event.service.price).toFixed(2)}` : "—"}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <StatusTag variant={getStatusVariant(event.status)} />
        <StatusTag variant={event.paid ? "paid" : "unpaid"} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <EventActions isPast={isPast} />
      </div>
    </div>
  )
}

function PortalEventCardMobile({
  event,
  org,
  isPast,
}: {
  event: CitaEvent
  org: PortalOrgInfo | null
  isPast?: boolean
}) {
  const date = new Date(event.start)
  const monthShort = date
    .toLocaleDateString("es-MX", { month: "short" })
    .replace(".", "")
    .toUpperCase()
  const day = date.getDate()
  const timeStr = date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        {/* Date pill */}
        <div
          className={`flex flex-col items-center justify-center min-w-[48px] rounded-lg px-2 py-1.5 ${
            isPast
              ? "bg-gray-100 text-brand_gray"
              : "bg-brand_blue/10 text-brand_blue"
          }`}
        >
          <span className="text-[10px] font-satoMedium leading-tight">
            {monthShort}
          </span>
          <span className="text-lg font-satoBold leading-tight">{day}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-satoBold text-brand_dark truncate">
            {event.service?.name || "—"}
          </p>
          <p className="text-[11px] text-brand_gray truncate">
            {org?.name ?? "—"} &middot; {timeStr}
            {event.duration ? ` (${String(event.duration)} min)` : ""}
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <StatusTag variant={getStatusVariant(event.status)} />
            <StatusTag variant={event.paid ? "paid" : "unpaid"} />
            <span className="text-[11px] text-brand_gray">
              {String(event.service?.points ?? 0)} pts
            </span>
          </div>
        </div>

        {/* Price + Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <EventActions isPast={isPast} />
          <p className="text-[12px] font-satoMedium text-brand_gray tabular-nums">
            {event.service ? `$${Number(event.service.price).toFixed(2)}` : "—"}
          </p>
        </div>
      </div>
    </div>
  )
}

// ==================== EVENT ACTIONS ====================

function EventActions({ isPast }: { isPast?: boolean }) {
  if (isPast) {
    return (
      <button
        type="button"
        className="hover:scale-110 transition-transform cursor-pointer"
        title="Dejar review"
      >
        <ReviewStar size={28} />
      </button>
    )
  }
  return (
    <DropdownMenu hideDefaultButton>
      <MenuButton
        icon={<FaRegCalendarCheck />}
        variant="default"
      >
        Reagendar
      </MenuButton>
      <MenuButton
        icon={<TbCalendarCancel className="text-lg" />}
        variant="danger"
      >
        Cancelar
      </MenuButton>
    </DropdownMenu>
  )
}

// ==================== FAVORITES TAB ====================

function FavoritesTab({ orgs }: { orgs: PortalOrgInfo[] }) {
  if (orgs.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-wrap gap-6 py-4">
      {orgs.map((org) => (
        <a
          key={org.id}
          href={`https://${org.slug}.denik.me`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-24 h-24 rounded-full bg-brand_dark border-[3px] border-brand_dark overflow-hidden flex items-center justify-center group-hover:border-brand_blue transition-colors">
            {org.logo ? (
              <img
                src={org.logo as string}
                alt={org.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-xl font-satoBold">
                {org.name.charAt(0)}
              </span>
            )}
          </div>
          <span className="text-xs font-satoMedium text-brand_dark text-center max-w-[80px] truncate">
            {org.name}
          </span>
        </a>
      ))}
    </div>
  )
}

// ==================== PLACEHOLDERS ====================

function EmptyState({
  title = "Mmm... aun no has agendado ninguna cita",
  subtitle = "Agenda tu proxima cita con negocios que usan Denik",
}: {
  title?: string
  subtitle?: string
} = {}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[60vh]">
      <img
        src="/images/emptyState/empty_customer.svg"
        alt=""
        className="mx-auto mb-6 w-[180px] sm:w-[220px]"
      />
      <h2 className="text-xl sm:text-2xl font-satoBold text-brand_dark">
        {title}
      </h2>
      <p className="mt-2 text-base text-brand_gray max-w-md mx-auto">
        {subtitle}
      </p>
    </div>
  )
}

// ==================== ICONS ====================

const LogoutIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
    />
  </svg>
)
