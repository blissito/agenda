// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import * as React from "react"
import { FiDownload } from "react-icons/fi"
import { MapPin } from "~/components/icons/mapPin"
import { TbEdit } from "react-icons/tb"
import { Link, useNavigation } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { Avatar } from "~/components/common/Avatar"
import { PrimaryButton } from "~/components/common/primaryButton"
import { useEventDownloadToast } from "~/components/downloads/downloadToast"
import { usePluralize } from "~/components/hooks/usePluralize"
import { Calendar2 } from "~/components/icons/calendar2"
import { Settings } from "~/components/icons/settings"
import { Mail } from "~/components/icons/mail"
import { MailButton } from "~/components/icons/mailButton"
import { Notes } from "~/components/icons/notes"
import { Phone } from "~/components/icons/phone"
import { WhatsApp } from "~/components/icons/WhatsApp"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/dash_.clientes_.$email"
import { Pagination } from "~/components/common/Pagination"
import { CitasFilterPopup, EMPTY_FILTERS, type CitasFilters } from "~/components/dash/CitasFilter"
import { CitasTable, type CitaEvent } from "~/components/dash/CitasTable"


export const handle = { hideSidebar: true }

const MOCK_AVATAR =
  "https://www.figma.com/api/mcp/asset/3f2720cf-f252-4635-97c8-073948b07470"

