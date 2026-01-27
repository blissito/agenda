// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { Link } from "react-router";
import { db } from "~/utils/db.server";
import { Avatar } from "~/components/common/Avatar";
import { TbEdit } from "react-icons/tb";
import { FiDownload, FiMapPin } from "react-icons/fi";
import { HiCalendarDays } from "react-icons/hi2";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa6";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { PrimaryButton } from "~/components/common/primaryButton";
import { usePluralize } from "~/components/hooks/usePluralize";
import { Mail } from "~/components/icons/mail";
import { MailButton } from "~/components/icons/mailButton";
import { CalendarPicker } from "~/components/icons/calendarPicker";
import { Phone } from "~/components/icons/phone";
import type { Route } from "./+types/dash_.clientes_.$email";
import { EventTable } from "./clientes/EventTable";

// Mock avatar image from Figma (valid for 7 days)
const MOCK_AVATAR = "https://www.figma.com/api/mcp/asset/3f2720cf-f252-4635-97c8-073948b07470";
//@TODO: filter by date, edit contact, send email, send whats, download contacts?one?all?, delete contact

// Mock events data for visualization
const createMockEvents = (customerName: string) => [
  {
    id: "mock-1",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: false,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: 15,
      price: 399,
      employeeName: "Brenda Ortega",
    },
  },
  {
    id: "mock-2",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: true,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: 15,
      price: 399,
      employeeName: "Brenda Ortega",
    },
  },
  {
    id: "mock-3",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: true,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: 15,
      price: 399,
      employeeName: "Brenda Ortega",
    },
  },
  {
    id: "mock-4",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "CANCELED",
    paid: false,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: 15,
      price: 399,
      employeeName: "Brenda Ortega",
    },
  },
  {
    id: "mock-5",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: true,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: 15,
      price: 399,
      employeeName: "Brenda Ortega",
    },
  },
  {
    id: "mock-6",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: true,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: 15,
      price: 399,
      employeeName: "Brenda Ortega",
    },
  },
  {
    id: "mock-7",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: true,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: 15,
      price: 399,
      employeeName: "Brenda Ortega",
    },
  },
  {
    id: "mock-8",
    start: new Date("2024-04-30T15:00:00"),
    end: new Date("2024-04-30T16:00:00"),
    status: "ACTIVE",
    paid: true,
    service: {
      id: "s1",
      name: "Clase de piano",
      points: 15,
      price: 399,
      employeeName: "Brenda Ortega",
    },
  },
];

