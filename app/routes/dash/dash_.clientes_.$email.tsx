import * as React from "react"
import { FiDownload, FiMapPin } from "react-icons/fi"
import { TbEdit } from "react-icons/tb"
import { Link, useNavigation } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { Avatar } from "~/components/common/Avatar"
import { PrimaryButton } from "~/components/common/primaryButton"
import { usePluralize } from "~/components/hooks/usePluralize"
import { CalendarPicker } from "~/components/icons/calendarPicker"
import { Mail } from "~/components/icons/mail"
import { MailButton } from "~/components/icons/mailButton"
import { Phone } from "~/components/icons/phone"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/dash_.clientes_.$email"
import { EventTable, type EventWithService } from "./clientes/EventTable"
import { Notes } from "~/components/icons/Notes"
import { Calendar2 } from "~/components/icons/calendar2"
import { WhatsApp } from "~/components/icons/whatsapp"



export const handle = { hideSidebar: true }

// Mock avatar image from Figma (valid for 7 days)
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

  if (!customer) {
    throw new Response("Cliente no encontrado", { status: 404 })
  }

  const dbEvents = await db.event.findMany({
    where: { customerId: customer.id, orgId: org.id },
    include: { service: true },
    orderBy: { start: "desc" },
  })

  const events: EventWithService[] = dbEvents.filter(
    (e): e is typeof e & { service: NonNullable<typeof e.service> } =>
      e.service !== null,
  )

  const points = events.reduce((acc, e) => acc + Number(e.service.points), 0)

  return {
    customer,
    org,
    events,
    stats: {
      eventCount: events.length,
      commentsCount: 0,
      points,
      since: formatSince(customer.createdAt),
    },
  }
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { events, stats, customer } = loaderData
  const pluralize = usePluralize()
  const navigation = useNavigation()

  const [showDelayedSkeleton, setShowDelayedSkeleton] = React.useState(false)

  React.useEffect(() => {
    if (navigation.state === "loading") {
      const t = window.setTimeout(() => setShowDelayedSkeleton(true), 3000)
      return () => window.clearTimeout(t)
    }
    setShowDelayedSkeleton(false)
  }, [navigation.state])

  if (showDelayedSkeleton) return <ClientDetailSkeleton />

  return (
    <div className="min-h-screen relative">
      {/* Header Background - FULL WIDTH */}
      <div className="absolute top-0 left-0 right-0 h-[302px] rounded-b-2xl overflow-hidden z-0">
        <img
          src="https://i.imgur.com/w038IV9.jpg"
          alt="header background"
          className="w-full h-full object-cover"
        />
      </div>

      {/*CONTENT WRAPPER */}
      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-white text-sm pt-6 mb-16">
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
              className="w-[120px] h-[120px] ml-0 border-4 border-transparent"
            />
          </div>

          {/* Card with circular cutout for avatar */}
          <div
            className="bg-white rounded-2xl pt-8 pb-6 px-6 relative"
            style={{
              WebkitMaskImage:
                "radial-gradient(circle 75px at 60px 44px, transparent 74px, black 75px)",
              maskImage:
                "radial-gradient(circle 75px at 60px 44px, transparent 74px, black 75px)",
            }}
          >
            <div className="flex">
              {/* Left section */}
              <div className="flex-1">
                {/* Name + actions */}
                <div className="flex items-center gap-4 mb-6 pl-[150px]">
                  <h1 className="text-2xl font-satoBold text-brand_dark">
                    {customer.displayName}
                  </h1>

                  <div className="flex items-center gap-2 ml-auto mr-8">
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full bg-transparent border border-brand_stroke flex items-center justify-center text-brand_iron hover:bg-gray-50 transition"
                      aria-label="Editar"
                    >
                      <TbEdit size={20} />
                    </button>

                    <button
                        type="button"
                        className="w-10 h-10 rounded-full bg-transparent border border-brand_stroke flex items-center justify-center text-brand_gray hover:bg-gray-50 transition"
                        aria-label="WhatsApp"
                      >
                        <WhatsApp size={20} />
                      </button>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full bg-transparent border border-brand_stroke flex items-center justify-center text-brand_iron hover:bg-gray-50 transition"
                      aria-label="Enviar correo"
                    >
                      <MailButton />
                    </button>

                    <PrimaryButton className="ml-2 min-w-0 min-h-0 h-10 px-4 gap-1">
                      <Calendar2 size={20} />
                      <span className="text-sm font-satoMedium">Agendar</span>
                    </PrimaryButton>
                  </div>
                </div>

              {/* Contact info */}
              <div className="grid grid-cols-3 gap-x-16 text-sm mt-16">
                      <div className="flex items-center gap-2">
                        <Mail className="text-brand_iron" />
                        <span className="text-[14px] font-satoMedium text-brand_gray leading-[20px]">
                          {customer.email}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="text-brand_iron" />
                        <span className="text-[14px] font-satoMedium text-brand_gray leading-[20px]">
                          {customer.tel || "Sin teléfono"}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <FiMapPin
                          className="text-brand_iron mt-0.5 shrink-0"
                          size={20}
                        />
                        <span className="text-[14px] font-satoMedium text-brand_gray leading-[20px]">
                          {"address" in customer && (customer as any).address
                            ? (customer as any).address
                            : "Sin dirección"}
                        </span>
                      </div>
                    </div>

                {/* Notes */}
                <div className="flex items-start gap-2 mt-6">
                    <Notes className="text-brand_iron mt-0.5 shrink-0" />
                    <p className="text-[14px] font-satoMedium text-brand_gray leading-[20px] max-w-[840px]">
                      {customer.comments || "Sin comentarios"}
                    </p>
                  </div>
              </div>

              {/* Right section - Stats */}
              <div className="border-l border-brand_stroke pl-6 min-w-[180px] self-stretch flex flex-col justify-start pt-2">
                <div className="mb-4">
                  <p className="text-2xl font-satoBold text-brand_dark">
                    {stats.eventCount} {pluralize("cita", stats.eventCount)}
                  </p>
                  <p className="text-xs font-satoMedium text-brand_iron">
                    desde el {stats.since}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-satoBold text-brand_dark">
                      {stats.commentsCount}
                    </span>
                    <span className="text-brand_yellow">⭐</span>
                  </div>
                  <p className="text-xs font-satoMedium text-brand_iron">
                    comentarios
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-satoBold text-brand_dark">
                    {stats.points}
                  </p>
                  <p className="text-xs font-satoMedium text-brand_iron">
                    puntos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex items-center gap-4 mt-8 mb-0">
          <div className="bg-white rounded-full px-4 h-12 flex items-center gap-2 min-w-[340px]">
            <span className="text-brand_iron font-satoMedium text-base flex-1">
              Filtrar por fecha
            </span>
            <CalendarPicker className="text-brand_iron" />
          </div>

          <div className="flex-1" />

          <div className="bg-white rounded-full px-4 h-12 flex items-center gap-2 min-w-[180px]">
            <span className="text-brand_gray font-satoMedium text-base">
              Citas
            </span>
            <div className="ml-auto" aria-hidden="true">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="rotate-90"
              >
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  className="text-brand_gray"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <button
            type="button"
            className="bg-white rounded-full w-12 h-12 flex items-center justify-center text-brand_iron hover:bg-gray-100 transition"
            aria-label="Descargar"
          >
            <FiDownload size={20} />
          </button>
        </div>

        {/* Events */}
        <div className="mt-6">
          {events.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-sm font-satoMedium text-brand_gray">
              Este cliente aún no tiene citas.
            </div>
          ) : (
            <EventTable events={events} />
          )}
        </div>
      </div>
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
      <div className="absolute top-0 left-0 right-0 h-[302px] rounded-b-2xl overflow-hidden z-0 bg-black/20" />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-6 pt-6">
        <div className="h-4 w-56 rounded bg-white/30" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-6 mt-16">
        <div className="relative bg-white rounded-2xl pt-8 pb-6 px-6">
          <div className="absolute -top-4 left-0 w-[120px] h-[120px] rounded-full bg-gray-200" />
          <div className="pl-[150px]">
            <div className="h-7 w-64 rounded bg-gray-200" />
            <div className="mt-6 h-4 w-[520px] rounded bg-gray-100" />
            <div className="mt-3 h-4 w-[420px] rounded bg-gray-100" />
            <div className="mt-6 h-16 w-[840px] max-w-full rounded bg-gray-100" />
          </div>
        </div>

        <div className="mt-8">
          <div className="h-12 w-[340px] rounded-full bg-white/70" />
          <div className="mt-6 h-[360px] rounded-2xl bg-white/70" />
        </div>
      </div>
    </div>
  )
}
