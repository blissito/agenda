// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { Link, useLoaderData } from "react-router"
import { Avatar } from "~/components/common/Avatar"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { useCopyLink } from "~/components/hooks/useCopyLink"
import { Anchor } from "~/components/icons/link"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import { getServices, getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import { generateLink } from "~/utils/generateSlug"
import { BasicInput } from "~/components/forms/BasicInput"
import { DropdownMenu, MenuButton } from "~/components/common/DropDownMenu"
import { twMerge } from "tailwind-merge"
import { usePluralize } from "~/components/hooks/usePluralize"
import { Download } from "~/components/icons/download"
import { Settings } from "~/components/icons/settings"
import { Upload } from "~/components/icons/upload"
import type { Route } from "./+types/dash.clientes"
import { useDownloadToast } from "~/components/downloads/downloadToast"
import { useState, useMemo } from "react"

import { MdBlock } from "react-icons/md"
import { Graph } from "~/components/icons/Graph"
import { MagnifyingGlass } from "~/components/icons/MagnifyingGlass"

export type Client = {
  points: number
  updatedAt: Date | string
  createdAt: Date | string
  eventCount: number
  nextEventDate: Date | string
  loggedUserId?: string | null
  displayName: string | null
  email: string
  tel: string | null
  comments: string | null
  id: string
  photoUrl?: string | null
}

type Stats = {
  clientsCount: number
  percentage: string
}

type HeaderTitle = string | [string, string]

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  const link = generateLink(request.url, org.slug)
  const services = await getServices(request)
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
  })

  const clientsObject: { [x: string]: Client } = {}
  const counter: Record<string, number> = {}

  events.forEach((e) => {
    const tomorrow = new Date()
    const { email } = e.customer || {}
    if (!email) return

    counter[email] =
      counter[email] && typeof counter[email] === "number"
        ? counter[email] + 1
        : 1

    tomorrow.setDate(tomorrow.getDate() + 1)

    clientsObject[email] = {
      ...e.customer,
      email,
      points: e.service.points,
      updatedAt: e.updatedAt,
      eventCount: counter[email],
      nextEventDate: tomorrow,
      id: e.id,
    }
  })

  const clients = Object.values(clientsObject) as Client[]
  return {
    orgId: org.id,
    orgName: org.name,
    clients,
    link,
    stats: {
      clientsCount: clients.length,
      percentage: `${clients.length * 100}%`,
    } as Stats,
  }
}

export default function Clients() {
  const { orgId, orgName, stats, clients = [], link } =
    useLoaderData<typeof loader>()

  const [search, setSearch] = useState("")

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return clients
    return clients.filter((c) => {
      return (
        c.displayName?.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.tel?.toLowerCase().includes(q)
      )
    })
  }, [clients, search])

  const { startDownload, toast, canDownload } = useDownloadToast({
    clients,
    orgName,
  })

  return (
    <>
      <RouteTitle>Clientes</RouteTitle>
      <Summary stats={stats} clients={clients} />
      <SearchNav
        onDownload={startDownload}
        canDownload={canDownload}
        search={search}
        onSearch={setSearch}
      />

      <TableHeader
        titles={[
          ["Cliente", "col-span-4 pl-2"],
          ["Registro", "col-span-2 text-center"],
          ["Puntos", "col-span-2 text-center"],
          ["Citas", "col-span-1 text-center"],
          ["Próxima cita", "col-span-2 text-center"],
          ["Acciones", "col-span-1 text-center"],
        ]}
      />

      {filteredClients.map((c, index) => (
        <ClientRow client={c} key={c.id} isLast={index === filteredClients.length - 1} />
      ))}

      {!filteredClients.length && search && (
        <EmptySearch query={search} onClear={() => setSearch("")} />
      )}

      {!clients.length && !search && <EmptyStateClients link={link} />}

      {toast}
    </>
  )
}

const SearchNav = ({
  onDownload,
  canDownload,
  search,
  onSearch,
}: {
  onDownload: () => void
  canDownload: boolean
  search: string
  onSearch: (v: string) => void
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center my-4">
     <div className="relative w-full sm:max-w-80">
        <BasicInput
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          type="search"
          placeholder="Busca por nombre,email,teléfono"
          containerClassName="w-full"
          inputClassName="!rounded-full pr-12 border-white"
        />
        <MagnifyingGlass className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-brand_iron" />
      </div>
      <div className="flex flex-wrap pt-2 gap-3 justify-start sm:justify-end">
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
        <ActionButton onClick={onDownload} isDisabled={!canDownload}>
          <Download />
        </ActionButton>
      </div>
    </div>
  )
}

