import { useMemo, useState } from "react"
import { redirect, useFetcher, useSearchParams } from "react-router"
import { twMerge } from "tailwind-merge"
import invariant from "tiny-invariant"
import {
  getMPAuthUrl,
  getValidAccessToken,
  type MpPayment,
  searchMpPayments,
} from "~/.server/mercadopago"
import { createAccountLink, getOrCreateStripeAccount } from "~/.server/stripe"
import {
  getUserAndOrgOrRedirect,
  getUserOrRedirect,
} from "~/.server/userGetters"
import { Pagination } from "~/components/common/Pagination"
import { PrimaryButton } from "~/components/common/primaryButton"
import { Spinner } from "~/components/common/Spinner"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { type CitaEvent } from "~/components/dash/CitasTable"
import { ArrowRight } from "~/components/icons/arrowRight"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/pagos"

export const action = async ({ request }: Route.ActionArgs) => {
  const user = await getUserOrRedirect(request)
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "connect_mercadopago") {
    const url = new URL(request.url)
    const origin =
      process.env.APP_URL ||
      (process.env.NODE_ENV === "production"
        ? url.origin.replace("http://", "https://")
        : url.origin)
    const redirectUri = `${origin}/mercadopago/oauth`
    throw redirect(getMPAuthUrl(redirectUri))
  }

  if (intent === "disconnect_mercadopago") {
    await db.user.update({
      where: { id: user.id },
      data: { mercadopago: { unset: true } },
    })
    return { success: true, disconnected: "mercadopago" }
  }

  if (intent === "navigate_to_stripe_account_link") {
    if (!process.env.STRIPE_SECRET_TEST || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Response("Stripe no configurado", { status: 400 })
    }

    const { account, error } = await getOrCreateStripeAccount(request)
    if (error) throw new Response(null, { status: 404 })

    invariant(account)

    const url = new URL(request.url)
    const link = await createAccountLink(account.id, url.origin)
    throw redirect(link.url)
  }
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user, org } = await getUserAndOrgOrRedirect(request)
  const stripeData = user.stripe as { id: string } | null
  const stripeEnabled =
    !!process.env.STRIPE_SECRET_TEST && !!process.env.STRIPE_WEBHOOK_SECRET

  const url = new URL(request.url)
  const tab = url.searchParams.get("tab") === "deposits" ? "deposits" : "sales"

  // Si no hay org (cliente sin negocio), responder con shape mínima
  if (!org) {
    return {
      mpConnected: !!user.mercadopago?.access_token,
      mpUserId: user.mercadopago?.user_id,
      stripeAccountId: stripeData?.id || null,
      stripeEnabled,
      stats: null,
      events: [] as CitaEvent[],
      deposits: null as DepositsData | null,
    }
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const events = await db.event.findMany({
    where: {
      orgId: org.id,
      archived: false,
      type: { not: "BLOCK" },
    },
    include: { service: true, customer: true },
    orderBy: { start: "desc" },
  })

  const ONLINE_METHODS = new Set(["mercadopago", "stripe"])
  const SUCURSAL_METHODS = new Set(["cash", "transfer", "card"])

  const totals = {
    monthRevenue: 0,
    onlineRevenue: 0,
    sucursalRevenue: 0,
    paidCount: 0,
    pendingRevenue: 0,
    pendingCount: 0,
    sucursalBreakdown: { cash: 0, transfer: 0, card: 0 },
  }

  for (const e of events) {
    if (!e.service) continue
    const price = Number(e.service.price)

    // Citas futuras sin pagar y no canceladas → por cobrar
    if (!e.paid && e.start >= now && e.status !== "CANCELLED") {
      totals.pendingRevenue += price
      totals.pendingCount += 1
    }

    if (!e.paid) continue
    totals.paidCount += 1
    if (e.createdAt >= startOfMonth) totals.monthRevenue += price

    const method = (e.payment_method ?? "").toLowerCase()
    if (
      ONLINE_METHODS.has(method) ||
      e.mp_payment_id ||
      e.stripe_payment_intent_id
    ) {
      totals.onlineRevenue += price
    } else if (SUCURSAL_METHODS.has(method)) {
      totals.sucursalRevenue += price
      if (method === "cash") totals.sucursalBreakdown.cash += price
      if (method === "transfer") totals.sucursalBreakdown.transfer += price
      if (method === "card") totals.sucursalBreakdown.card += price
    }
  }

  // Solo trae depósitos cuando la pestaña es "deposits" y MP está conectado.
  let deposits: DepositsData | null = null
  if (tab === "deposits" && user.mercadopago?.access_token) {
    deposits = await loadDeposits(user).catch((err) => {
      console.error("[pagos] mp deposits failed:", err)
      return { error: (err as Error).message } as DepositsData
    })
  }

  return {
    mpConnected: !!user.mercadopago?.access_token,
    mpUserId: user.mercadopago?.user_id,
    stripeAccountId: stripeData?.id || null,
    stripeEnabled,
    stats: totals,
    events,
    deposits,
  }
}

