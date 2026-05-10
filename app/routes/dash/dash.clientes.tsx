// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo

import { useEffect, useMemo, useState } from "react"
import { Link, useFetcher, useLoaderData } from "react-router"
import { twMerge } from "tailwind-merge"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { ConfirmModal } from "~/components/common/ConfirmModal"
import { DropdownMenu, MenuButton } from "~/components/common/DropDownMenu"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { SuccessToast } from "~/components/common/SuccessToast"
import { getAvatarColor } from "~/components/dash/AppointmentItem"
import { useDownloadToast } from "~/components/downloads/downloadToast"
import { BasicInput } from "~/components/forms/BasicInput"
import { usePluralize } from "~/components/hooks/usePluralize"
import { Download } from "~/components/icons/download"
import { Graph } from "~/components/icons/Graph"
import { Anchor } from "~/components/icons/link"
import { MagnifyingGlass } from "~/components/icons/MagnifyingGlass"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import { db } from "~/utils/db.server"
import { generateLink } from "~/utils/generateSlug"
import { getInitials } from "~/utils/initials"
import type { Route } from "./+types/dash.clientes"

export type Client = {
  updatedAt: Date | string
  createdAt: Date | string
  eventCount: number
  nextEventDate: Date | string | null
  displayName: string | null
  email: string
  tel: string | null
  comments: string | null
  id: string
  photoUrl?: string | null
  loyaltyPoints: number | null
}

type Stats = {
  clientsCount: number
  percentage: string
}