export const ActionButton = ({
  className,
  isDisabled,
  ...props
}: {
  className?: string
  isDisabled?: boolean
  [x: string]: unknown
}) => (
  <button
    className={twMerge(
      "text-brand_gray border rounded-full h-10 w-10 p-1 flex justify-center items-center enabled:active:scale-95 enabled:active:shadow-inner disabled:bg-gray-100 disabled:text-gray-400 bg-white transition-colors enabled:hover:bg-slate-50",
      className,
    )}
    disabled={isDisabled}
    {...props}
  />
)

export const TableHeader = ({ titles }: { titles: HeaderTitle[] }) => {
  return (
    <div className="grid grid-cols-12 rounded-t-2xl border-t border-x border-b border-slate-200 bg-white mt-4 px-2 sm:px-4 py-3 text-[12px] font-satoMedium uppercase tracking-wide text-slate-600 items-center">
      {titles.map((t) => {
        const title = Array.isArray(t) ? t[0] : t
        const classes = Array.isArray(t) ? t[1] : "col-span-2 text-center"

        const isName = title.toLowerCase() === "cliente"
        const isActions = title.toLowerCase() === "acciones"
        const responsiveHide = isName || isActions ? "" : "hidden sm:block"

        return (
          <h3
            className={twMerge(
              "capitalize whitespace-nowrap",
              classes,
              responsiveHide,
            )}
            key={`${title}-${classes}`}
          >
            {title}
          </h3>
        )
      })}
    </div>
  )
}

export const ClientRow = ({ client, isLast }: { client: Client, isLast?: boolean }) => {
  const initials = getInitials2(client.displayName, client.email)

  return (
    <div className={twMerge(
      "grid grid-cols-12 border-b border-x border-slate-200 bg-white hover:bg-slate-50 transition-colors items-center px-2 sm:px-4",
      isLast && "rounded-b-2xl"
    )}>
      <Link
        to={`${client.email}`}
        state={{ client }}
        className="col-span-11 grid grid-cols-11 items-center py-3 min-w-0 "
      >
        <div className="flex gap-3 items-center col-span-11 sm:col-span-4 min-w-0 ">
          <ClientAvatar
            photoUrl={client.photoUrl}
            initials={initials}
            size="sm"
          />

          <div className="min-w-0">
            <p className="font-semibold text-brand_dark text-sm truncate leading-tight ">
              {client.displayName || "—"}
            </p>
            <p className="text-xs font-satoMedium text-brand_gray truncate">{client.email}</p>
          </div>
        </div>

        <p className="hidden font-satoMedium sm:block text-sm col-span-2 text-center text-brand_gray whitespace-nowrap pl-4">
          {new Date(client.createdAt || client.updatedAt).toLocaleDateString(
            "es-MX",
            { day: "numeric", month: "short", year: "numeric" },
          )}
        </p>

        <p className="hidden sm:block text-sm col-span-2 text-center font-semibold text-brand_gray whitespace-nowrap -ml-1">
          {client.points}
          <span className="font-semibold text-brand_gray ml-1">pts</span>
        </p>

        <p className="hidden sm:block text-sm col-span-1 text-center text-brand_gray whitespace-nowrap -ml-6">
          {client.eventCount}
        </p>

        <p className="hidden sm:block col-span-2 text-sm text-center text-brand_green whitespace-nowrap -ml-1">
          {client.nextEventDate
            ? new Date(client.nextEventDate).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </p>
      </Link>

      <div
        className="col-span-1 flex items-center justify-center py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <MenuButton
            to=""
            className=" text-brand_gray hover:brand_red"
            icon={<MdBlock className="text-[#6B7280]" />}
          >
            Bloquear cliente
          </MenuButton>
        </DropdownMenu>
      </div>
    </div>
  )
}

function getInitials2(displayName: string | null, email: string) {
  const name = (displayName || "").trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    if (parts.length === 1) {
      const w = parts[0]
      return (w.slice(0, 2) || email.slice(0, 2)).toUpperCase()
    }
  }
  return (email.slice(0, 2) || "DE").toUpperCase()
}

