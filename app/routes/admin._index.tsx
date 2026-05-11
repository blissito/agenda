/**
 * Admin dashboard — read-only.
 *
 * Lists every org with its lifetime AI cost (USD) for landing generation,
 * counts of gens/refines, and the current-month usage. Auth-gated to
 * `ADMIN_EMAILS` (env var) via `getAdminUserOrRedirect`.
 *
 * Costs come from `Org.landingTotalCostUsd`, populated by
 * `incrementLandingUsage()` using the per-op constants in
 * `app/lib/landing-generator.server.ts:COST_USD`. When the SDK exposes a
 * per-call `usage` callback we'll swap to real token counts; until then
 * these are estimates derived from typical token sizes × current pricing.
 */
import { getAdminUserOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/admin._index"

export const loader = async ({ request }: Route.LoaderArgs) => {
  await getAdminUserOrRedirect(request)

  const currentMonth = new Date().toISOString().slice(0, 7)

  const orgs = await db.org.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      landingTotalCostUsd: true,
      landingTotalGens: true,
      landingTotalRefines: true,
      landingGenCount: true,
      landingRefineCount: true,
      landingUsageMonth: true,
    },
    orderBy: { landingTotalCostUsd: "desc" },
  })

  const totals = orgs.reduce(
    (acc, o) => {
      acc.cost += o.landingTotalCostUsd ?? 0
      acc.gens += o.landingTotalGens ?? 0
      acc.refines += o.landingTotalRefines ?? 0
      const isCurrent = o.landingUsageMonth === currentMonth
      acc.monthGens += isCurrent ? o.landingGenCount : 0
      acc.monthRefines += isCurrent ? o.landingRefineCount : 0
      return acc
    },
    { cost: 0, gens: 0, refines: 0, monthGens: 0, monthRefines: 0 },
  )

  return { orgs, totals, currentMonth }
}

export const handle = { hideSidebar: true }

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)

export default function AdminIndex({ loaderData }: Route.ComponentProps) {
  const { orgs, totals, currentMonth } = loaderData

  return (
    <main className="min-h-screen bg-brand_dark text-white px-6 py-10">
      <header className="max-w-6xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">
          Admin
        </p>
        <h1 className="text-3xl font-bold mt-1">AI cost tracking</h1>
        <p className="mt-2 text-sm text-gray-400 max-w-xl">
          Lifetime totals por org de generación de landings con Gemini 2.5 Pro.
          Mes actual: <span className="font-mono text-white">{currentMonth}</span>.
          Estimaciones derivadas de constantes por operación (ver
          <code className="mx-1 px-1.5 py-0.5 bg-white/10 rounded text-xs">
            COST_USD
          </code>
          en
          <code className="mx-1 px-1.5 py-0.5 bg-white/10 rounded text-xs">
            app/lib/landing-generator.server.ts
          </code>
          ).
        </p>
      </header>

      <section className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Total lifetime" value={usd(totals.cost)} accent />
        <Stat label="Total gens" value={String(totals.gens)} />
        <Stat label="Total refines" value={String(totals.refines)} />
        <Stat
          label="Operaciones este mes"
          value={`${totals.monthGens} g · ${totals.monthRefines} r`}
        />
      </section>

      <section className="max-w-6xl mx-auto">
        <h2 className="text-lg font-semibold mb-3">Orgs por gasto lifetime</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Org</th>
                <th className="text-right px-4 py-3 font-medium">Lifetime USD</th>
                <th className="text-right px-4 py-3 font-medium">Gens</th>
                <th className="text-right px-4 py-3 font-medium">Refines</th>
                <th className="text-right px-4 py-3 font-medium">Este mes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {orgs.map((o) => {
                const isCurrent = o.landingUsageMonth === currentMonth
                const monthGens = isCurrent ? o.landingGenCount : 0
                const monthRefines = isCurrent ? o.landingRefineCount : 0
                const hasMonthActivity = monthGens > 0 || monthRefines > 0
                return (
                  <tr key={o.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.name || "—"}</div>
                      {o.slug && (
                        <div className="text-xs text-gray-500 font-mono">
                          {o.slug}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {usd(o.landingTotalCostUsd ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-300">
                      {o.landingTotalGens ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-300">
                      {o.landingTotalRefines ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {hasMonthActivity ? (
                        <span className="text-white">
                          {monthGens}g · {monthRefines}r
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {orgs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No hay orgs todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-xl border px-5 py-4 ${
        accent
          ? "border-brand_blue/40 bg-brand_blue/10"
          : "border-gray-700 bg-white/5"
      }`}
    >
      <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold font-mono tabular-nums">{value}</p>
    </div>
  )
}