// ── Deposits (MercadoPago) ─────────────────────────────────────

type DepositGroup = {
  date: string // YYYY-MM-DD
  count: number
  gross: number
  net: number
  fees: number
}

type DepositsData =
  | { error: string }
  | {
      currency: string
      releasedTotal: number
      pendingTotal: number
      feesTotal: number
      payouts: number
      nextRelease: { date: string; amount: number } | null
      groupsPending: DepositGroup[]
      groupsReleased: DepositGroup[]
      payments: MpPayment[]
    }

const loadDeposits = async (user: {
  id: string
  mercadopago?: {
    access_token: string
    refresh_token: string
    expires_at: Date
  } | null
}): Promise<DepositsData> => {
  const accessToken = await getValidAccessToken(user)
  if (!accessToken) return { error: "no_token" }

  const now = new Date()
  const beginDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const { results } = await searchMpPayments({
    accessToken,
    beginDate,
    endDate: now,
    limit: 100,
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const groupMap: Record<string, DepositGroup> = {}
  let releasedTotal = 0
  let pendingTotal = 0
  let feesTotal = 0
  let nextRelease: { date: string; amount: number } | null = null

  for (const p of results) {
    const net =
      p.transaction_details?.net_received_amount ?? p.transaction_amount
    const fee = (p.fee_details ?? []).reduce((s, f) => s + f.amount, 0)
    feesTotal += fee

    if (!p.money_release_date) continue
    const release = new Date(p.money_release_date)
    const key = release.toISOString().slice(0, 10)
    const isReleased = release <= today

    if (isReleased) releasedTotal += net
    else {
      pendingTotal += net
      if (!nextRelease || release < new Date(nextRelease.date)) {
        nextRelease = { date: p.money_release_date, amount: net }
      }
    }

    const g =
      groupMap[key] ??
      (groupMap[key] = { date: key, count: 0, gross: 0, net: 0, fees: 0 })
    g.count += 1
    g.gross += p.transaction_amount
    g.net += net
    g.fees += fee
  }

  const all = Object.values(groupMap).sort((a, b) =>
    a.date.localeCompare(b.date),
  )
  const groupsPending = all
    .filter((g) => new Date(g.date) > today)
    .sort((a, b) => a.date.localeCompare(b.date))
  const groupsReleased = all
    .filter((g) => new Date(g.date) <= today)
    .sort((a, b) => b.date.localeCompare(a.date))

  // Si hay un próximo release, redondea al monto del grupo
  if (nextRelease) {
    const g = groupMap[nextRelease.date.slice(0, 10)]
    if (g) nextRelease = { date: g.date, amount: g.net }
  }

  return {
    currency: results[0]?.currency_id ?? "MXN",
    releasedTotal,
    pendingTotal,
    feesTotal,
    payouts: results.length,
    nextRelease,
    groupsPending,
    groupsReleased,
    payments: results,
  }
}

export default function Pagos({ loaderData }: Route.ComponentProps) {
  const { mpConnected, stripeAccountId, stats, events, deposits } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()
  const fetcher = useFetcher()

  const _mpSuccess = searchParams.get("mp_success")
  const _mpError = searchParams.get("mp_error")
  const activeTab =
    searchParams.get("tab") === "deposits" ? "deposits" : "sales"

  const connectMercadoPago = () => {
    fetcher.submit({ intent: "connect_mercadopago" }, { method: "post" })
  }

  const _disconnectMercadoPago = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres desconectar tu cuenta de Mercado Pago?",
      )
    ) {
      fetcher.submit({ intent: "disconnect_mercadopago" }, { method: "post" })
    }
  }

  const _navigateToStripeAccountLink = () => {
    fetcher.submit(
      { intent: "navigate_to_stripe_account_link" },
      { method: "post" },
    )
  }

  const changeTab = (tab: "sales" | "deposits") => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("tab", tab)
    setSearchParams(nextParams)
  }

  const isLoading = fetcher.state !== "idle"
  const hasAnyData =
    (events?.length ?? 0) > 0 || mpConnected || !!stripeAccountId
  const showEmptyState = !hasAnyData

  return (
    <article className="w-full max-w-8xl mx-auto">
      <RouteTitle className="text-2xl md:text-3xl mb-4 md:mb-8">
        Ventas
      </RouteTitle>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => changeTab("sales")}
          className={`relative pb-2 text-sm font-medium leading-5 ${
            activeTab === "sales" ? "text-[#20242D]" : "text-[#8A90A2]"
          }`}
        >
          Ventas
          {activeTab === "sales" && (
            <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#615FFF]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => changeTab("deposits")}
          className={`relative pb-2 text-sm font-medium leading-5 ${
            activeTab === "deposits" ? "text-[#20242D]" : "text-[#8A90A2]"
          }`}
        >
          Depósitos
          {activeTab === "deposits" && (
            <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#615FFF]" />
          )}
        </button>
      </div>

      {!showEmptyState && activeTab === "sales" ? (
        <SalesView stats={stats} events={events ?? []} />
      ) : null}

      {!showEmptyState && activeTab === "deposits" && mpConnected ? (
        <DepositsView deposits={deposits} mpConnected={mpConnected} />
      ) : null}

      {showEmptyState || (activeTab === "deposits" && !mpConnected) ? (
        <MercadoPagoEmptyState
          onConnect={connectMercadoPago}
          isLoading={isLoading}
          showSecondary={activeTab !== "deposits"}
        />
      ) : null}

      {/*
        / CONFIGURACIÓN DE PAGOS
        <>
          <section className="py-10">
            <h2 className="text-lg font-semibold mb-2">
              Mercado Pago (Recomendado)
            </h2>
            <p className="text-gray-600 mb-4">
              Recibe pagos con tarjeta, OXXO, SPEI y más métodos populares en
              México.
            </p>

            {mpSuccess && mpConnected && (
              <p className="text-green-600 mb-4">
                ¡Cuenta de Mercado Pago conectada exitosamente!
              </p>
            )}
            {mpError && (
              <p className="text-red-500 mb-4">
                Error al conectar Mercado Pago. Intenta de nuevo.
              </p>
            )}

            {mpConnected ? (
              <div className="flex items-center gap-4 my-4">
                <div className="px-8 py-4 rounded-3xl border-2 flex gap-3 bg-green-50 border-green-500">
                  <span>MP conectado (ID: {mpUserId})</span>
                </div>
                <button
                  disabled={isLoading}
                  onClick={disconnectMercadoPago}
                  className="text-red-500 text-sm hover:underline disabled:opacity-50"
                >
                  {isLoading ? <Spinner /> : "Desconectar"}
                </button>
              </div>
            ) : (
              <button
                disabled={isLoading}
                onClick={connectMercadoPago}
                className="px-8 py-4 rounded-3xl border-2 my-4 flex gap-3 hover:scale-105 enabled:active:scale-100 transition-all bg-blue-50 border-blue-500"
              >
                <span>Conectar Mercado Pago</span>
                {isLoading && <Spinner />}
              </button>
            )}
          </section>

          <hr />

          {stripeEnabled && (
            <section className="py-10 opacity-60">
              <h2 className="text-lg font-semibold mb-2">Stripe</h2>
              <p className="text-gray-600 mb-4">
                Opción alternativa para pagos internacionales.
              </p>
              <button
                disabled={isLoading}
                onClick={navigateToStripeAccountLink}
                className="px-8 py-4 rounded-3xl border-2 my-4 flex gap-3 hover:scale-105 enabled:active:scale-100 transition-all"
              >
                <span>
                  {stripeAccountId
                    ? `Stripe conectado: ${stripeAccountId}`
                    : "Conectar Stripe"}
                </span>
                {isLoading && <Spinner />}
              </button>
            </section>
          )}
        </>
      */}
    </article>
  )
}

