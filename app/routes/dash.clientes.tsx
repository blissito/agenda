import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Avatar } from "~/components/common/Avatar";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { useCopyLink } from "~/components/hooks/useCopyLink";
import { Anchor } from "~/components/icons/link";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getServices, getUserAndOrgOrRedirect } from "~/db/userGetters";
import { db } from "~/utils/db.server";
import { generateLink } from "~/utils/generateSlug";
import { BasicInput } from "~/components/forms/BasicInput";
import { DropdownMenu, MenuButton } from "~/components/common/DropDownMenu";
import { BiSolidUserDetail } from "react-icons/bi";

export type Client = {
  points: number;
  updatedAt: Date | string;
  createdAt: Date | string;
  eventCount: number;
  nextEventDate: Date | string;
  loggedUserId?: string | null;
  displayName: string | null;
  email: string;
  tel: string | null;
  comments: string | null;
  id: string;
};

type Stats = {
  clientsCount: number;
  percentage: string;
};

// @TODO generate custom model
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  const link = generateLink(request.url, org.slug);
  const services = await getServices(request);
  const events = await db.event.findMany({
    where: {
      NOT: { customer: { email: null } },
      service: {
        id: { in: services.map((s) => s.id) },
      },
    },
  });

  const clientsObject: { [x: string]: Client } = {};

  events.forEach((e) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (e.customer.email) {
      clientsObject[e.customer.email] = {
        ...e.customer,
        email: e.customer.email,
        points: 0,
        updatedAt: e.updatedAt,
        eventCount: 12, // @TODO: count while filter
        nextEventDate: tomorrow,
        id: e.id, // @TODO: not the right id
      };
    }
  });

  return {
    orgId: org.id,
    clients: Object.values(clientsObject) as Client[],
    link,
    stats: {
      clientsCount: 77,
      percentage: "250%",
      srcset: [], // @TODO: real user images?
    } as Stats,
  };
};

export default function Clients() {
  const { orgId, stats, clients = [], link } = useLoaderData<typeof loader>();
  return (
    <>
      <RouteTitle>Clientes</RouteTitle>
      <Summary stats={stats} />
      <SearchNav />
      <TableHeader />
      {clients.map((c) => (
        <Client client={c} key={c.id} orgId={orgId} />
      ))}
      {!clients.length && <EmptyStateClients link={link} />}
    </>
  );
}
const SearchNav = () => {
  return (
    <div className="flex justify-between items-center my-4">
      <BasicInput
        isDisabled // @TODO: make it work
        icon={<span>🔍</span>}
        type="search"
        placeholder="Busca a un cliente"
        containerClassName="max-w-72"
      />

      <div className="flex pt-2 gap-3">
        <Link to="">
          <button className="hover:scale-95 active:scale-90">
            <img
              className="w-10"
              src="/dash_clients_icons/settings.svg"
              alt="icon"
            />
          </button>
        </Link>
        <Link to="">
          <button className="hover:scale-95 active:scale-90">
            <img
              className="w-10"
              src="/dash_clients_icons/upload.svg"
              alt="icon"
            />
          </button>
        </Link>
        <Link to="">
          <button className="hover:scale-95 active:scale-90">
            <img
              className="w-10"
              src="/dash_clients_icons/download.svg"
              alt="icon"
            />
          </button>
        </Link>
      </div>
    </div>
  );
};

export const TableHeader = () => {
  return (
    <div className="grid grid-cols-12 text-xs font-thin rounded-t-2xl border-t text-brand_gray py-2 px-8 bg-white border-slate-100 border mt-4">
      <h3 className="col-span-3 capitalize">cliente</h3>
      <h3 className="col-span-2 capitalize">registro</h3>
      <h3 className="col-span-2 capitalize">puntos</h3>
      <h3 className="col-span-2 capitalize">cita</h3>
      <h3 className="col-span-2 capitalize">próxima cita</h3>
      <h3 className="col-span-1 capitalize">acciones</h3>
    </div>
  );
};

export const Client = ({ client }: { client: Client }) => {
  const letters =
    client.displayName && client.displayName.length > 1
      ? (
          client.displayName.charAt(0) + client.displayName.charAt(1)
        ).toUpperCase()
      : "DE";
  return (
    <div className=" border-slate-100 grid items-center grid-cols-12 py-3 border-b-[1px] bg-white px-8">
      <div className="flex gap-3 items-center col-span-3">
        {/* <img alt="avatar" src={client.displayName?.charAt(0)} /> */}
        <div className="min-w-8 h-8 flex justify-center items-center rounded-full bg-brand_blue text-white">
          {letters}
        </div>
        <div>
          <p className="font-bold">{client.displayName}</p>
          <p className="text-xs font-thin text-brand_gray">{client.email}</p>
        </div>
      </div>
      <p className="w-max text-xs col-span-2">
        {new Date(client.createdAt || client.updatedAt).toLocaleDateString(
          "es-MX",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )}
      </p>
      <p className="font-bold text-xs col-span-2">{client.points} puntos</p>
      <p className="text-xs font-thin col-span-2">{client.eventCount} citas</p>
      <p className="w-max col-span-2 text-green-600 text-xs">
        {client.nextEventDate
          ? new Date(client.nextEventDate).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "---"}
      </p>
      {/* <button className="text-xl">
        <BsThreeDots />
      </button> */}
      <DropdownMenu>
        <MenuButton
          to={`${client.email}`}
          state={{ client }}
          className="text-brand-gray"
          icon={
            <span>
              {/* <MdBlock /> */}
              <BiSolidUserDetail />
            </span>
          }
        >
          Detalle del cliente
        </MenuButton>
      </DropdownMenu>
    </div>
  );
};

export const Summary = ({ stats }: { stats: Stats }) => {
  return (
    <section className="bg-white rounded-2xl p-6 flex justify-between items-center">
      <div>
        <p>
          <span className="text-brand_blue text-2xl font-satoMedium mr-1">
            {stats.clientsCount} clientes nuevos
          </span>{" "}
          este mes
        </p>
        <p className="text-brand_gray font-satoshi mt-2">
          {stats.percentage} más que el mes anterior
        </p>
      </div>
      <div className="flex ">
        <Avatar />
        <Avatar />
        <Avatar />
        <Avatar />
        <div className="bg-brand_blue/20 text-brand_blue w-12 h-12 rounded-full grid content-center text-center -ml-3  border-[2px] border-white">
          <span>+ 10</span>
        </div>
      </div>
    </section>
  );
};

const EmptyStateClients = ({ link }: { link: string }) => {
  const { setLink, ref } = useCopyLink(link);
  return (
    <div className=" w-full h-[80vh] bg-cover  mt-10 flex justify-center items-center">
      <div className="text-center">
        <img
          className="mx-auto mb-4"
          src="/images/clients-empty.svg"
          alt="illustration"
        />
        <p className="font-satoMedium text-xl font-bold">
          ¡Nada por aquí! <span className="text-2xl ">👀</span>{" "}
        </p>
        <p className="mt-2 text-brand_gray">
          Comparte tu agenda y empieza a recibir a tus clientes
        </p>
        <SecondaryButton
          ref={ref}
          onClick={setLink}
          className="mx-auto mt-12 bg-transparent border-[1px] border-[#CFCFCF]"
        >
          <Anchor /> Copiar link
        </SecondaryButton>
      </div>
    </div>
  );
};
