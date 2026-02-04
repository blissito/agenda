// app/routes/dash.clientes.tsx
// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { Link, useLoaderData } from "react-router";
import { Avatar } from "~/components/common/Avatar";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { useCopyLink } from "~/components/hooks/useCopyLink";
import { Anchor } from "~/components/icons/link";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getServices, getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { db } from "~/utils/db.server";
import { generateLink } from "~/utils/generateSlug";
import { BasicInput } from "~/components/forms/BasicInput";
import { DropdownMenu, MenuButton } from "~/components/common/DropDownMenu";
import { BiSolidUserDetail } from "react-icons/bi";
import { twMerge } from "tailwind-merge";
import { usePluralize } from "~/components/hooks/usePluralize";
import { Download } from "~/components/icons/download";
import { Settings } from "~/components/icons/settings";
import { Upload } from "~/components/icons/upload";
import type { Route } from "./+types/dash.clientes";

import { useDownloadToast } from "~/components/downloads/downloadToast";

// @TODO: actions, search with searchParams, real user avatars?, row actions (delete)

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
export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  const link = generateLink(request.url, org.slug);
  const services = await getServices(request);
  const events = await db.event.findMany({
    where: {
      service: {
        id: { in: services.map((s) => s.id) },
      },
    },
    include: {
      service: true,
      customer: true,
    },
  });

  const clientsObject: { [x: string]: Client } = {};

  const counter: Record<string, number> = {};
  events.forEach((e) => {
    const tomorrow = new Date();
    const { email } = e.customer || {};
    if (!email) return;
    counter[email] =
      counter[email] && typeof counter[email] === "number"
        ? counter[email] + 1
        : 1;
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (email) {
      clientsObject[email] = {
        ...e.customer,
        email,
        points: e.service.points,
        updatedAt: e.updatedAt,
        eventCount: counter[email],
        nextEventDate: tomorrow,
        id: e.id,
      };
    }
  });
  const clients = Object.values(clientsObject) as Client[];
  return {
    orgId: org.id,
    orgName: org.name, // opcional si quieres usarlo en el nombre del archivo
    clients,
    link,
    stats: {
      clientsCount: clients.length,
      percentage: `${clients.length * 100}%`,
      srcset: [],
    } as Stats,
  };
};

export default function Clients() {
  const { orgId, orgName, stats, clients = [], link } =
    useLoaderData<typeof loader>();

  const { startDownload, toast, canDownload } = useDownloadToast({
    clients,
    orgName, // puedes quitarlo si no lo quieres en el nombre del archivo
  });

  return (
    <>
      <RouteTitle>Clientes</RouteTitle>
      <Summary stats={stats} />
      <SearchNav onDownload={startDownload} canDownload={canDownload} />
      <TableHeader
        titles={[
          ["nombre", "col-span-3"],
          "registro",
          "puntos",
          ["citas", "col-span-1"],
          "próxima cita",
          "acciones",
        ]}
      />

      {clients.map((c) => (
        <Client client={c} key={c.id} orgId={orgId} />
      ))}
      {!clients.length && <EmptyStateClients link={link} />}

      {toast}
    </>
  );
}

const SearchNav = ({
  onDownload,
  canDownload,
}: {
  onDownload: () => void;
  canDownload: boolean;
}) => {
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
          <ActionButton isDisabled>
            <Settings />
          </ActionButton>
        </Link>
        <Link to="">
          <ActionButton isDisabled>
            <Upload />
          </ActionButton>
        </Link>

        {/* Botón visible de descarga (se deshabilita si no hay clientes) */}
        <ActionButton onClick={onDownload} isDisabled={!canDownload}>
          <Download />
        </ActionButton>
      </div>
    </div>
  );
};

export const ActionButton = ({
  className,
  isDisabled,
  ...props
}: {
  className?: string;
  isDisabled?: boolean;
  [x: string]: unknown;
}) => (
  <button
    className={twMerge(
      "text-brand_gray border rounded-full h-12 w-12 p-1 flex justify-center items-center enabled:active:scale-95 enabled:active:shadow-inner disabled:bg-gray-100 disabled:text-gray-400 bg-white",
      className
    )}
    disabled={isDisabled}
    {...props}
  />
);

export const TableHeader = ({
  titles,
}: {
  titles: (string | [string, string])[];
}) => {
  return (
    <div className="grid grid-cols-12 text-xs font-thin rounded-t-2xl border-t text-brand_gray py-2 px-8 bg-white border-slate-100 border mt-4">
      {titles.map((tuple: string | [string, string]) => {
        const title = Array.isArray(tuple) ? tuple[0] : tuple;
        const span = Array.isArray(tuple) ? tuple[1] : "col-span-2";
        return (
          <h3 className={twMerge("capitalize", span)} key={title}>
            {title}
          </h3>
        );
      })}
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
      <p className="text-xs font-thin col-span-1">{client.eventCount} citas</p>
      <p className="w-max col-span-2 text-green-600 text-xs">
        {client.nextEventDate
          ? new Date(client.nextEventDate).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "---"}
      </p>
      <DropdownMenu>
        <MenuButton
          to={`${client.email}`}
          state={{ client }}
          className="text-brand-gray"
          icon={
            <span>
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
  const pluralize = usePluralize();
  return (
    <section className="bg-white rounded-2xl p-6 flex justify-between items-center">
      <div>
        <p>
          <span className="text-brand_blue text-2xl font-satoMedium mr-1">
            {stats.clientsCount} {pluralize("cliente", stats.clientsCount)}{" "}
            {pluralize("nuevo", stats.clientsCount)}
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
          <span>+ {stats.clientsCount}</span>
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
