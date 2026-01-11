// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { db } from "~/utils/db.server";
import { TbEdit } from "react-icons/tb";
import { FiDownload, FiMapPin } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";
import { BsEnvelopePlus } from "react-icons/bs";
import type { Customer, Event, Service } from "@prisma/client";
import { HiCalendarDays } from "react-icons/hi2";
import { IoIosPhonePortrait } from "react-icons/io";
import { Avatar } from "~/components/common/Avatar";
import { Client } from "./dash.clientes";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa6";
import { BasicInput } from "~/components/forms/BasicInput";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { PrimaryButton } from "~/components/common/primaryButton";
import { usePluralize } from "~/components/hooks/usePluralize";
import type { Route } from "./+types/dash_.clientes_.$email";
import { EventTable } from "./clientes/EventTable";
//@TODO: filter by date, edit contact, send email, send whats, download contacts?one?all?, delete contact
export const loader = async ({
  request,
  params: { email },
}: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  if (!org || !email) throw new Response(null, { status: 404 });

  const customer = await db.customer.findUnique({ where: { email } });
  if (!customer) throw new Response("Customer not found", { status: 404 });

  const events = await db.event.findMany({
    where: {
      customerId: customer.id,
      orgId: org.id,
    },
    include: { service: true },
  });

  return {
    customer,
    org,
    events,
    stats: {
      eventCount: events.length,
      commentsCount: 0,
      points: events.reduce((acc, e) => (acc += e.service.points), 0),
    },
  };
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const { events, stats, customer } = loaderData;
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
                  <PrimaryButton isDisabled>
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
                  <span> {customer?.email}</span>
                </p>
                <p className="flex gap-2 items-center text-brand_gray text-xs">
                  <span>
                    <IoIosPhonePortrait />
                  </span>
                  <span> {customer?.tel}</span>
                </p>
                <p className="flex gap-2 items-center text-brand_gray text-xs">
                  <span>
                    <FiMapPin />
                  </span>
                  <span className="w-32">{customer?.address}</span>
                </p>
              </div>

              {/* comments */}
              <p className="flex gap-2 items-center text-brand_gray text-xs -ml-12">
                <span>
                  <IoDocumentTextOutline />
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
          <BasicInput
            containerClassName="max-w-[180px]"
            name="dateFilter"
            type="date"
            isDisabled
          />
          <button
            disabled
            className="text-gray-400 border rounded-full h-8 w-8 p-1 grid place-content-center enabled:active:scale-95 enabled:active:shadow-inner disabled:bg-gray-100"
          >
            <FiDownload />
          </button>
        </section>
        <EventTable events={events} />
      </article>
    </>
  );
}
