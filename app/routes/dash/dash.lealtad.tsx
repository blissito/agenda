import { useEffect, useRef } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { PrimaryButton } from "~/components/common/primaryButton";
import { ArrowRight } from "~/components/icons/arrowRight";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getOrgLoyaltyStats, getRewards, getTransactions, LOYALTY_CONFIG } from "~/lib/loyalty.server";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/dash.lealtad";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  if (!org) throw new Response("Org not found", { status: 404 });

  const orgData = await db.org.findUnique({
    where: { id: org.id },
    select: { loyaltyEnabled: true },
  });

  if (!orgData?.loyaltyEnabled) {
    return { enabled: false as const };
  }

  const [stats, rewards, transactions] = await Promise.all([
    getOrgLoyaltyStats(org.id),
    getRewards(org.id),
    getTransactions({ orgId: org.id, limit: 20 }),
  ]);

  return { enabled: true as const, stats, rewards, transactions, tiers: LOYALTY_CONFIG.tiers };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  if (!org) throw new Response("Org not found", { status: 404 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "enable-loyalty") {
    await db.org.update({
      where: { id: org.id },
      data: { loyaltyEnabled: true },
    });
    return { success: true };
  }

  return { error: "Unknown intent" };
};

export default function Lealtad() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  if (!data.enabled) {
    return (
      <main>
        <RouteTitle>Lealtad</RouteTitle>
        <EmptyStateLoyalty fetcher={fetcher} />
      </main>
    );
  }

  const { stats, rewards, transactions, tiers } = data;
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form after successful submission
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      formRef.current?.reset();
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <main className="p-6">
      <RouteTitle>Programa de Lealtad</RouteTitle>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Clientes activos" value={stats.totalCustomers} />
        <StatCard label="Transacciones (30d)" value={stats.transactionsLast30Days} />
        <StatCard label="Recompensas activas" value={stats.activeRewards} />
        <StatCard label="Tiers" value={Object.keys(stats.tierBreakdown).length} />
      </div>

      {/* Tier breakdown */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Distribución por Tier</h2>
        <div className="flex gap-4 flex-wrap">
          {tiers.map((t) => (
            <div key={t.name} className="bg-white border rounded-lg px-4 py-3 min-w-[120px]">
              <div className="text-xs text-gray-500 uppercase">{t.name}</div>
              <div className="text-2xl font-bold">{stats.tierBreakdown[t.name] ?? 0}</div>
              <div className="text-xs text-gray-400">{t.multiplier}x puntos</div>
            </div>
          ))}
        </div>
      </section>

      {/* Rewards */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Recompensas</h2>
        {rewards.length === 0 ? (
          <p className="text-gray-500">No hay recompensas configuradas.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {rewards.map((r) => (
              <div key={r.id} className="bg-white border rounded-lg p-4">
                <div className="font-medium">{r.name}</div>
                <div className="text-sm text-gray-500">{r.description}</div>
                <div className="mt-2 text-sm">
                  <span className="font-semibold">{r.pointsCost} pts</span>
                  {" · "}
                  {r.type === "discount_percent" && `${r.value}% descuento`}
                  {r.type === "discount_fixed" && `$${r.value / 100} descuento`}
                  {r.type === "free_service" && "Servicio gratis"}
                </div>
                {r.minTier && <div className="text-xs text-gray-400 mt-1">Mínimo: {r.minTier}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Create reward form */}
        <fetcher.Form
          ref={formRef}
          method="post"
          action="/api/loyalty?intent=create-reward"
          className="mt-6 bg-gray-50 p-4 rounded-lg max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = {
              name: (form.elements.namedItem("rewardName") as HTMLInputElement).value,
              description: (form.elements.namedItem("rewardDesc") as HTMLInputElement).value,
              type: (form.elements.namedItem("rewardType") as HTMLSelectElement).value,
              value: Number((form.elements.namedItem("rewardValue") as HTMLInputElement).value),
              pointsCost: Number((form.elements.namedItem("pointsCost") as HTMLInputElement).value),
            };
            fetcher.submit({ data: JSON.stringify(formData) }, { method: "POST", action: "/api/loyalty?intent=create-reward" });
          }}
        >
          <h3 className="font-medium mb-3">Nueva recompensa</h3>
          <div className="space-y-3">
            <input name="rewardName" placeholder="Nombre" required className="w-full border rounded px-3 py-2 text-sm" />
            <input name="rewardDesc" placeholder="Descripción (opcional)" className="w-full border rounded px-3 py-2 text-sm" />
            <select name="rewardType" required className="w-full border rounded px-3 py-2 text-sm">
              <option value="discount_percent">% Descuento</option>
              <option value="discount_fixed">$ Descuento fijo</option>
              <option value="free_service">Servicio gratis</option>
            </select>
            <input name="rewardValue" type="number" placeholder="Valor (ej: 10 para 10%)" required className="w-full border rounded px-3 py-2 text-sm" />
            <input name="pointsCost" type="number" placeholder="Costo en puntos" required className="w-full border rounded px-3 py-2 text-sm" />
            <button type="submit" className="bg-brand_blue text-white px-4 py-2 rounded text-sm hover:bg-brand_blue/90">
              {fetcher.state !== "idle" ? "Creando..." : "Crear recompensa"}
            </button>
          </div>
        </fetcher.Form>
      </section>

      {/* Recent transactions */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Transacciones recientes</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">Sin transacciones aún.</p>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2">Cliente</th>
                  <th className="text-left px-4 py-2">Tipo</th>
                  <th className="text-right px-4 py-2">Puntos</th>
                  <th className="text-right px-4 py-2">Balance</th>
                  <th className="text-left px-4 py-2">Razón</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t">
                    <td className="px-4 py-2">{tx.customer.displayName}</td>
                    <td className="px-4 py-2">{tx.type}</td>
                    <td className={`px-4 py-2 text-right ${tx.points >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {tx.points >= 0 ? "+" : ""}{tx.points}
                    </td>
                    <td className="px-4 py-2 text-right">{tx.balance}</td>
                    <td className="px-4 py-2 text-gray-500">{tx.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function EmptyStateLoyalty({ fetcher }: { fetcher: ReturnType<typeof useFetcher> }) {
  const isLoading = fetcher.state !== "idle";

  return (
    <div className="w-full h-[80vh] bg-cover mt-10 flex justify-center items-center">
      <div className="text-center">
        <img className="mx-auto mb-4" src="/images/no-result.svg" alt="" />
        <p className="font-satoMedium text-xl font-bold">
          Activa el programa de lealtad <span className="text-2xl">🧧</span>
        </p>
        <p className="mt-2 text-brand_gray">
          Ofrece tarjetas de regalo y descuentos a tus clientes más fieles
        </p>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="enable-loyalty" />
          <PrimaryButton type="submit" isDisabled={isLoading} className="mx-auto mt-12">
            {isLoading ? "Activando..." : "Activar programa"} <ArrowRight />
          </PrimaryButton>
        </fetcher.Form>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