type HeaderTitle = string | [string, string]

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  const link = generateLink(request.url, org.slug)

  const customers = await db.customer.findMany({
    where: { orgId: org.id },
    include: {
      _count: { select: { events: true } },
      events: {
        where: { start: { gte: new Date() } },
        orderBy: { start: "asc" },
        take: 1,
        select: { start: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // TODO: mover filtro a query Prisma (where: { blocked: { not: true } }) cuando todos los documentos tengan el campo `blocked`
  const clients: Client[] = customers
    .filter((c) => c.blocked !== true)
    .map((c) => ({
      id: c.id,
      displayName: c.displayName,
      email: c.email,
      tel: c.tel,
      comments: c.comments,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      eventCount: c._count.events,
      nextEventDate: c.events[0]?.start ?? null,
      loyaltyPoints: c.loyaltyPoints,
    }))

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
  const { orgName, stats, clients = [], link } = useLoaderData<typeof loader>()

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
    <div className="max-w-8xl mx-auto flex flex-col min-h-[calc(100vh-80px)]">
      <RouteTitle className="text-2xl md:text-3xl">Clientes</RouteTitle>

      {clients.length > 0 ? (
        <>
          <Summary stats={stats} clients={clients} />
          <SearchNav
            onDownload={startDownload}
            canDownload={canDownload}
            search={search}
            onSearch={setSearch}
            count={clients.length}
          />

          {filteredClients.length > 0 ? (
            <>
              <TableHeader
                titles={[
                  ["Cliente", "col-span-4 pl-2"],
                  ["Registro", "col-span-2 text-left"],
                  ["Puntos", "col-span-2 text-left"],
                  ["Citas", "col-span-1 text-left"],
                  ["Próxima cita", "col-span-2 text-left"],
                  ["Acciones", "col-start-12 col-span-1 text-center"],
                ]}
              />

              {filteredClients.map((c, index) => (
                <ClientRow
                  client={c}
                  key={c.id}
                  isLast={index === filteredClients.length - 1}
                />
              ))}
            </>
          ) : search ? (
            <EmptySearch onClear={() => setSearch("")} />
          ) : null}
        </>
      ) : (
        <EmptyStateClients link={link} />
      )}

      {toast}
    </div>
  )
}

const SearchNav = ({
  onDownload,
  canDownload,
  search,
  onSearch,
  count,
}: {
  onDownload: () => void
  canDownload: boolean
  search: string
  onSearch: (v: string) => void
  count: number
}) => {
  const pluralize = usePluralize()
  return (
    <div className="flex items-center gap-2 mt-4">
      <p className="hidden sm:block text-lg font-satoshi text-brand_dark whitespace-nowrap">
        {count} {pluralize("cliente", count)}{" "}
        {pluralize("registrado", count)}
      </p>
      <div className="flex-1" />
      <div className="relative">
        <BasicInput
          name="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          type="text"
          placeholder="Buscar"
          containerClassName="w-full"
          inputClassName="!rounded-full pl-4 pr-10 border-white font-satoshi py-2 h-12"
          registerOptions={{ required: false }}
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearch("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-[28px] -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-brand_iron hover:text-brand_dark hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          <MagnifyingGlass className="pointer-events-none absolute right-3 top-[28px] -translate-y-1/2 w-5 h-5 text-brand_iron" />
        )}
      </div>
      <ActionButton onClick={onDownload} isDisabled={!canDownload}>
        <Download />
      </ActionButton>
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
      "text-brand_gray shadow-sm rounded-full h-12 w-12 p-1 flex justify-center items-center enabled:active:scale-95 enabled:active:shadow-inner disabled:bg-gray-100 disabled:text-gray-400 bg-white transition-colors enabled:hover:shadow",
      className,
    )}
    disabled={isDisabled}
    {...props}
  />
)

export const TableHeader = ({ titles }: { titles: HeaderTitle[] }) => {
  return (
    <div className="grid grid-cols-12 rounded-t-2xl border-b border-brand_stroke bg-white mt-4 px-2 sm:px-4 py-3 text-[12px] font-satoMedium tracking-wide text-slate-600 items-center">
      {titles.map((t) => {
        const title = Array.isArray(t) ? t[0] : t
        const classes = Array.isArray(t) ? t[1] : "col-span-2 text-center"

        const isName = title.toLowerCase() === "cliente"
        const responsiveHide = isName ? "" : "hidden sm:block"

        return (
          <h3
            className={twMerge("whitespace-nowrap", classes, responsiveHide)}
            key={`${title}-${classes}`}
          >
            {title}
          </h3>
        )
      })}
    </div>
  )
}

export const ClientRow = ({
  client,
  isLast,
}: {
  client: Client
  isLast?: boolean
}) => {
  const initials = getInitials(client.displayName, client.email)
  const fetcher = useFetcher()
  const isDeleting = fetcher.state !== "idle"
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [blockOnDelete, setBlockOnDelete] = useState(false)

  const handleDelete = () => {
    setShowDeleteModal(false)
    fetcher.submit(
      { customerId: client.id, block: String(blockOnDelete) },
      { method: "POST", action: "/api/customers?intent=delete" },
    )
    setBlockOnDelete(false)
  }

  if (isDeleting) return null

  return (
    <div
      className={twMerge(
        "grid grid-cols-12 border-b border-brand_stroke bg-white hover:bg-slate-50 transition-colors items-center px-2 sm:px-4",
        isLast && "border-b-0 rounded-b-2xl",
      )}
    >
      <Link
        to={`${client.email}`}
        state={{ client }}
        className="col-span-11 grid grid-cols-11 items-center py-3 min-w-0"
      >
        <div className="flex gap-3 items-center col-span-11 sm:col-span-4 min-w-0">
          <ClientAvatar
            photoUrl={client.photoUrl}
            initials={initials}
            size="sm"
            className={getAvatarColor(client.displayName || client.email)}
          />
          <div className="min-w-0">
            <p className="font-satoBold text-brand_dark text-sm truncate leading-tight">
              {client.displayName || "—"}
            </p>
            <p className="text-xs text-brand_iron truncate">
              {client.email}
            </p>
          </div>
        </div>

        <p className="hidden font-satoMedium sm:block text-sm col-span-2 text-left text-brand_gray whitespace-nowrap">
          {new Date(client.createdAt || client.updatedAt).toLocaleDateString(
            "es-MX",
            { day: "numeric", month: "short", year: "numeric" },
          )}
        </p>

        <p className="hidden sm:block text-sm col-span-2 text-left font-semibold text-brand_gray whitespace-nowrap">
          {client.loyaltyPoints ?? 0}
          <span className="font-semibold text-brand_gray ml-1">pts</span>
        </p>

        <p className="hidden sm:block text-sm col-span-1 text-left text-brand_gray whitespace-nowrap">
          {client.eventCount}
        </p>

        <p className="hidden sm:block col-span-2 text-sm text-left text-brand_green whitespace-nowrap">
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
        <DropdownMenu hideDefaultButton>
          <MenuButton variant="danger" onClick={() => setShowDeleteModal(true)}>
            Eliminar
          </MenuButton>
        </DropdownMenu>
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setBlockOnDelete(false)
          }}
          onConfirm={handleDelete}
          title="¿Seguro que quieres eliminar a ese cliente?"
          description="Al eliminar a un cliente, se elimina todo su historial de citas y pagos. Puedes solo eliminar a tu cliente, o eliminarlo y bloquearlo."
          confirmText="Sí, eliminar"
          variant="danger"
        >
          <label className="mt-6 flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={blockOnDelete}
              onChange={(e) => setBlockOnDelete(e.target.checked)}
              className="h-5 w-5 rounded border-brand_ash accent-brand_blue cursor-pointer"
            />
            <span className="text-brand_gray text-sm">Bloquear cliente</span>
          </label>
        </ConfirmModal>
      </div>
    </div>
  )
}

