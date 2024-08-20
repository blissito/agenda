import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { cn } from "~/utils/cd";
import { useEffect } from "react";
import { db } from "~/utils/db.server";
import { TbEdit } from "react-icons/tb";
import { FiDownload, FiMapPin } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";
import { BsEnvelopePlus } from "react-icons/bs";
import { Event, Service } from "@prisma/client";
import { HiCalendarDays } from "react-icons/hi2";
import { IoIosPhonePortrait } from "react-icons/io";
import { Avatar } from "~/components/common/Avatar";
import { Client, TableHeader } from "./dash.clientes";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaRegClock, FaWhatsapp } from "react-icons/fa6";
import { BasicInput } from "~/components/forms/BasicInput";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getUserAndOrgOrRedirect } from "~/db/userGetters";
import { DropdownMenu } from "~/components/common/DropDownMenu";
import { PrimaryButton } from "~/components/common/primaryButton";
import { usePluralize } from "~/components/hooks/usePluralize";
//@TODO: filter by date, edit contact, send email, send whats, download contacts?one?all?, delete contact
export const loader = async ({
  request,
  params: { email },
}: LoaderFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  if (!org || !email) throw json(null, { status: 404 });
  const services = await db.service.findMany({ where: { orgId: org.id } });
  const serviceIdsList = services.map((s) => ({ $oid: s.id })); // in order to findRaw to work
  const rawEvents: Partial<Event & { _id: { $oid: string } }>[] =
    (await db.event.findRaw({
      filter: {
        $and: [
          { "customer.email": email },
          { serviceId: { $in: serviceIdsList } },
        ],
      },
    })) ?? [];
  const specificIds = rawEvents.map((re) => re._id?.$oid);
  const events = (await db.event.findMany({
    where: { id: { in: specificIds } },
    include: { service: true },
  })) as (Event & { service: Service })[];

  return {
    org,
    events,
    stats: {
      eventCount: events.length,
      commentsCount: 0,
      points: events.reduce((acc, e) => (acc += e.service.points), 0),
    },
  };
};

// type LoaderType = Awaited<ReturnType<typeof loader>>;

