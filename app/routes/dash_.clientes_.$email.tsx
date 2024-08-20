import { Event } from "@prisma/client";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { useEffect } from "react";
import { getUserAndOrgOrRedirect } from "~/db/userGetters";
import { db } from "~/utils/db.server";
import { BsEnvelopePlus } from "react-icons/bs";
import { Client } from "./dash.clientes";
import { Avatar } from "~/components/common/Avatar";
import { FaWhatsapp } from "react-icons/fa6";
import { TbEdit } from "react-icons/tb";
import { PrimaryButton } from "~/components/common/primaryButton";
import { HiCalendarDays } from "react-icons/hi2";
import { HiOutlineMail } from "react-icons/hi";
import { IoIosPhonePortrait } from "react-icons/io";
import { FiMapPin } from "react-icons/fi";
import { IoDocumentTextOutline } from "react-icons/io5";

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
  const events = await db.event.findMany({
    where: { id: { in: specificIds } },
    include: { service: true },
  });

  return { org, events };
};

export default function Page() {
  const { events, org } = useLoaderData<typeof loader>();
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
  console.log("Client: ", client);
  return (
    <>
      <article className="min-h-screen bg-[#f7f7f7] ">
        <div className="h-[240px] relative bg-purple-500">
          <img
            src="/public/images/schedule.png"
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
                  <button className="text-gray-400 border rounded-full h-8 w-8 p-1 flex justify-center items-center active:scale-95 active:shadow-inner ">
                    <TbEdit />
                  </button>
                  <button className="text-gray-400 border rounded-full h-8 w-8 p-1 flex justify-center items-center active:scale-95 active:shadow-inner ">
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

              <div className="flex gap-4 -ml-12 flex-col mt-4 md:flex-row md:mt-0">
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

            <section className="flex flex-col gap-4 pt-4 ml-auto pr-12 border-l pl-4 border-brand_stroke">
              <p className="flex flex-col">
                <span className="text-xl  font-satoMedium">32 citas</span>
                <span className="text-xs text-brand_gray">
                  citas desde el 11 de abril del 2022
                </span>
              </p>
              <p className="flex flex-col">
                <span className="text-xl  font-satoMedium">15 ⭐️</span>
                <span className="text-xs text-brand_gray">comentarios</span>
              </p>
              <p className="flex flex-col">
                <span className="text-xl  font-satoMedium">90</span>
                <span className="text-xs text-brand_gray">puntos</span>
              </p>
            </section>
          </div>
        </div>
      </article>
    </>
  );
}
