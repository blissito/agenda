import type { User } from "@prisma/client"
import { useRef, useState } from "react"
import { Link } from "react-router"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { twMerge } from "tailwind-merge"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { AppointmentItem } from "~/components/dash/AppointmentItem"
import { CustomerDashboard } from "~/components/dash/CustomerDashboard"
import { db } from "~/utils/db.server"
import { getPublicImageUrl } from "~/utils/urls"
import type { Route } from "./+types/dash._index"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user, org } = await getUserAndOrgOrRedirect(request)

  // Customer without org - load their events
  if (user.role === "customer" && !org) {
    const myEvents = await db.event.findMany({
      where: {
        customer: { userId: user.id },
        start: { gte: new Date() },
        status: { not: "CANCELLED" },
      },
      include: {
        service: { include: { org: true } },
      },
      orderBy: { start: "asc" },
    })

    return {
      user,
      isCustomerView: true,
      myEvents: myEvents.map((e) => ({
        id: e.id,
        start: e.start.toISOString(),
        status: e.status,
        serviceName: e.service?.name,
        orgName: e.service?.org.name,
      })),
      stats: null,
      recentEvents: [],
      topServices: [],
      salesTimeline: [],
    }
  }

  // Dashboard stats for org owners
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)

  const [
    monthlyEvents,
    cancelledCount,
    newCustomersCount,
    recentEvents,
    services,
    salesEvents,
  ] = await Promise.all([
    // All events this month (to compute sales + scheduled count)
    db.event.findMany({
      where: {
        orgId: org!.id,
        createdAt: { gte: startOfMonth },
      },
      include: { service: true },
    }),
    // Cancelled events this month
    db.event.count({
      where: {
        orgId: org!.id,
        status: "CANCELLED",
        createdAt: { gte: startOfMonth },
      },
    }),
    // New customers this month
    db.customer.count({
      where: {
        orgId: org!.id,
        createdAt: { gte: startOfMonth },
      },
    }),
    // Recent events for the sidebar
    db.event.findMany({
      where: {
        orgId: org!.id,
        type: { not: "BLOCK" },
        status: { not: "CANCELLED" },
      },
      include: {
        service: true,
        customer: true,
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    // Services with event counts for top services
    db.service.findMany({
      where: { orgId: org!.id, archived: false },
      include: { _count: { select: { events: true } } },
      orderBy: { events: { _count: "desc" } },
      take: 5,
    }),
    // Paid events from last year for sales chart
    db.event.findMany({
      where: {
        orgId: org!.id,
        paid: true,
        createdAt: { gte: oneYearAgo },
      },
      include: { service: true },
    }),
  ])

  const scheduledCount = monthlyEvents.filter(
    (e) => e.status !== "CANCELLED",
  ).length

  const monthlySales = monthlyEvents
    .filter((e) => e.paid && e.service)
    .reduce((sum, e) => sum + Number(e.service!.price), 0)

  // Build sales timeline: group paid events by week
  const salesByDate: Record<string, number> = {}
  for (const e of salesEvents) {
    if (!e.service) continue
    const d = e.createdAt
    // Key by ISO week start (Monday)
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const key = day.toISOString().slice(0, 10)
    salesByDate[key] = (salesByDate[key] || 0) + Number(e.service.price)
  }
  const salesTimeline = Object.entries(salesByDate)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    user,
    isCustomerView: false,
    myEvents: [],
    stats: {
      monthlySales,
      newCustomers: newCustomersCount,
      scheduledEvents: scheduledCount,
      cancelledEvents: cancelledCount,
    },
    recentEvents: recentEvents.map((e) => ({
      id: e.id,
      serviceName: e.service?.name ?? e.title,
      serviceImage: getPublicImageUrl(e.service?.gallery?.[0]) ?? null,
      customerName: e.customer?.displayName ?? "Sin cliente",
      start: e.start.toISOString(),
      createdAt: e.createdAt.toISOString(),
      status: e.status,
    })),
    topServices: services.map((s) => ({
      id: s.id,
      name: s.name,
      image: getPublicImageUrl(s.gallery?.[0]) ?? null,
      eventCount: s._count.events,
    })),
    salesTimeline,
  }
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const {
    user,
    isCustomerView,
    myEvents,
    stats,
    recentEvents,
    topServices,
    salesTimeline,
  } = loaderData

  if (isCustomerView) {
    return <CustomerDashboard events={myEvents} user={user} />
  }

  const hasData =
    stats &&
    (stats.scheduledEvents > 0 ||
      stats.newCustomers > 0 ||
      stats.monthlySales > 0 ||
      recentEvents.length > 0)

  return (
    <section className="w-full lg:h-[calc(100vh-5rem)]">
      <div className="h-full flex flex-col gap-4 lg:gap-6 box-border max-w-8xl mx-auto">
        <Summary user={user} stats={stats} />
        {hasData ? (
          <DashboardData
            recentEvents={recentEvents}
            topServices={topServices}
            salesTimeline={salesTimeline}
          />
        ) : (
          <EmptyStateDash />
        )}
      </div>
    </section>
  )
}

const EmptyStateDash = () => {
  return (
    <div className="bg-dashEmpty w-full flex-1 bg-cover mt-4 lg:mt-8 flex justify-center items-center">
      <div className="text-center">
        <img
          className="mx-auto w-[160px] md:w-auto"
          src="/images/no-files.svg"
        />
        <p className="font-satoBold text-xl font-bold">
          Un poco de paciencia 🧘🏻
        </p>
        <p className="mt-2 text-brand_gray">
          Aún no tenemos suficientes datos que mostrar
        </p>
      </div>
    </div>
  )
}

type RecentEvent = {
  id: string
  serviceName: string
  serviceImage: string | null
  customerName: string
  start: string
  createdAt: string
  status: string
}

type TopService = {
  id: string
  name: string
  image: string | null
  eventCount: number
}

function timeAgo(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Justo ahora"
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Hace ${days}d`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `Hace ${weeks} sem`
  const months = Math.floor(days / 30)
  return `Hace ${months} mes${months > 1 ? "es" : ""}`
}

function formatEventDate(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  })
}

function _formatEventHour(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

type SalesPoint = { date: string; total: number }
type SalesFilter = "semana" | "mes" | "trimestre" | "anual"

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]

function buildChartData(data: SalesPoint[], filter: SalesFilter): SalesPoint[] {
  const now = new Date()
  const buckets: Record<string, number> = {}

  if (filter === "semana") {
    // 7 días, un punto por día
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      buckets[d.toISOString().slice(0, 10)] = 0
    }
    for (const d of data) {
      if (d.date in buckets) buckets[d.date] += d.total
    }
  } else if (filter === "mes") {
    // 4-5 semanas, un punto por semana (lunes)
    for (let i = 4; i >= 0; i--) {
      const d = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i * 7,
      )
      buckets[d.toISOString().slice(0, 10)] = 0
    }
    const bucketKeys = Object.keys(buckets).sort()
    for (const d of data) {
      // Asignar al bucket más cercano anterior
      const key = [...bucketKeys].reverse().find((k: string) => k <= d.date)
      if (key) buckets[key] += d.total
    }
  } else {
    // Trimestre (3 meses) o Anual (12 meses)
    const monthCount = filter === "anual" ? 11 : 2
    for (let i = monthCount; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets[d.toISOString().slice(0, 10)] = 0
    }
    for (const d of data) {
      const dDate = new Date(d.date)
      const monthKey = new Date(dDate.getFullYear(), dDate.getMonth(), 1)
        .toISOString()
        .slice(0, 10)
      if (monthKey in buckets) buckets[monthKey] += d.total
    }
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }))
}

function formatChartLabel(dateStr: string, filter: SalesFilter) {
  const d = new Date(dateStr)
  if (filter === "semana") {
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
    return dias[d.getUTCDay()]
  }
  if (filter === "mes") {
    return `${d.getUTCDate()} ${MONTH_LABELS[d.getUTCMonth()]}`
  }
  return MONTH_LABELS[d.getUTCMonth()]
}

const SalesChart = ({ data }: { data: SalesPoint[] }) => {
  const [filter, setFilter] = useState<SalesFilter>("anual")
  const chartData = buildChartData(data, filter)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState({ left: 0, width: 0 })

  const filters: { key: SalesFilter; label: string; shortLabel: string }[] = [
    { key: "semana", label: "Semana", shortLabel: "S" },
    { key: "mes", label: "Mes", shortLabel: "M" },
    { key: "trimestre", label: "Trimestre", shortLabel: "T" },
    { key: "anual", label: "Anual", shortLabel: "A" },
  ]

  const handleFilter = (key: SalesFilter, el: HTMLButtonElement) => {
    setFilter(key)
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const btnRect = el.getBoundingClientRect()
    setPill({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    })
  }

  return (
    <div className="bg-white rounded-2xl p-4 lg:p-6 mt-6 flex-1 min-h-0 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-satoBold">Ventas</h3>
        <div
          ref={containerRef}
          className="relative flex bg-brand_ash/25 rounded-full p-1"
        >
          <div
            className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm transition-all duration-300 ease-in-out"
            style={{
              left: pill.width ? pill.left : undefined,
              width: pill.width || undefined,
              opacity: pill.width ? 1 : 0,
            }}
          />
          {filters.map((f) => (
            <button
              key={f.key}
              ref={(el) => {
                if (el && f.key === filter && !pill.width) {
                  const containerRect =
                    containerRef.current?.getBoundingClientRect()
                  if (containerRect) {
                    const btnRect = el.getBoundingClientRect()
                    setPill({
                      left: btnRect.left - containerRect.left,
                      width: btnRect.width,
                    })
                  }
                }
              }}
              onClick={(e) => handleFilter(f.key, e.currentTarget)}
              className={`relative z-10 px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                filter === f.key
                  ? "text-brand_dark font-medium"
                  : "text-brand_gray hover:text-brand_dark"
              }`}
            >
              <span className="hidden md:inline">{f.label}</span>
              <span className="md:hidden">{f.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatChartLabel(v, filter)}
              tick={{ fontSize: 12, fill: "#8A90A2" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `$${(v / 100).toLocaleString()}`}
              tick={{ fontSize: 12, fill: "#8A90A2" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              formatter={(value) => [
                `$${(Number(value) / 100).toLocaleString("es-MX")}`,
                "Ventas",
              ]}
              labelFormatter={(label) => formatChartLabel(label, filter)}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#615FFF"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#615FFF", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{
                r: 6,
                fill: "#615FFF",
                strokeWidth: 2,
                stroke: "#fff",
              }}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const DashboardData = ({
  recentEvents,
  topServices,
  salesTimeline,
}: {
  recentEvents: RecentEvent[]
  topServices: TopService[]
  salesTimeline: SalesPoint[]
}) => {
  const totalEvents = topServices.reduce((sum, s) => sum + s.eventCount, 0)

  return (
    <div className="grid grid-cols-6 gap-4 lg:gap-6 flex-1 min-h-0">
      <div className="col-span-6 xl:col-span-4 flex flex-col">
        {topServices.length > 0 && (
          <div className="lg:bg-white lg:rounded-2xl lg:p-6">
            <h3 className="text-lg font-satoBold">Servicios</h3>
            <div className="flex gap-4 lg:gap-6 mt-4 lg:mt-6 overflow-x-auto scrollbar-hide">
              {topServices.map((s) => (
                <SummaryCard
                  key={s.id}
                  img={s.image ?? undefined}
                  title={s.name}
                  description={`${s.eventCount} citas`}
                  data={
                    totalEvents > 0
                      ? `${((s.eventCount / totalEvents) * 100).toFixed(1)}%`
                      : "0%"
                  }
                />
              ))}
            </div>
          </div>
        )}
        <SalesChart data={salesTimeline} />
      </div>
      <div className="bg-white rounded-2xl overflow-y-scroll h-full col-span-6 xl:col-span-2 pb-4 lg:pb-6">
        <div className="bg-white/80 z-10 backdrop-blur py-4 sticky top-0 px-4 lg:px-6 flex items-center justify-between">
          <h3 className="text-lg font-satoBold">
            Servicios agendados recientemente
          </h3>
          <Link
            to="/dash/agenda/citas"
            className="text-xs text-[#615FFF] underline"
          >
            Ver todas
          </Link>
        </div>
        <div className="mt-0 overflow-y-scroll px-4 lg:px-6">
          {recentEvents.length > 0 ? (
            recentEvents
              .slice(0, 10)
              .map((e, i) => (
                <AppointmentItem
                  key={e.id}
                  className={i >= 5 ? "hidden md:flex" : undefined}
                  service={e.serviceName}
                  client={e.customerName}
                  date={formatEventDate(e.start)}
                  time={timeAgo(e.createdAt)}
                />
              ))
          ) : (
            <p className="px-6 text-brand_gray text-sm">
              No hay citas recientes
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const DAILY_QUOTES = [
  "\u201CEl que no tiene tiempo para su salud, tendr\u00e1 que tener tiempo para su enfermedad.\u201D \u2013 Jos\u00e9 Mart\u00ed",
  "\u201CLa vida no es la que uno vivi\u00f3, sino la que uno recuerda y c\u00f3mo la recuerda para contarla.\u201D \u2013 Gabriel Garc\u00eda M\u00e1rquez",
  "\u201CEl tiempo es la cosa m\u00e1s valiosa que un hombre puede gastar.\u201D \u2013 Sor Juana In\u00e9s de la Cruz",
  "\u201CHay un tiempo para todo, y todo lo que es hermoso tiene su instante.\u201D \u2013 Octavio Paz",
  "\u201CEl futuro pertenece a quienes creen en la belleza de sus sue\u00f1os.\u201D \u2013 Gabriela Mistral",
  "\u201CNo dejes que termine el d\u00eda sin haber crecido un poco.\u201D \u2013 Walt Whitman",
  "\u201CLa disciplina es el puente entre las metas y los logros.\u201D \u2013 Paulo Coelho",
  "\u201CUno no es lo que es por lo que escribe, sino por lo que ha le\u00eddo.\u201D \u2013 Jorge Luis Borges",
  "\u201CEl verdadero viaje de descubrimiento no consiste en buscar nuevos paisajes, sino en tener nuevos ojos.\u201D \u2013 Marcel Proust",
  "\u201CSiempre es temprano para rendirse.\u201D \u2013 Mario Benedetti",
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Buenos días"
  if (hour < 19) return "Buenas tardes"
  return "Buenas noches"
}

type Stats = {
  monthlySales: number
  newCustomers: number
  scheduledEvents: number
  cancelledEvents: number
}

const Summary = ({ user, stats }: { user: User; stats: Stats | null }) => {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  return (
    <div className="grid grid-cols-6 gap-4 md:gap-6 lg:gap-10">
      <div className="col-span-6 xl:col-span-2 flex items-center">
        <div>
          <h2 className="text-2xl md:text-4xl font-satoBold leading-normal">
            {getGreeting()}, {user.displayName}
          </h2>
          <p className="mt-4 text-brand_gray">
            {DAILY_QUOTES[new Date().getDate() % DAILY_QUOTES.length]}
          </p>
        </div>
      </div>
      <div className="col-span-6 xl:col-span-4 flex flex-wrap lg:flex-nowrap justify-end gap-4 md:gap-6 overflow-hidden">
        <DashCard
          className="bg-[#64D0C5] "
          title="Ventas del mes"
          value={stats ? formatCurrency(stats.monthlySales) : "$0"}
          icon="/images/chart.svg"
        />
        <DashCard
          className="bg-[#EEC446]"
          title="Nuevos clientes"
          value={String(stats?.newCustomers ?? 0)}
          icon="/images/profile.svg"
        />
        <DashCard
          className="bg-[#FFAB61]"
          title="Citas agendadas"
          value={String(stats?.scheduledEvents ?? 0)}
          icon="/images/agenda-dash.svg"
        />
        <DashCard
          className="bg-[#91B870]"
          title="Citas canceladas"
          value={String(stats?.cancelledEvents ?? 0)}
          icon="/images/cancel.svg"
        />
      </div>
    </div>
  )
}

const SummaryCard = ({
  img,
  title,
  description,
  data,
}: {
  img?: string
  title: string
  description: string
  data: string
}) => {
  return (
    <section className="border-[1px] min-w-[132px] max-w-[132px] border-brand_stroke rounded-2xl flex flex-col items-center text-center p-3 hover:scale-95 transition-all bg-white">
      <img
        className="h-12 w-12 rounded-full object-cover"
        src={img ? img : "/images/serviceDefault.png"}
      />
      <h3 className="text-sm w-full truncate" title={title}>
        {title}
      </h3>
      <p className="text-brand_gray text-sm">{description}</p>
      <span className="mt-4 font-satoMiddle">{data}</span>
    </section>
  )
}

const DashCard = ({
  icon,
  title,
  value,
  className,
}: {
  icon?: string
  title: string
  value: string
  className?: string
}) => {
  return (
    <section
      className={twMerge(
        "w-[140px] md:w-[20%] rounded-2xl h-[140px] md:h-[240px] relative flex flex-col justify-end p-4 group grow ",
        className,
      )}
    >
      <img
        className="absolute w-[64px] md:w-auto right-0 top-0 group-hover:scale-95 transition-all"
        src={icon}
      />
      <div className="text-white">
        <p className="text-base">{title}</p>
        <h3 className="text-3xl font-satoMedium">{value}</h3>
      </div>
    </section>
  )
}