// ── Sales view ─────────────────────────────────────────────────

type SalesStats = {
  monthRevenue: number
  onlineRevenue: number
  sucursalRevenue: number
  paidCount: number
  pendingRevenue: number
  pendingCount: number
  sucursalBreakdown: { cash: number; transfer: number; card: number }
}

const formatCurrency = (cents: number) =>
  `$${(cents / 100).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const SalesView = ({
  stats,
  events,
}: {
  stats: SalesStats | null
  events: CitaEvent[]
}) => {
  const safeStats: SalesStats = stats ?? {
    monthRevenue: 0,
    onlineRevenue: 0,
    sucursalRevenue: 0,
    paidCount: 0,
    pendingRevenue: 0,
    pendingCount: 0,
    sucursalBreakdown: { cash: 0, transfer: 0, card: 0 },
  }

  return (
    <section className="mt-6 flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <SalesCard
          title="Ventas del mes"
          value={formatCurrency(safeStats.monthRevenue)}
          subtitle={`${safeStats.paidCount} cobros pagados`}
          className="bg-[#64D0C5]"
          icon="/images/chart.svg"
        />
        <SalesCard
          title="Ingresos MercadoPago"
          value={formatCurrency(safeStats.onlineRevenue)}
          subtitle="Cobrado online al agendar"
          className="bg-[#615FFF]"
          icon="/images/agenda-dash.svg"
        />
        <SalesCard
          title="Ingresos en sucursal"
          value={formatCurrency(safeStats.sucursalRevenue)}
          subtitle="Efectivo, transferencia y tarjeta"
          className="bg-brand_lime"
          icon="/images/sucursal.svg"
        />
        <SalesCard
          title="Pagos recibidos"
          value={String(safeStats.paidCount)}
          subtitle="Total histórico"
          className="bg-[#EEC446]"
          icon="/images/cancel.svg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <SucursalBreakdown
          label="Efectivo"
          value={formatCurrency(safeStats.sucursalBreakdown.cash)}
        />
        <SucursalBreakdown
          label="Transferencia"
          value={formatCurrency(safeStats.sucursalBreakdown.transfer)}
        />
        <SucursalBreakdown
          label="Tarjeta (sucursal)"
          value={formatCurrency(safeStats.sucursalBreakdown.card)}
        />
        <SucursalBreakdown
          label="Por cobrar"
          value={formatCurrency(safeStats.pendingRevenue)}
          hint={`${safeStats.pendingCount} cita${safeStats.pendingCount === 1 ? "" : "s"} pendiente${safeStats.pendingCount === 1 ? "" : "s"}`}
        />
      </div>

      <DailyClosingTable events={events} />
    </section>
  )
}

// ── Cierre de caja diario ──────────────────────────────────────

type DailyTotals = {
  date: string // YYYY-MM-DD
  count: number
  mp: number
  cash: number
  transfer: number
  card: number
  total: number
}

// Select homologado: h-12 (48px), rounded-lg, chevron custom
const SELECT_CLASS =
  "appearance-none cursor-pointer h-12 rounded-full border border-brand_stroke bg-white pl-4 pr-10 text-sm text-brand_gray outline-none focus:border-brand_blue bg-no-repeat hover:bg-brand_blue/5 transition-colors"

const SELECT_STYLE: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'><path d='M1 1L5 5L9 1' stroke='%238A90A2' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
  backgroundPosition: "right 12px center",
  backgroundSize: "10px 6px",
}

const MONTH_NAMES_LONG = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const DailyClosingTable = ({ events }: { events: CitaEvent[] }) => {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-11

  // Años disponibles = años con eventos pagados (mínimo el actual)
  const yearsAvailable = useMemo(() => {
    const set = new Set<number>([now.getFullYear()])
    for (const e of events) {
      if (e.paid && e.start) set.add(new Date(e.start).getFullYear())
    }
    return Array.from(set).sort((a, b) => b - a)
  }, [events, now])

  const days = useMemo<DailyTotals[]>(() => {
    // Agrupa los eventos pagados por día dentro del mes seleccionado
    const map = new Map<string, DailyTotals>()
    for (const e of events) {
      if (!e.paid || !e.service) continue
      const d = new Date(e.start)
      if (d.getFullYear() !== year || d.getMonth() !== month) continue
      const key = d.toISOString().slice(0, 10)
      const row =
        map.get(key) ??
        map
          .set(key, {
            date: key,
            count: 0,
            mp: 0,
            cash: 0,
            transfer: 0,
            card: 0,
            total: 0,
          })
          .get(key)!
      const price = Number(e.service.price)
      row.count += 1
      row.total += price
      const method = (e.payment_method ?? "").toLowerCase()
      if (
        method === "mercadopago" ||
        method === "stripe" ||
        e.mp_payment_id ||
        e.stripe_payment_intent_id
      ) {
        row.mp += price
      } else if (method === "cash") row.cash += price
      else if (method === "transfer") row.transfer += price
      else if (method === "card") row.card += price
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [events, year, month])

  const totals = useMemo(
    () =>
      days.reduce(
        (acc, d) => ({
          count: acc.count + d.count,
          mp: acc.mp + d.mp,
          cash: acc.cash + d.cash,
          transfer: acc.transfer + d.transfer,
          card: acc.card + d.card,
          total: acc.total + d.total,
        }),
        { count: 0, mp: 0, cash: 0, transfer: 0, card: 0, total: 0 },
      ),
    [days],
  )

  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-satoBold text-brand_dark">
          Cierre de caja diario
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={`${SELECT_CLASS} flex-1 md:flex-none`}
            style={SELECT_STYLE}
          >
            {MONTH_NAMES_LONG.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={SELECT_CLASS}
            style={SELECT_STYLE}
          >
            {yearsAvailable.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block w-full overflow-x-auto rounded-2xl">
        <div className="min-w-[820px]">
          <div className="grid gap-x-4 grid-cols-[160px_80px_1fr_1fr_1fr_1fr_140px] rounded-t-2xl border-b border-brand_stroke bg-white px-6 py-3 text-[12px] font-satoMedium text-brand_gray uppercase tracking-wide">
            <div>Día</div>
            <div className="text-right">Citas</div>
            <div className="text-right">MP</div>
            <div className="text-right">Efectivo</div>
            <div className="text-right">Transfer</div>
            <div className="text-right">Tarjeta</div>
            <div className="text-right">Total</div>
          </div>
          <div className="rounded-b-2xl bg-white divide-y divide-brand_stroke">
            {totals.count > 0 ? (
              <div className="grid gap-x-4 grid-cols-[160px_80px_1fr_1fr_1fr_1fr_140px] items-center px-6 py-3 bg-brand_lime/20">
                <div className="text-[13px] text-brand_dark font-satoBold uppercase tracking-wide">
                  Total del mes
                </div>
                <div className="text-[13px] text-brand_dark text-right tabular-nums font-satoBold">
                  {totals.count}
                </div>
                <div className="text-[13px] text-brand_dark text-right tabular-nums font-satoBold">
                  {formatCurrency(totals.mp)}
                </div>
                <div className="text-[13px] text-brand_dark text-right tabular-nums font-satoBold">
                  {formatCurrency(totals.cash)}
                </div>
                <div className="text-[13px] text-brand_dark text-right tabular-nums font-satoBold">
                  {formatCurrency(totals.transfer)}
                </div>
                <div className="text-[13px] text-brand_dark text-right tabular-nums font-satoBold">
                  {formatCurrency(totals.card)}
                </div>
                <div className="text-[14px] text-brand_dark text-right tabular-nums font-satoBold">
                  {formatCurrency(totals.total)}
                </div>
              </div>
            ) : null}
            {totals.count === 0 ? (
              <DailyEmptyState month={month} year={year} />
            ) : (
              days.map((d) => (
                <div
                  key={d.date}
                  className="grid gap-x-4 grid-cols-[160px_80px_1fr_1fr_1fr_1fr_140px] items-center px-6 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="text-[13px] text-brand_dark font-satoMedium">
                    {formatDayCell(d.date)}
                  </div>
                  <div className="text-[13px] text-brand_gray text-right tabular-nums">
                    {d.count}
                  </div>
                  <DailyAmount amount={d.mp} />
                  <DailyAmount amount={d.cash} />
                  <DailyAmount amount={d.transfer} />
                  <DailyAmount amount={d.card} />
                  <div className="text-[13px] text-brand_dark text-right tabular-nums font-satoBold">
                    {formatCurrency(d.total)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden rounded-2xl bg-white overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between text-[10px] font-satoMedium text-brand_gray uppercase tracking-wide border-b border-brand_stroke">
          <span>Día</span>
          <span>Total</span>
        </div>
        <div className="divide-y divide-brand_stroke">
        {totals.count > 0 ? (
          <div className="p-4 bg-brand_lime/20 flex items-center justify-between">
            <span className="text-sm font-satoBold text-brand_dark uppercase tracking-wide">
              Total del mes
            </span>
            <span className="text-sm font-satoBold text-brand_dark tabular-nums">
              {formatCurrency(totals.total)}
            </span>
          </div>
        ) : null}
        {totals.count === 0 ? (
          <DailyEmptyState month={month} year={year} />
        ) : (
          days.map((d) => (
              <div key={d.date} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-satoBold text-brand_dark">
                      {formatDayCell(d.date)}
                    </span>
                    <span className="text-[11px] text-brand_gray">
                      {d.count} cita{d.count === 1 ? "" : "s"}
                    </span>
                  </div>
                  <span className="text-sm font-satoBold text-brand_dark tabular-nums">
                    {formatCurrency(d.total)}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-brand_gray">
                  {d.mp > 0 && <span>MP: {formatCurrency(d.mp)}</span>}
                  {d.cash > 0 && (
                    <span>Efectivo: {formatCurrency(d.cash)}</span>
                  )}
                  {d.transfer > 0 && (
                    <span>Transfer: {formatCurrency(d.transfer)}</span>
                  )}
                  {d.card > 0 && <span>Tarjeta: {formatCurrency(d.card)}</span>}
                </div>
              </div>
            ))
        )}
        </div>
      </div>
    </div>
  )
}

const DailyEmptyState = ({ month, year }: { month: number; year: number }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <img
      src="/images/emptyState/payments.webp"
      alt=""
      className="w-40 mb-6 opacity-90"
    />
    <p className="text-xl md:text-2xl font-satoBold text-brand_dark">
      Sin cobros en {MONTH_NAMES_LONG[month]} {year}
    </p>
    <p className="mt-2 text-base text-brand_gray max-w-[360px]">
      Cuando registres pagos en este mes, verás aquí el desglose por día y
      método de cobro.
    </p>
  </div>
)

const DailyAmount = ({ amount }: { amount: number }) => (
  <div
    className={`text-[13px] text-right tabular-nums ${
      amount > 0 ? "text-brand_dark" : "text-brand_iron"
    }`}
  >
    {amount > 0 ? formatCurrency(amount) : "—"}
  </div>
)

const formatDayCell = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

const SalesCard = ({
  icon,
  title,
  value,
  subtitle,
  className,
}: {
  icon?: string
  title: string
  value: string
  subtitle?: string
  className?: string
}) => (
  <section
    className={twMerge(
      "rounded-2xl h-[140px] md:h-[160px] relative flex flex-col justify-end p-4 group overflow-hidden",
      className,
    )}
  >
    {icon ? (
      <img
        className="absolute right-0 top-0 w-[64px] opacity-90 group-hover:scale-95 transition-all"
        src={icon}
        alt=""
      />
    ) : null}
    <div className="text-white">
      <p className="text-base md:text-lg">{title}</p>
      <h3 className="text-3xl md:text-4xl font-satoBold leading-tight mt-1">
        {value}
      </h3>
      {subtitle ? (
        <p className="mt-2 text-[13px] opacity-90 hidden md:block">
          {subtitle}
        </p>
      ) : null}
    </div>
  </section>
)

const SucursalBreakdown = ({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) => (
  <div className="rounded-2xl bg-white px-4 py-3 flex items-center justify-between gap-3">
    <div className="flex flex-col min-w-0">
      <span className="text-sm text-brand_gray">{label}</span>
      {hint ? (
        <span className="text-[11px] text-brand_iron truncate hidden md:inline">
          {hint}
        </span>
      ) : null}
    </div>
    <span className="text-sm font-satoBold text-brand_dark tabular-nums shrink-0">
      {value}
    </span>
  </div>
)

// ── MP empty state (compartido) ────────────────────────────────

const MercadoPagoEmptyState = ({
  onConnect,
  isLoading,
  showSecondary = true,
}: {
  onConnect: () => void
  isLoading: boolean
  showSecondary?: boolean
}) => (
  <section className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 py-10 text-center">
    <img
      src="/images/emptyState/payments.webp"
      alt=""
      className="mb-4 w-[200px] md:w-full md:max-w-[240px]"
    />
    <div className="max-w-[620px]">
      <h2 className="text-xl md:text-[24px] font-satoBold">
        Conecta tu cuenta MELI para empezar a recibir pagos
      </h2>
      <p className="mt-2 md:mt-3 text-base md:text-[18px] font-satoshi text-brand_gray">
        Denik colabora con Mercado Libre para ofrecerte pagos seguros
      </p>
    </div>
    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
      {showSecondary ? (
        <SecondaryButton type="button" className="min-w-[160px]">
          Configurar después
        </SecondaryButton>
      ) : null}
      <PrimaryButton
        type="button"
        onClick={onConnect}
        disabled={isLoading}
        className="min-w-[160px]"
      >
        <span className="flex items-center justify-center gap-2">
          <span>Empezar</span>
          <ArrowRight />
          {isLoading ? <Spinner /> : null}
        </span>
      </PrimaryButton>
    </div>
  </section>
)

// ── Deposits view ──────────────────────────────────────────────

const formatMoney = (amount: number, currency = "MXN") =>
  amount.toLocaleString("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

const formatDateLong = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

const DepositsView = ({
  deposits,
}: {
  deposits: DepositsData | null
  mpConnected?: boolean
}) => {
  if (!deposits) {
    return (
      <section className="mt-6 rounded-2xl bg-white p-8 text-center">
        <p className="text-brand_gray text-sm">Cargando depósitos...</p>
      </section>
    )
  }

  if ("error" in deposits) {
    return (
      <section className="mt-6 rounded-2xl bg-white p-8 text-center">
        <p className="text-brand_dark font-satoBold">
          No pudimos traer tus depósitos
        </p>
        <p className="mt-2 text-brand_gray text-sm">
          {deposits.error === "no_token"
            ? "Tu sesión de MercadoPago expiró. Reconéctala para volver a verlos."
            : "Intenta de nuevo en unos minutos."}
        </p>
      </section>
    )
  }

  const c = deposits.currency
  const hasData = deposits.payments.length > 0

  return (
    <section className="mt-6 flex flex-col gap-6">
      {hasData ? (
        <DepositsTable payments={deposits.payments} currency={c} />
      ) : null}
    </section>
  )
}

const _DepositsList = ({
  title,
  empty,
  groups,
  currency,
  highlight,
}: {
  title: string
  empty: string
  groups: DepositGroup[]
  currency: string
  highlight?: boolean
}) => (
  <div className="rounded-2xl bg-white p-5">
    <h3 className="text-base font-satoBold text-brand_dark mb-4">{title}</h3>
    {groups.length === 0 ? (
      <p className="text-sm text-brand_gray">{empty}</p>
    ) : (
      <ul className="flex flex-col gap-3">
        {groups.slice(0, 6).map((g) => (
          <li
            key={g.date}
            className={twMerge(
              "flex items-center justify-between rounded-xl px-4 py-3",
              highlight ? "bg-brand_blue/5" : "bg-slate-50",
            )}
          >
            <div className="flex flex-col">
              <span className="text-sm font-satoMedium text-brand_dark">
                {formatDateLong(g.date)}
              </span>
              <span className="text-[11px] text-brand_gray">
                {g.count} cobro{g.count === 1 ? "" : "s"} · comisión{" "}
                {formatMoney(g.fees, currency)}
              </span>
            </div>
            <span className="text-sm font-satoBold text-brand_dark tabular-nums">
              {formatMoney(g.net, currency)}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
)

const DepositsTable = ({
  payments,
  currency,
}: {
  payments: MpPayment[]
  currency: string
}) => {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const total = payments.length
  const paginated = payments.slice((page - 1) * perPage, page * perPage)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-satoBold text-brand_dark">
          Movimientos MercadoPago
        </h3>
        <span className="text-xs text-brand_gray">
          {total} cobro{total === 1 ? "" : "s"}
        </span>
      </div>
      <div className="hidden lg:block w-full overflow-x-auto rounded-2xl">
        <div className="min-w-[820px]">
          <div className="grid gap-x-4 grid-cols-[140px_1fr_120px_120px_120px_140px] rounded-t-2xl border-b border-brand_stroke bg-white px-6 py-3 text-[12px] font-satoMedium text-brand_gray uppercase tracking-wide">
            <div>Fecha cobro</div>
            <div>Método</div>
            <div className="text-right">Bruto</div>
            <div className="text-right">Comisión</div>
            <div className="text-right">Neto</div>
            <div>Liberación</div>
          </div>
          <div className="rounded-b-2xl bg-white divide-y divide-brand_stroke">
            {paginated.map((p) => {
              const fee = (p.fee_details ?? []).reduce(
                (s, f) => s + f.amount,
                0,
              )
              const net =
                p.transaction_details?.net_received_amount ??
                p.transaction_amount
              const released =
                p.money_release_date &&
                new Date(p.money_release_date) <= new Date()
              return (
                <div
                  key={p.id}
                  className="grid gap-x-4 grid-cols-[140px_1fr_120px_120px_120px_140px] items-center px-6 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="text-[12px] text-brand_gray">
                    {p.date_approved
                      ? formatDateLong(p.date_approved)
                      : formatDateLong(p.date_created)}
                  </div>
                  <div className="text-[13px] text-brand_dark capitalize truncate">
                    {p.payment_method_id ?? p.payment_type_id ?? "—"}
                  </div>
                  <div className="text-[13px] text-brand_gray text-right tabular-nums">
                    {formatMoney(p.transaction_amount, currency)}
                  </div>
                  <div className="text-[13px] text-brand_gray text-right tabular-nums">
                    {formatMoney(fee, currency)}
                  </div>
                  <div className="text-[13px] text-brand_dark text-right tabular-nums font-satoBold">
                    {formatMoney(net, currency)}
                  </div>
                  <div className="text-[12px]">
                    {p.money_release_date ? (
                      <span
                        className={twMerge(
                          "inline-flex px-2 py-[3px] rounded text-[11px] font-satoMedium",
                          released
                            ? "bg-[#d5faf1] text-[#2a645f]"
                            : "bg-[#fff8e1] text-[#8b6914]",
                        )}
                      >
                        {released
                          ? "Liberado"
                          : formatDateLong(p.money_release_date)}
                      </span>
                    ) : (
                      <span className="text-brand_gray">—</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden rounded-2xl bg-white divide-y divide-brand_stroke">
        {paginated.map((p) => {
          const fee = (p.fee_details ?? []).reduce((s, f) => s + f.amount, 0)
          const net =
            p.transaction_details?.net_received_amount ?? p.transaction_amount
          const released =
            p.money_release_date && new Date(p.money_release_date) <= new Date()
          return (
            <div key={p.id} className="p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] text-brand_gray">
                    {p.date_approved
                      ? formatDateLong(p.date_approved)
                      : formatDateLong(p.date_created)}
                  </p>
                  <p className="text-[14px] font-satoBold text-brand_dark capitalize">
                    {p.payment_method_id ?? p.payment_type_id ?? "—"}
                  </p>
                </div>
                <span className="text-[14px] font-satoBold text-brand_dark tabular-nums">
                  {formatMoney(net, currency)}
                </span>
              </div>
              <div className="mt-2 flex justify-between items-center text-[11px] text-brand_gray">
                <span>Comisión {formatMoney(fee, currency)}</span>
                {p.money_release_date ? (
                  <span
                    className={twMerge(
                      "inline-flex px-2 py-[3px] rounded font-satoMedium",
                      released
                        ? "bg-[#d5faf1] text-[#2a645f]"
                        : "bg-[#fff8e1] text-[#8b6914]",
                    )}
                  >
                    {released
                      ? "Liberado"
                      : formatDateLong(p.money_release_date)}
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {total > 0 && (
        <Pagination
          total={total}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}
    </div>
  )
}