export default function Page() {
  const { events, stats } = useLoaderData<typeof loader>();
  const location = useLocation();
  const { client } = location.state
    ? (location.state as Client)
    : { client: null };
  const navigate = useNavigate();

  useEffect(() => {
    // @TODO improve
    if (!client) {
      navigate("/dash/clientes");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
          <div className="text-brand_gray flex items-center gap-2 max-w-4xl mx-auto relative pt-8">
            <Link to={`/dash/clientes`} className="text-xs text-white">
              Clientes
            </Link>
            <span className="text-white pb-1">&gt;</span>
            <Link to="" className="text-xs text-white">
              {/* {client?.displayName} */} Isabel Lozano
            </Link>
          </div>
        </div>
        {/* CTAs */}
        <div className="bg-white rounded-xl pb-6 max-w-4xl -mt-24 mx-auto relative border">
          <Avatar className="w-24 h-24 border-8 border-brand_blue absolute -top-6 -left-4 hover:scale-105 transition-all" />
          <div className="md:flex-row flex flex-col">
            <section className="pl-20 pr-6 pt-4 font-bold text-lg flex flex-col items-start justify-between w-full">
              <div className="flex items-center w-full justify-between">
                <h1>Isabel Lozano</h1>
                <div className="flex gap-3 items-center">
                  <button className="text-gray-400 border rounded-full h-8 w-8 p-1 flex justify-center items-center active:scale-95 active:shadow-inner ">
                    <FaWhatsapp />
                  </button>
                  <button
                    disabled
                    className="text-gray-400 border rounded-full h-8 w-8 p-1 flex justify-center items-center enabled:active:scale-95 enabled:active:shadow-inner disabled:bg-gray-100"
                  >
                    <TbEdit />
                  </button>
                  <button
                    disabled
                    className="text-gray-400 border rounded-full h-8 w-8 p-1 flex justify-center items-center enabled:active:scale-95 enabled:active:shadow-inner disabled:bg-gray-100"
                  >
                    <BsEnvelopePlus />
                  </button>
                  <PrimaryButton>
                    <span>
                      <HiCalendarDays />
                    </span>
                    Agendar
                  </PrimaryButton>
                </div>
              </div>
              {/* Basic data */}
              <div className="flex gap-4 -ml-12 flex-col mt-4 md:flex-row md:mt-0 md:gap-20">
                <p className="flex gap-2 items-center text-brand_gray text-xs">
                  <span>
                    <HiOutlineMail />
                  </span>
                  <span>Isabela_lozano_lopez@gmail.com</span>
                </p>
                <p className="flex gap-2 items-center text-brand_gray text-xs">
                  <span>
                    <IoIosPhonePortrait />
                  </span>
                  <span>55 5555 55 55</span>
                </p>
                <p className="flex gap-2 items-center text-brand_gray text-xs">
                  <span>
                    <FiMapPin />
                  </span>
                  <span className="w-32">
                    Av. Lopez Mateos 116, col. centro. CDMX, MEX
                  </span>
                </p>
              </div>
              {/* Description */}

              <p className="flex gap-2 items-center text-brand_gray text-xs -ml-12">
                <span>
                  <IoDocumentTextOutline />
                </span>
                <span>
                  Lorem ipsum dolor sit amet consectetur. At mattis nulla sed
                  curabitur gravida et quam sed at. Sit tellus hendrerit
                  volutpat sed ac consequat eros in et. Phasellus odio nisi
                  urna. nulla sed curabitur gravida et quam sed at. Sit
                </span>
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
          <BasicInput
            // isDisabled
            type="date"
            containerClassName="max-w-[240px]"
          />
          <Link className="pt-3" to="">
            <button
              disabled
              className="text-gray-400 border rounded-full h-8 w-8 p-1 flex justify-center items-center enabled:active:scale-95 enabled:active:shadow-inner disabled:bg-gray-100"
            >
              <FiDownload />
            </button>
          </Link>
        </section>
        <section className="max-w-4xl mx-auto">
          <TableHeader
            titles={[
              "fecha",
              "servicio",
              "encargado",
              ["puntos", "col-span-1"],
              "precio",
              "estatus",
              ["acciones", "col-span-1"],
            ]}
          />

          {events.map((event) => (
            <EventRow event={event} key={event.id} />
          ))}
        </section>
      </article>
    </>
  );
}

export const EventRow = ({
  event,
}: {
  event: Event & { service: Service };
}) => {
  const getEventDate = () => {
    return new Date(event.start).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-12 px-8 py-4 bg-white border-b text-xs">
      <p className="flex items-center gap-2 col-span-2">
        <span>
          <FaRegClock />
        </span>
        {getEventDate()}
      </p>
      <p className="col-span-2 font-satoMedium">{event.service.name}</p>
      <p className="col-span-2">{event.service.employeeName || "s/n"}</p>
      <p className="col-span-1">{event.service.points}</p>
      <p className="col-span-1">{event.service.price}</p>
      {/* @TODO: crea un componente con las multiples tags */}
      <p className="col-span-3 flex gap-1 items-start">
        <span
          className={cn("px-1 py-[1px] rounded", {
            "bg-brand_blue/30": true,
            "bg-green-300": event.status === "ACTIVE",
            "bg-red-300": event.status === "CANCELED",
          })}
        >
          {event.status == "ACTIVE"
            ? "🔔 confirmada"
            : event.status === "CANCELED"
            ? "⛔️ cancelada"
            : "💤 atrasada"}
        </span>
        <span
          className={cn("px-1 py-[1px] rounded", {
            "bg-brand_blue/30": event.paid,
            "bg-blue-200": !event.paid,
          })}
        >
          {event.paid ? "💵 pagado" : "💸 sin pagar"}
        </span>
      </p>
      <div className="col-span-1">
        <DropdownMenu />
      </div>
    </div>
  );
};
