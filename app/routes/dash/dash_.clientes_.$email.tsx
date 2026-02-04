import { FaWhatsapp } from "react-icons/fa6"
import { FiDownload, FiMapPin } from "react-icons/fi"
import { HiCalendarDays } from "react-icons/hi2"
import { IoDocumentTextOutline } from "react-icons/io5"
import { TbEdit } from "react-icons/tb"
import { Link } from "react-router"
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

// Mock avatar image from Figma (valid for 7 days)
const MOCK_AVATAR =
  "https://www.figma.com/api/mcp/asset/3f2720cf-f252-4635-97c8-073948b07470"
//@TODO: filter by date, edit contact, send email, send whats, download contacts?one?all?, delete contact

// Mock events data for visualization - typed to match EventWithService
const createMockEvents = (_customerName: string): EventWithService[] => [
  {
    id: "mock-1",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: false,
    allDay: false,
    archived: false,
    createdAt: new Date(),
    customerId: null,
    duration: BigInt(60),
    employeeId: null,
    notes: null,
    orgId: "",
    payment_method: null,
    serviceId: "s1",
    title: "Clase de piano",
    type: "appointment",
    updatedAt: new Date(),
    userId: "",
    mp_preference_id: null,
    mp_payment_id: null,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    reminderSentAt: null,
    surveySentAt: null,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: BigInt(15),
      price: BigInt(399),
      employeeName: "Brenda Ortega",
      address: null,
      allowMultiple: false,
      archived: false,
      config: null,
      currency: "MXN",
      description: null,
      duration: BigInt(60),
      isActive: true,
      limit: null,
      orgId: "",
      paid: false,
      payment: false,
      photoURL: null,
      place: "online",
      seats: BigInt(1),
      slug: "clase-de-piano",
      weekDays: null,
    },
  },
  {
    id: "mock-2",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: true,
    allDay: false,
    archived: false,
    createdAt: new Date(),
    customerId: null,
    duration: BigInt(60),
    employeeId: null,
    notes: null,
    orgId: "",
    payment_method: null,
    serviceId: "s1",
    title: "Clase de piano",
    type: "appointment",
    updatedAt: new Date(),
    userId: "",
    mp_preference_id: null,
    mp_payment_id: null,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    reminderSentAt: null,
    surveySentAt: null,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: BigInt(15),
      price: BigInt(399),
      employeeName: "Brenda Ortega",
      address: null,
      allowMultiple: false,
      archived: false,
      config: null,
      currency: "MXN",
      description: null,
      duration: BigInt(60),
      isActive: true,
      limit: null,
      orgId: "",
      paid: false,
      payment: false,
      photoURL: null,
      place: "online",
      seats: BigInt(1),
      slug: "clase-de-piano",
      weekDays: null,
    },
  },
  {
    id: "mock-3",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: true,
    allDay: false,
    archived: false,
    createdAt: new Date(),
    customerId: null,
    duration: BigInt(60),
    employeeId: null,
    notes: null,
    orgId: "",
    payment_method: null,
    serviceId: "s1",
    title: "Clase de piano",
    type: "appointment",
    updatedAt: new Date(),
    userId: "",
    mp_preference_id: null,
    mp_payment_id: null,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    reminderSentAt: null,
    surveySentAt: null,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: BigInt(15),
      price: BigInt(399),
      employeeName: "Brenda Ortega",
      address: null,
      allowMultiple: false,
      archived: false,
      config: null,
      currency: "MXN",
      description: null,
      duration: BigInt(60),
      isActive: true,
      limit: null,
      orgId: "",
      paid: false,
      payment: false,
      photoURL: null,
      place: "online",
      seats: BigInt(1),
      slug: "clase-de-piano",
      weekDays: null,
    },
  },
  {
    id: "mock-4",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "CANCELED",
    paid: false,
    allDay: false,
    archived: false,
    createdAt: new Date(),
    customerId: null,
    duration: BigInt(60),
    employeeId: null,
    notes: null,
    orgId: "",
    payment_method: null,
    serviceId: "s1",
    title: "Clase de piano",
    type: "appointment",
    updatedAt: new Date(),
    userId: "",
    mp_preference_id: null,
    mp_payment_id: null,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    reminderSentAt: null,
    surveySentAt: null,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: BigInt(15),
      price: BigInt(399),
      employeeName: "Brenda Ortega",
      address: null,
      allowMultiple: false,
      archived: false,
      config: null,
      currency: "MXN",
      description: null,
      duration: BigInt(60),
      isActive: true,
      limit: null,
      orgId: "",
      paid: false,
      payment: false,
      photoURL: null,
      place: "online",
      seats: BigInt(1),
      slug: "clase-de-piano",
      weekDays: null,
    },
  },
  {
    id: "mock-5",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: true,
    allDay: false,
    archived: false,
    createdAt: new Date(),
    customerId: null,
    duration: BigInt(60),
    employeeId: null,
    notes: null,
    orgId: "",
    payment_method: null,
    serviceId: "s1",
    title: "Clase de piano",
    type: "appointment",
    updatedAt: new Date(),
    userId: "",
    mp_preference_id: null,
    mp_payment_id: null,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    reminderSentAt: null,
    surveySentAt: null,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: BigInt(15),
      price: BigInt(399),
      employeeName: "Brenda Ortega",
      address: null,
      allowMultiple: false,
      archived: false,
      config: null,
      currency: "MXN",
      description: null,
      duration: BigInt(60),
      isActive: true,
      limit: null,
      orgId: "",
      paid: false,
      payment: false,
      photoURL: null,
      place: "online",
      seats: BigInt(1),
      slug: "clase-de-piano",
      weekDays: null,
    },
  },
  {
    id: "mock-6",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: true,
    allDay: false,
    archived: false,
    createdAt: new Date(),
    customerId: null,
    duration: BigInt(60),
    employeeId: null,
    notes: null,
    orgId: "",
    payment_method: null,
    serviceId: "s1",
    title: "Clase de piano",
    type: "appointment",
    updatedAt: new Date(),
    userId: "",
    mp_preference_id: null,
    mp_payment_id: null,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    reminderSentAt: null,
    surveySentAt: null,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: BigInt(15),
      price: BigInt(399),
      employeeName: "Brenda Ortega",
      address: null,
      allowMultiple: false,
      archived: false,
      config: null,
      currency: "MXN",
      description: null,
      duration: BigInt(60),
      isActive: true,
      limit: null,
      orgId: "",
      paid: false,
      payment: false,
      photoURL: null,
      place: "online",
      seats: BigInt(1),
      slug: "clase-de-piano",
      weekDays: null,
    },
  },
  {
    id: "mock-7",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: true,
    allDay: false,
    archived: false,
    createdAt: new Date(),
    customerId: null,
    duration: BigInt(60),
    employeeId: null,
    notes: null,
    orgId: "",
    payment_method: null,
    serviceId: "s1",
    title: "Clase de piano",
    type: "appointment",
    updatedAt: new Date(),
    userId: "",
    mp_preference_id: null,
    mp_payment_id: null,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    reminderSentAt: null,
    surveySentAt: null,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: BigInt(15),
      price: BigInt(399),
      employeeName: "Brenda Ortega",
      address: null,
      allowMultiple: false,
      archived: false,
      config: null,
      currency: "MXN",
      description: null,
      duration: BigInt(60),
      isActive: true,
      limit: null,
      orgId: "",
      paid: false,
      payment: false,
      photoURL: null,
      place: "online",
      seats: BigInt(1),
      slug: "clase-de-piano",
      weekDays: null,
    },
  },
  {
    id: "mock-8",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: true,
    allDay: false,
    archived: false,
    createdAt: new Date(),
    customerId: null,
    duration: BigInt(60),
    employeeId: null,
    notes: null,
    orgId: "",
    payment_method: null,
    serviceId: "s1",
    title: "Clase de piano",
    type: "appointment",
    updatedAt: new Date(),
    userId: "",
    mp_preference_id: null,
    mp_payment_id: null,
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    reminderSentAt: null,
    surveySentAt: null,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: BigInt(15),
      price: BigInt(399),
      employeeName: "Brenda Ortega",
      address: null,
      allowMultiple: false,
      archived: false,
      config: null,
      currency: "MXN",
      description: null,
      duration: BigInt(60),
      isActive: true,
      limit: null,
      orgId: "",
      paid: false,
      payment: false,
      photoURL: null,
      place: "online",
      seats: BigInt(1),
      slug: "clase-de-piano",
      weekDays: null,
    },
  },
]