export const ClientAvatar = ({
  photoUrl,
  initials,
  size = "sm",
  className,
}: {
  photoUrl?: string | null
  initials: string
  size?: "sm" | "md"
  className?: string
}) => {
  const [imageError, setImageError] = useState(false)

  const dim = size === "md" ? "w-10 h-10 text-sm" : "w-11 h-11 text-sm"

  if (!photoUrl || imageError) {
    return (
      <div
        className={twMerge(
          "rounded-full bg-brand_blue text-white flex items-center justify-center font-semibold shrink-0",
          dim,
          className,
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
        className,
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
            const initials = getInitials(c.displayName, c.email)
            const colorClass = getAvatarColor(c.displayName || c.email)
            return (
              <div
                key={c.id}
                className={twMerge(
                  "text-white w-12 h-12 rounded-full grid place-items-center border-2 border-white text-sm font-semibold shrink-0",
                  colorClass,
                  i > 0 ? "-ml-3" : "",
                )}
              >
                {initials}
              </div>
            )
          })
        )}

        {overflow > 0 && (
          <div className="bg-brand_sky text-brand_blue w-12 h-12 rounded-full grid place-items-center -ml-3 border-2 border-white text-sm font-semibold shrink-0">
            +{overflow}
          </div>
        )}
      </div>
    </section>
  )
}

const EmptySearch = ({ onClear }: { onClear: () => void }) => (
  <div className="flex flex-col items-center justify-center gap-3 text-center flex-1">
    <img
      className="mx-auto mb-4"
      src="/images/emptyState/search.svg"
      alt=""
    />
    <p className="text-2xl font-satoBold text-brand_dark">
      ¡Vaya! No hay coincidencias con la búsqueda
    </p>
    <p className="text-[18px] text-brand_gray mt-2">
      Intenta buscar por otro nombre, correo o teléfono.
    </p>
    <SecondaryButton
      onClick={onClear}
      className="mt-4 min-w-0 h-10 px-5 text-sm"
    >
      Limpiar búsqueda
    </SecondaryButton>
  </div>
)

const EmptyStateClients = ({ link }: { link: string }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 2500)
    return () => clearTimeout(t)
  }, [toastMessage])

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    setToastMessage("Link copiado")
  }

  return (
    <div className="w-full h-[80vh] bg-cover mt-10 flex justify-center items-center px-4">
      <div className="text-center">
        <img
          className="mx-auto mb-4 w-[200px] md:w-auto max-w-full"
          src="/images/emptyState/clients-empty.webp"
          alt="illustration"
        />
        <p className="font-satoBold text-xl md:text-[24px]">¡No hay clientes por aquí!</p>
        <p className="mt-2 md:mt-3 text-base md:text-[18px] font-satoshi text-brand_gray">
          Comparte tu website y deja que lleguen las reservas{" "}
          <span className="text-2xl">🚀</span>
        </p>
        <SecondaryButton
          onClick={handleCopy}
          className="mx-auto mt-12 bg-transparent border-[1px] border-[#CFCFCF]"
        >
          <Anchor /> Copiar link
        </SecondaryButton>
      </div>
      <SuccessToast message={toastMessage} />
    </div>
  )
}
