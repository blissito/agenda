import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { Pagination } from "~/components/common/Pagination"
import { SecondaryButton } from "~/components/common/secondaryButton"
import {
  CitasFilterPopup,
  type CitasFilters,
  EMPTY_FILTERS,
} from "~/components/dash/CitasFilter"
import { CitasTable, getStatusVariant } from "~/components/dash/CitasTable"
import { BasicInput } from "~/components/forms/BasicInput"
import { Download } from "~/components/icons/download"
import { MagnifyingGlass } from "~/components/icons/MagnifyingGlass"
import { Settings } from "~/components/icons/settings"
import { TabButton } from "~/components/loyalty/loyaltyStep"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/dash.agenda.citas"
import { ActionButton } from "./dash.clientes"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const [events, services] = await Promise.all([
    db.event.findMany({
      where: {
        orgId: org.id,
        archived: false,
        type: { not: "BLOCK" },
      },
      include: { service: true, customer: true },
      orderBy: { start: "desc" },
    }),
    db.service.findMany({
      where: { orgId: org.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return { events, services }
}

type Filters = CitasFilters

export default function CitasPage({ loaderData }: Route.ComponentProps) {
  const { events, services } = loaderData
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilters(false)
    }
    if (showFilters) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showFilters])

  const now = new Date()
  const filtered = events.filter((e) => {
    const isUpcoming = new Date(e.start) >= now
    if (tab === "upcoming" && !isUpcoming) return false
    if (tab === "past" && isUpcoming) return false
    if (search) {
      const q = search.toLowerCase()
      const matchesSearch =
        e.customer?.displayName?.toLowerCase().includes(q) ||
        e.customer?.email?.toLowerCase().includes(q) ||
        e.service?.name?.toLowerCase().includes(q)
      if (!matchesSearch) return false
    }
    if (filters.from) {
      const from = new Date(filters.from)
      if (new Date(e.start) < from) return false
    }
    if (filters.to) {
      const to = new Date(filters.to)
      to.setHours(23, 59, 59, 999)
      if (new Date(e.start) > to) return false
    }
    if (filters.serviceId && e.serviceId !== filters.serviceId) return false
    if (filters.statuses.size > 0) {
      const variant = getStatusVariant(e.status)
      const payVariant = e.paid ? "paid" : "unpaid"
      if (!filters.statuses.has(variant) && !filters.statuses.has(payVariant))
        return false
    }
    return true
  })

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(() => {
    if (typeof window === "undefined") return 10
    const ROW_HEIGHT = 52 // py-3 + content
    const CHROME = 280 // breadcrumb + search + table header + pagination + layout padding
    const available = window.innerHeight - CHROME
    const fits = Math.floor(available / ROW_HEIGHT)
    // Snap to nearest option
    if (fits >= 50) return 50
    if (fits >= 25) return 25
    if (fits >= 15) return 15
    return 10
  })
  const totalFiltered = filtered.length
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  // Reset page when filters or search change
  useEffect(() => {
    setPage(1)
  }, [search, filters, tab])

  const hasActiveFilters =
    filters.from !== "" ||
    filters.to !== "" ||
    filters.serviceId !== "" ||
    filters.statuses.size > 0

  const handleDownloadCSV = () => {
    if (filtered.length === 0) return
    const headers = [
      "Fecha",
      "Hora",
      "Servicio",
      "Cliente",
      "Email",
      "Teléfono",
      "Duración (min)",
      "Estatus",
      "Pagado",
      "Precio",
      "Moneda",
    ]
    const esc = (v: unknown) => {
      if (v === null || v === undefined) return ""
      const s = String(v)
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const rows = filtered.map((e) => {
      const d = new Date(e.start)
      return [
        d.toLocaleDateString("es-MX"),
        d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        e.service?.name ?? "",
        e.customer?.displayName ?? "",
        e.customer?.email ?? "",
        e.customer?.tel ?? "",
        e.service?.duration ?? "",
        e.status ?? "",
        e.paid ? "Sí" : "No",
        e.service?.price ?? "",
        e.service?.currency ?? "",
      ]
        .map(esc)
        .join(",")
    })
    const csv = "﻿" + [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `citas-${tab}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-brand_gray mb-6">
        <Link
          to="/dash/agenda"
          className="hover:text-brand_dark transition-colors"
        >
          Mi agenda
        </Link>
        <span>{">"}</span>
        <span className="text-brand_dark font-satoMedium">Todas las citas</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
        {/* Tabs */}
        <div className="flex items-center gap-4">
          <TabButton
            label="Próximas"
            active={tab === "upcoming"}
            onClick={() => setTab("upcoming")}
          />
          <TabButton
            label="Anteriores"
            active={tab === "past"}
            onClick={() => setTab("past")}
          />
        </div>

        {/* Search + actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <BasicInput
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Buscar"
              containerClassName="w-full"
              inputClassName="!rounded-full pl-4 pr-10 border-white font-satoshi py-2 h-12"
              registerOptions={{ required: false }}
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
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
          <div className="relative" ref={filterRef}>
            <ActionButton
              onClick={() => {
                setDraft({ ...filters, statuses: new Set(filters.statuses) })
                setShowFilters((v) => !v)
              }}
            >
              <Settings className="w-5 h-5" />
              {hasActiveFilters && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-brand_blue" />
              )}
            </ActionButton>
            {showFilters && (
              <CitasFilterPopup
                draft={draft}
                setDraft={setDraft}
                services={services}
                hasActiveFilters={hasActiveFilters}
                onApply={() => {
                  setFilters(draft)
                  setShowFilters(false)
                }}
                onReset={() => {
                  setDraft(EMPTY_FILTERS)
                  setFilters(EMPTY_FILTERS)
                  setShowFilters(false)
                }}
              />
            )}
          </div>
          <ActionButton
            onClick={handleDownloadCSV}
            isDisabled={filtered.length === 0}
            title="Descargar CSV"
            aria-label="Descargar citas como CSV"
          >
            <Download className="w-5 h-5" />
          </ActionButton>
        </div>
      </div>

      {paginated.length > 0 ? (
        <CitasTable events={paginated} />
      ) : (
        <EmptyState search={search} onClear={() => setSearch("")} tab={tab} />
      )}

      {/* Paginación */}
      {totalFiltered > perPage && (
        <Pagination
          total={totalFiltered}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}
    </div>
  )
}

const EmptyState = ({
  search,
  onClear,
  tab,
}: {
  search: string
  onClear: () => void
  tab: "upcoming" | "past"
}) => (
  <div className="flex flex-col items-center justify-center gap-3 text-center min-h-[calc(100vh-240px)]">
    {search ? (
      <>
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
      </>
    ) : (
      <>
        <img
          className="mx-auto mb-4"
          src="/images/emptyState/empty_customer.svg"
          alt="Sin citas"
        />
        <p className="text-2xl font-satoBold">
          {tab === "upcoming"
            ? "No tienes citas para los próximos días"
            : "Aún no tienes citas anteriores"}
        </p>
        <p className="text-[18px] text-brand_gray mt-2">
          {tab === "upcoming"
            ? "Las citas de tus clientes aparecerán aquí."
            : "Aquí aparecerán las citas que ya hayan pasado."}
        </p>
      </>
    )}
  </div>
)