export const loader = async ({
  request,
  params: { email },
}: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  if (!org || !email) throw new Response(null, { status: 404 });

  // Try to find real customer or create mock
  let customer = await db.customer.findFirst({ where: { email } });
  let isMockCustomer = false;

  // If no customer found, create mock data for visualization
  if (!customer) {
    isMockCustomer = true;
    customer = {
      id: "mock-customer",
      email,
      displayName: email.split("@")[0].split("_").map(w =>
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(" "),
      tel: "55 555 55 55",
      address: "Av. Lopez Mateos 116, col. centro, CDMX, MEX",
      comments: "Lorem ipsum dolor sit amet consectetur. At mattis nulla sed curabitur gravida et quam sed at. Sit tellus hendrerit volutpat sed ac consequat eros in et.",
      createdAt: new Date("2022-04-11"),
      updatedAt: new Date(),
    };
  }

  // Only query events if we have a real customer
  let events = isMockCustomer
    ? []
    : await db.event.findMany({
        where: {
          customerId: customer.id,
          orgId: org.id,
        },
        include: { service: true },
      });

  // Use mock events if no real events
  if (events.length === 0) {
    events = createMockEvents(customer.displayName || "Cliente");
  }

  const totalPoints = events.reduce((acc, e) => acc + (e.service?.points || 0), 0);

  return {
    customer,
    org,
    events,
    stats: {
      eventCount: events.length,
      commentsCount: 15,
      points: totalPoints || 80,
      since: "11 de abril de 2022",
    },
  };
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const { events, stats, customer } = loaderData;
  const pluralize = usePluralize();
  return (
    <>
      {/* Container */}
      <article className="min-h-screen bg-[#f7f7f7] pb-8">
        <div className="h-[240px] relative bg-purple-500">
          <img
            src="/images/schedule.png"
            alt="cover"
            className="object-cover h-full w-full absolute"
          />
          <div className="text-brand_gray flex items-center gap-2 max-w-4xl mx-auto relative pt-8 ml-10">
            <Link to={`/dash/clientes`} className="text-xs text-white">
              Clientes
            </Link>
            <span className="text-white pb-1">&gt;</span>
            <Link to="" className="text-xs text-white">
              {customer?.displayName}
            </Link>
          </div>
        </div>
        {/* CTAs */}
        <div className="bg-white rounded-xl pb-6 max-w-4xl -mt-24 mx-auto relative border">
          <Avatar className="w-24 h-24 border-8 border-brand_blue absolute -top-6 -left-4 hover:scale-105 transition-all" />
          <div className="md:flex-row flex flex-col">
            <section className="pl-20 pr-6 pt-4 font-bold text-lg flex flex-col items-start justify-between w-full">
              <div className="flex items-center w-full justify-between">
                <h1>{customer?.displayName}</h1>
                <div className="flex gap-3 items-center">
                  <button
                    disabled
                    className="text-[#4b5563] border border-gray-200 rounded-full h-10 w-10 flex justify-center items-center enabled:active:scale-95 enabled:active:shadow-inner disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <TbEdit className="w-5 h-5" />
                  </button>
                  <button className="text-[#4b5563] border border-gray-200 rounded-full h-10 w-10 flex justify-center items-center active:scale-95 active:shadow-inner">
                    <FaWhatsapp className="w-5 h-5" />
                  </button>
                  <button
                    disabled
                    className="text-[#4b5563] border border-gray-200 rounded-full h-10 w-10 flex justify-center items-center enabled:active:scale-95 enabled:active:shadow-inner disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <MailButton fill="currentColor" className="w-6 h-6" />
                  </button>
                  <PrimaryButton isDisabled>
                    <span>
                      <HiCalendarDays className="w-6 h-6" />
                    </span>
                    Agendar
                  </PrimaryButton>
                </div>
              </div>
              {/* Basic data */}
              <div className="flex gap-4 -ml-12 flex-col mt-4 md:flex-row md:mt-0 md:gap-20">
                <p className="flex gap-2 items-center text-[#4b5563] text-xs">
                  <span className="w-5 h-5 flex-shrink-0">
                    <Mail stroke="#4b5563" className="w-5 h-5" />
                  </span>
                  <span>{customer?.email}</span>
                </p>
                <p className="flex gap-2 items-center text-[#4b5563] text-xs">
                  <span className="w-5 h-5 flex-shrink-0">
                    <Phone fill="#4b5563" className="w-5 h-5" />
                  </span>
                  <span>{customer?.tel}</span>
                </p>
                <p className="flex gap-2 items-center text-[#4b5563] text-xs">
                  <span className="w-5 h-5 flex-shrink-0">
                    <FiMapPin className="w-5 h-5" />
                  </span>
                  <span className="w-32">{customer?.address}</span>
                </p>
              </div>

              {/* comments */}
              <p className="flex gap-2 items-center text-[#4b5563] text-xs -ml-12">
                <span className="w-5 h-5 flex-shrink-0">
                  <IoDocumentTextOutline className="w-5 h-5" />
                </span>
                <span>{customer?.comments}</span>
              </p>
            </section>
            {/* Datos */}
            <section className="flex flex-col gap-4 pt-4 ml-auto pr-12 border-l pl-4 border-brand_stroke">
              <p className="flex flex-col">
                <span className="text-xl  font-satoMedium">
                  {stats.eventCount} {pluralize("cita", stats.eventCount)}
                </span>
                <span className="text-xs text-brand_gray">
                  citas desde el 11 de abril del 2022
                </span>
              </p>
              <p className="flex flex-col">
                <span className="text-xl  font-satoMedium">
                  {stats.commentsCount} ⭐️
                </span>
                <span className="text-xs text-brand_gray">comentarios</span>
              </p>
              <p className="flex flex-col">
                <span className="text-xl  font-satoMedium">{stats.points}</span>
                <span className="text-xs text-brand_gray">puntos</span>
              </p>
            </section>
          </div>
        </div>
        <section className="flex items-center justify-between max-w-4xl mx-auto my-4">
          {/* Date Filter - Pill shape with icon on right - height 48px */}
          <div className="flex items-center gap-2 bg-white rounded-[99px] pl-4 pr-3 h-12 w-[340px]">
            <span className="flex-1 font-satoMedium text-[16px] text-[#8391a1]">
              Filtrar por fecha
            </span>
            <CalendarPicker fill="#4b5563" stroke="#4b5563" className="w-8 h-8" />
          </div>
          <div className="flex items-center gap-3">
            {/* Citas Select - Pill shape - height 48px */}
            <div className="flex items-center gap-2 bg-white rounded-[99px] px-3 h-12 min-w-[180px]">
              <span className="flex-1 font-satoMedium text-[16px] text-[#4b5563]">
                Citas
              </span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#4b5563] rotate-90">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Download button - 48x48px */}
            <button
              disabled
              className="bg-white text-[#4b5563] rounded-full h-12 w-12 grid place-content-center enabled:active:scale-95 disabled:opacity-50"
            >
              <FiDownload className="w-6 h-6" />
            </button>
          </div>
        </section>
        <EventTable events={events} />
      </article>
    </>
  );
}