export const ClientAvatar = ({
  photoUrl,
  initials,
  size = "sm",
}: {
  photoUrl?: string | null
  initials: string
  size?: "sm" | "md"
}) => {
  const [imageError, setImageError] = useState(false)

  const dim = size === "md" ? "w-10 h-10 text-sm" : "w-11 h-11 text-sm"

  if (!photoUrl || imageError) {
    return (
      <div
        className={twMerge(
          "rounded-full bg-brand_blue text-white flex items-center justify-center font-semibold shrink-0",
          dim,
        )}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={photoUrl}
      alt={initials}
      className={twMerge(
        "rounded-full object-cover shrink-0 border border-slate-200",
        dim,
      )}
      onError={() => setImageError(true)}
    />
  )
}

export const Summary = ({
  stats,
  clients,
}: {
  stats: Stats
  clients: Client[]
}) => {
  const pluralize = usePluralize()

  const maxVisible = 4
  // Ordenar por fecha de creación descendente (más recientes primero)
  const sortedClients = [...clients].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.updatedAt).getTime()
    const dateB = new Date(b.createdAt || b.updatedAt).getTime()
    return dateB - dateA // Más reciente primero
  })
  
  const previewClients = sortedClients.slice(0, maxVisible)
  const overflow = Math.max(0, clients.length - previewClients.length)

  return (
    <section className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div className="min-w-0">
        <p className="leading-tight">
          <span className="text-brand_blue text-2xl font-satoMedium mr-1">
            {stats.clientsCount} {pluralize("cliente", stats.clientsCount)}{" "}
            {pluralize("nuevo", stats.clientsCount)}
          </span>{" "}
          <span className="text-2xl">este mes</span>
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Graph className="text-brand_gray shrink-0 w-4 h-4" />
          <p className="text-brand_gray font-satoshi">
            {stats.percentage} más que el mes anterior
          </p>
        </div>
      </div>

      <div className="flex items-center">
        {previewClients.length === 0 ? (
          <>
            <div className="bg-brand_blue text-white w-12 h-12 rounded-full grid place-items-center border-2 border-white text-sm font-semibold shrink-0">
              --
            </div>
            <div className="bg-brand_blue text-white w-12 h-12 rounded-full grid place-items-center -ml-3 border-2 border-white text-sm font-semibold shrink-0">
              --
            </div>
            <div className="bg-brand_blue text-white w-12 h-12 rounded-full grid place-items-center -ml-3 border-2 border-white text-sm font-semibold shrink-0">
              --
            </div>
            <div className="bg-brand_blue text-white w-12 h-12 rounded-full grid place-items-center -ml-3 border-2 border-white text-sm font-semibold shrink-0">
              --
            </div>
          </>
        ) : (
          previewClients.map((c, i) => {
            const initials = getInitials2(c.displayName, c.email)
            return (
              <div
                key={c.id}
                className={twMerge(
                  "bg-brand_blue text-white w-12 h-12 rounded-full grid place-items-center border-2 border-white text-sm font-semibold shrink-0",
                  i > 0 ? "-ml-3" : ""
                )}
              >
                {initials}
              </div>
            )
          })
        )}

        {overflow > 0 && (
          <div className="bg-[#F8F8F8] text-brand_blue w-12 h-12 rounded-full grid place-items-center -ml-3 border-2 border-white text-sm font-semibold shrink-0">
            +{overflow}
          </div>
        )}
      </div>
    </section>
  )
}

const EmptySearch = ({
  query,
  onClear,
}: {
  query: string
  onClear: () => void
}) => (
  <div className="bg-white py-16 flex flex-col items-center gap-3 text-center border-b border-slate-100">
    <MagnifyingGlass className="w-12 h-12 text-brand_gray" />
    <p className="font-satoMedium text-lg">
      Sin resultados para &quot;{query}&quot;
    </p>
    <p className="text-brand_gray text-sm">
      Intenta buscar por otro nombre, correo o teléfono
    </p>
    <button
      onClick={onClear}
      className="mt-2 text-brand_blue text-sm underline underline-offset-2"
    >
      Limpiar búsqueda
    </button>
  </div>
)

const EmptyStateClients = ({ link }: { link: string }) => {
  const { setLink, ref } = useCopyLink(link)
  return (
    <div className="w-full h-[80vh] bg-cover mt-10 flex justify-center items-center px-4">
      <div className="text-center">
        <img
          className="mx-auto mb-4 max-w-full"
          src="/images/clients-empty.svg"
          alt="illustration"
        />
        <p className="font-satoMedium text-xl font-bold">
          ¡Nada por aquí! <span className="text-2xl">👀</span>
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
  )
}