function formatSince(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

export const loader = async ({
  request,
  params: { email },
}: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org || !email) throw new Response(null, { status: 404 })

  const customer = await db.customer.findFirst({
    where: { email, orgId: org.id },
  })

  if (!customer) throw new Response("Cliente no encontrado", { status: 404 })

  const dbEvents = await db.event.findMany({
    where: { customerId: customer.id, orgId: org.id },
    include: { service: true },
    orderBy: { start: "desc" },
  })

  const events: CitaEvent[] = dbEvents.filter(
    (e): e is typeof e & { service: NonNullable<typeof e.service> } =>
      e.service !== null,
  )

  const now = new Date()
  const points = events
    .filter((e) => new Date(e.start) < now)
    .reduce((acc, e) => acc + Number(e.service.points), 0)

  const services = await db.service.findMany({
    where: { orgId: org.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return {
    customer,
    org,
    events,
    services,
    stats: {
      eventCount: events.length,
      commentsCount: 0,
      points,
      since: formatSince(customer.createdAt),
    },
  }
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { events, stats, customer, services } = loaderData
  const pluralize = usePluralize()
  const navigation = useNavigation()

  const [showFilters, setShowFilters] = React.useState(false)
  const [filters, setFilters] = React.useState<CitasFilters>(EMPTY_FILTERS)
  const [draft, setDraft] = React.useState<CitasFilters>(EMPTY_FILTERS)
  const filterRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilters(false)
    }
    if (showFilters) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showFilters])

  const hasActiveFilters = filters.serviceId !== "" || filters.statuses.size > 0 || filters.from !== "" || filters.to !== ""

  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      if (filters.from && new Date(e.start) < new Date(filters.from)) return false
      if (filters.to) {
        const to = new Date(filters.to)
        to.setHours(23, 59, 59, 999)
        if (new Date(e.start) > to) return false
      }
      if (filters.serviceId && e.service?.id !== filters.serviceId) return false
      if (filters.statuses.size > 0) {
        const statusVariant = e.status === "CANCELLED" || e.status === "canceled" ? "canceled" : e.status === "ACTIVE" || e.status === "confirmed" ? "confirmed" : "pending"
        const payVariant = e.paid ? "paid" : "unpaid"
        if (!filters.statuses.has(statusVariant) && !filters.statuses.has(payVariant)) return false
      }
      return true
    })
  }, [events, filters])

  const PER_PAGE = 20
  const [page, setPage] = React.useState(1)
  React.useEffect(() => { setPage(1) }, [filters])
  const paginated = filteredEvents.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const [showDelayedSkeleton, setShowDelayedSkeleton] = React.useState(false)

  const { startDownload, toast } = useEventDownloadToast({
    events,
    clientName: customer.displayName,
  })

  React.useEffect(() => {
    if (navigation.state === "loading") {
      const t = window.setTimeout(() => setShowDelayedSkeleton(true), 3000)
      return () => window.clearTimeout(t)
    }
    setShowDelayedSkeleton(false)
  }, [navigation.state])

  if (showDelayedSkeleton) return <ClientDetailSkeleton />

  return (
    <div className="min-h-screen relative pb-8">
      {/* Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[240px] sm:h-[302px] rounded-b-2xl overflow-hidden z-0">
        <img
          src="https://i.imgur.com/w038IV9.jpg"
          alt="header background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-white text-sm pt-6 mb-10 sm:mb-16">
          <Link to="/dash/clientes" className="hover:underline">
            Clientes
          </Link>
          <span className="text-white/70">{">"}</span>
          <span className="font-satoMedium">{customer.displayName}</span>
        </nav>

        {/* Profile Card */}
        <div className="relative mt-8">
          {/* Avatar */}
          <div className="absolute -top-4 left-0 z-10">
            <Avatar
              image={
                (customer as any).photoURL ??
                (customer as any).image ??
                MOCK_AVATAR
              }
              className="w-[88px] h-[88px] sm:w-[120px] sm:h-[120px] ml-0 border-4 border-transparent"
            />
          </div>

          {/* Card */}
          <div
            className="
              bg-white rounded-2xl pt-8 pb-6 px-4 sm:px-6 relative
              [mask-image:radial-gradient(circle_56px_at_44px_38px,transparent_55px,black_56px)]
              [--webkit-mask-image:radial-gradient(circle_56px_at_44px_38px,transparent_55px,black_56px)]
              sm:[mask-image:radial-gradient(circle_75px_at_60px_44px,transparent_74px,black_75px)]
              sm:[--webkit-mask-image:radial-gradient(circle_75px_at_60px_44px,transparent_74px,black_75px)]
            "
            style={{
              WebkitMaskImage: "var(--webkit-mask-image)",
              maskImage: "var(--webkit-mask-image)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-stretch">
              {/* Left */}
              <div className="flex-1">
                <div className="mb-6">
                  <div className="sm:hidden grid grid-cols-[1fr_auto] items-start gap-x-3">
                    <h1 className="mt-20 text-xl font-satoBold text-brand_dark">
                      {customer.displayName}
                    </h1>
                    <div className="flex flex-col items-end gap-2">
                      {/* fila de iconos */}
                      <div className="flex items-center justify-end gap-2">
                        {/* <button
                          type="button"
                          className="w-10 h-10 rounded-full bg-transparent border border-brand_stroke flex items-center justify-center text-brand_gray hover:bg-gray-50 transition"
                          aria-label="Editar"
                        >
                          <TbEdit size={20} />
                        </button> */}

                        <a
                          href={`https://wa.me/${customer.tel.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-transparent border border-brand_stroke flex items-center justify-center text-brand_gray hover:bg-gray-50 transition"
                          aria-label="WhatsApp"
                        >
                          <WhatsApp size={20} />
                        </a>

                        <a
                          href={`mailto:${customer.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-transparent border border-brand_stroke flex items-center justify-center text-brand_gray hover:bg-gray-50 transition"
                          aria-label="Enviar correo"
                        >
                          <MailButton />
                        </a>
                      </div>

                      {/* botón abajo */}
                      <Link to={`/dash/agenda?customerId=${customer.id}`}>
                        <PrimaryButton className="min-w-0 min-h-0 h-10 px-4 gap-1">
                          <Calendar2 size={20} />
                          <span className="text-sm font-satoMedium">Agendar</span>
                        </PrimaryButton>
                      </Link>
                    </div>
                  </div>

                  {/* DESKTOP */}
                  <div className="hidden sm:flex items-center gap-4 mb-6 pl-[150px]">
                    <h1 className="text-2xl font-satoBold text-brand_dark">
                      {customer.displayName}
                    </h1>

                    <div className="flex items-center gap-2 ml-auto mr-8">
                      {/* <button
                        type="button"
                        className="w-10 h-10 rounded-full bg-transparent border border-brand_stroke flex items-center justify-center text-brand_gray hover:bg-gray-50 transition"
                        aria-label="Editar"
                      >
                        <TbEdit size={20} />
                      </button> */}

                      <a
                        href={`https://wa.me/${customer.tel.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-transparent border border-brand_stroke flex items-center justify-center text-brand_gray hover:bg-gray-50 transition"
                        aria-label="WhatsApp"
                      >
                        <WhatsApp size={20} />
                      </a>

                      <a
                        href={`mailto:${customer.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-transparent border border-brand_stroke flex items-center justify-center text-brand_gray hover:bg-gray-50 transition"
                        aria-label="Enviar correo"
                      >
                        <MailButton />
                      </a>

                      <Link to={`/dash/agenda?customerId=${customer.id}`}>
                        <PrimaryButton className="ml-2 min-w-0 min-h-0 h-10 px-4 gap-1">
                          <Calendar2 size={20} />
                          <span className="text-sm font-satoMedium">Agendar</span>
                        </PrimaryButton>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mt-4 sm:grid-cols-3 sm:gap-x-16 sm:gap-y-0 sm:mt-16">
                  {/* Email */}
                  <div className="col-span-2 flex items-center gap-2 min-w-0 sm:col-span-1">
                    <Mail className="text-brand_gray shrink-0" />
                    <span className="min-w-0 flex-1 text-[14px] font-satoMedium text-brand_gray leading-[20px] truncate sm:truncate-none">
                      {customer.email}
                    </span>
                  </div>

                  {/* Tel */}
                  <div className="col-span-2 flex items-center gap-2 min-w-0 sm:col-span-1">
                    <Phone className="text-brand_gray shrink-0" />
                    <span className="text-[14px] font-satoMedium text-brand_gray leading-[20px]">
                      {customer.tel || "Sin teléfono"}
                    </span>
                  </div>

                  {/* Dirección */}
                  <div className="col-span-2 flex items-start gap-2 min-w-0 sm:col-span-1">
                    <MapPin
                      className="text-brand_gray mt-0.5 shrink-0"
                    />
                    <span className="text-[14px] font-satoMedium text-brand_gray leading-[20px]">
                      {"address" in customer && (customer as any).address
                        ? (customer as any).address
                        : "Sin dirección"}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <div className="flex items-start gap-2 mt-4 sm:mt-6">
                  <Notes className="text-brand_gray mt-0.5 shrink-0" />
                  <p className="text-[14px] font-satoMedium text-brand_gray leading-[20px] max-w-[840px]">
                    {customer.comments || "Sin comentarios"}
                  </p>
                </div>
              </div>

              {/* DIVIDER MOBILE */}
              <div className="md:hidden border-t border-brand_stroke my-4" />

              {/* Right - Stats */}
              <div className="mt-0 md:mt-0 md:border-l md:border-brand_stroke md:pl-6 md:min-w-[180px]">
                <div className="md:block">
                  <div className="md:pl-0"></div>

                  <div className="pl-4 md:pl-0">
                    <div className="grid grid-cols-3 gap-4 md:grid-cols-1 md:gap-0">
                      <div className="md:mb-4">
                        <p className="text-xl sm:text-2xl font-satoBold text-brand_dark">
                          {stats.eventCount}{" "}
                          {pluralize("cita", stats.eventCount)}
                        </p>
                        <p className="text-xs font-satoMedium text-brand_gray">
                          desde el {stats.since}
                        </p>
                      </div>

                      <div className="md:mb-4">
                        <div className="flex items-center gap-1">
                          <span className="text-xl sm:text-2xl font-satoBold text-brand_dark">
                            {stats.commentsCount}
                          </span>
                          <span className="text-brand_yellow">⭐</span>
                        </div>
                        <p className="text-xs font-satoMedium text-brand_gray">
                          comentarios
                        </p>
                      </div>

                      <div>
                        <p className="text-xl sm:text-2xl font-satoBold text-brand_dark">
                          {stats.points}
                        </p>
                        <p className="text-xs font-satoMedium text-brand_gray">
                          puntos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex items-center gap-3 mt-8 mb-0">
            <h2 className="text-lg font-satoBold text-brand_dark">Historial de citas</h2>
            <div className="flex-1" />

            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => {
                  setDraft({ ...filters, statuses: new Set(filters.statuses) })
                  setShowFilters((v) => !v)
                }}
                className="relative bg-white rounded-full w-12 h-12 flex items-center justify-center text-brand_gray hover:bg-gray-100 transition shrink-0"
                aria-label="Filtros"
              >
                <Settings className="w-5 h-5" />
                {hasActiveFilters && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-brand_blue" />
                )}
              </button>
              {showFilters && (
                <CitasFilterPopup
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

            <button
              type="button"
              onClick={startDownload}
              className="bg-white rounded-full w-12 h-12 flex items-center justify-center text-brand_gray hover:bg-gray-100 transition shrink-0"
              aria-label="Descargar"
            >
              <FiDownload size={20} />
            </button>
          </div>

          {/* Events */}
          <div className="mt-6">
            {paginated.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-sm font-satoMedium text-brand_gray">
                {hasActiveFilters ? "No hay citas que coincidan con los filtros." : "Este cliente aún no tiene citas."}
              </div>
            ) : (
              <CitasTable events={paginated} hideClient />
            )}
            {filteredEvents.length > PER_PAGE && (
              <Pagination
                total={filteredEvents.length}
                page={page}
                perPage={PER_PAGE}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </div>

      {toast}
    </div>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto w-full max-w-[900px] rounded-2xl bg-white p-6">
        <p className="text-lg font-satoBold text-brand_dark">
          Ocurrió un error al cargar el cliente
        </p>
        <p className="mt-2 text-sm font-satoMedium text-brand_gray">
          {error instanceof Error ? error.message : "Error desconocido"}
        </p>
        <div className="mt-4">
          <Link to="/dash/clientes" className="text-sm text-brand_blue">
            Volver a Clientes
          </Link>
        </div>
      </div>
    </div>
  )
}

function ClientDetailSkeleton() {
  return (
    <div className="min-h-screen relative">
      <div className="absolute top-0 left-0 right-0 h-[240px] sm:h-[302px] rounded-b-2xl overflow-hidden z-0 bg-black/20" />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4 sm:px-6 pt-6">
        <div className="h-4 w-56 rounded bg-white/30" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4 sm:px-6 mt-16">
        <div className="relative bg-white rounded-2xl pt-8 pb-6 px-6">
          <div className="absolute -top-4 left-0 w-[88px] h-[88px] sm:w-[120px] sm:h-[120px] rounded-full bg-gray-200" />
          <div className="pl-[110px] sm:pl-[150px]">
            <div className="h-7 w-64 rounded bg-gray-200" />
            <div className="mt-6 h-4 w-[520px] max-w-full rounded bg-gray-100" />
            <div className="mt-3 h-4 w-[420px] max-w-full rounded bg-gray-100" />
            <div className="mt-6 h-16 w-[840px] max-w-full rounded bg-gray-100" />
          </div>
        </div>

        <div className="mt-8">
          <div className="h-12 w-full sm:w-[340px] rounded-full bg-white/70" />
          <div className="mt-6 h-[360px] rounded-2xl bg-white/70" />
        </div>
      </div>
    </div>
  )
}