// Extended customer type to include address for display purposes
type CustomerWithAddress = {
  id: string
  email: string
  displayName: string
  tel: string
  comments: string
  createdAt: Date
  updatedAt: Date
  orgId: string
  userId: string | null
  address?: string // For mock data display
}

export const loader = async ({
  request,
  params: { email },
}: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org || !email) throw new Response(null, { status: 404 })

  // Try to find real customer or create mock
  const dbCustomer = await db.customer.findFirst({ where: { email } })
  let isMockCustomer = false
  let customer: CustomerWithAddress

  // If no customer found, create mock data for visualization
  if (!dbCustomer) {
    isMockCustomer = true
    customer = {
      id: "mock-customer",
      email,
      displayName: "Isabela Lozano",
      tel: "55 555 55 55",
      address: "Av. Lopez Mateos 116, col. centro, CDMX, MEX",
      comments:
        "Lorem ipsum dolor sit amet consectetur. At mattis nulla sed curabitur gravida et quam sed at. Sit tellus hendrerit volutpat sed ac consequat eros in et. Phasellus odio nisi urna. nulla sed curabitur gravida et quam sed at. Sit",
      createdAt: new Date("2022-04-11"),
      updatedAt: new Date(),
      orgId: org.id,
      userId: null,
    }
  } else {
    customer = dbCustomer
  }

  // Only query events if we have a real customer
  let events: EventWithService[] = []
  if (!isMockCustomer) {
    const dbEvents = await db.event.findMany({
      where: {
        customerId: customer.id,
        orgId: org.id,
      },
      include: { service: true },
    })
    // Filter to only events with a service (EventWithService requires non-null service)
    events = dbEvents.filter(
      (e): e is typeof e & { service: NonNullable<typeof e.service> } =>
        e.service !== null,
    )
  }

  // Use mock events if no real events
  if (events.length === 0) {
    events = createMockEvents(customer.displayName || "Cliente")
  }

  const _totalPoints = events.reduce(
    (acc, e) => acc + Number(e.service.points),
    0,
  )

  return {
    customer,
    org,
    events,
    stats: {
      eventCount: 32, // Mock to match Figma design
      commentsCount: 15,
      points: 80,
      since: "11 de abril de 2022",
    },
  }
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { events, stats, customer } = loaderData
  const pluralize = usePluralize()

  return (
    <div className="min-h-screen">
      {/* Header Background - Cover image from Figma */}
      <div className="absolute top-0 left-0 right-0 h-[302px] rounded-b-2xl overflow-hidden z-0">
        <img
          src="https://i.imgur.com/w038IV9.jpg"
          alt="header background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Breadcrumb */}
      <nav className="relative z-10 flex items-center gap-2 text-white text-sm pt-6 mb-16 px-1">
        <Link to="/dash/clientes" className="hover:underline">
          Clientes
        </Link>
        <span className="text-white/70">{">"}</span>
        <span>{customer.displayName}</span>
      </nav>

      {/* Profile Card */}
      <div className="relative z-10 mt-8">
        {/* Avatar positioned to overlap the card */}
        <div className="absolute -top-4 left-0 z-10">
          <Avatar
            image={MOCK_AVATAR}
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
          {/* Main content grid */}
          <div className="flex">
            {/* Left section - Profile info */}
            <div className="flex-1">
              {/* Name and action buttons row */}
              <div className="flex items-center gap-4 mb-6 pl-[150px]">
                <h1 className="text-2xl font-satoBold text-[#11151a]">
                  {customer.displayName}
                </h1>

                {/* Action buttons */}
                <div className="flex items-center gap-2 ml-auto mr-8">
                  <button className="w-10 h-10 rounded-full bg-transparent border border-[#e5e5e5] flex items-center justify-center text-[#8391a1] hover:bg-gray-50 transition">
                    <TbEdit size={20} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-transparent border border-[#e5e5e5] flex items-center justify-center text-[#25D366] hover:bg-gray-50 transition">
                    <FaWhatsapp size={20} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-transparent border border-[#e5e5e5] flex items-center justify-center text-[#8391a1] hover:bg-gray-50 transition">
                    <MailButton />
                  </button>
                  <PrimaryButton className="ml-2 min-w-0 min-h-0 h-10 px-4 gap-1">
                    <HiCalendarDays size={20} />
                    <span className="text-sm">Agendar</span>
                  </PrimaryButton>
                </div>
              </div>

              {/* Contact info row - below avatar */}
              <div className="flex items-start gap-8 text-sm mt-12">
                <div className="flex items-center gap-2">
                  <Mail className="text-[#8391a1]" />
                  <span className="text-[#4b5563]">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="text-[#8391a1]" />
                  <span className="text-[#4b5563]">
                    {customer.tel || "Sin teléfono"}
                  </span>
                </div>
                <div className="flex items-start gap-2 max-w-[248px]">
                  <FiMapPin
                    className="text-[#8391a1] mt-0.5 shrink-0"
                    size={20}
                  />
                  <span className="text-[#4b5563]">
                    {customer.address || "Sin dirección"}
                  </span>
                </div>
              </div>

              {/* Notes section */}
              <div className="flex items-start gap-2 mt-6">
                <IoDocumentTextOutline
                  className="text-[#8391a1] mt-0.5 shrink-0"
                  size={20}
                />
                <p className="text-sm text-[#4b5563] max-w-[840px]">
                  {customer.comments || "Sin comentarios"}
                </p>
              </div>
            </div>

            {/* Right section - Stats */}
            <div className="border-l border-[#e5e5e5] pl-6 min-w-[180px] self-stretch flex flex-col justify-start pt-2">
              <div className="mb-4">
                <p className="text-2xl font-satoBold text-[#11151a]">
                  {stats.eventCount} {pluralize("cita", stats.eventCount)}
                </p>
                <p className="text-xs text-[#8391a1]">desde el {stats.since}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-satoBold text-[#11151a]">
                    {stats.commentsCount}
                  </span>
                  <span className="text-yellow-500">⭐</span>
                </div>
                <p className="text-xs text-[#8391a1]">comentarios</p>
              </div>

              <div>
                <p className="text-2xl font-satoBold text-[#11151a]">
                  {stats.points}
                </p>
                <p className="text-xs text-[#8391a1]">puntos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="relative z-10 flex items-center gap-4 mt-8 mb-0">
        {/* Date filter */}
        <div className="bg-white rounded-full px-4 h-12 flex items-center gap-2 min-w-[340px]">
          <span className="text-[#8391a1] font-satoMedium text-base flex-1">
            Filtrar por fecha
          </span>
          <CalendarPicker className="text-[#8391a1]" />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Citas dropdown */}
        <div className="bg-white rounded-full px-4 h-12 flex items-center gap-2 min-w-[180px]">
          <span className="text-[#4b5563] font-satoMedium text-base">
            Citas
          </span>
          <div className="ml-auto">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="rotate-90"
            >
              <path
                d="M9 18l6-6-6-6"
                stroke="#4b5563"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Download button */}
        <button className="bg-white rounded-full w-12 h-12 flex items-center justify-center text-[#8391a1] hover:bg-gray-100 transition">
          <FiDownload size={20} />
        </button>
      </div>

      {/* Events Table */}
      <EventTable events={events} />
    </div>
  )
}
