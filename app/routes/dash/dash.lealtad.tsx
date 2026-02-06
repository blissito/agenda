import { useRef, useState } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "react-router";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { PrimaryButton } from "~/components/common/primaryButton";
import { ArrowRight } from "~/components/icons/arrowRight";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getOrgLoyaltyStats, getAllRewards, getTransactions, LOYALTY_CONFIG } from "~/lib/loyalty.server";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/dash.lealtad";

type Reward = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  value: number;
  pointsCost: number;
  minTier: string | null;
  maxRedemptions: number | null;
  currentRedemptions: number;
  isActive: boolean;
};

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
    getAllRewards(org.id),
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
  const [isCreating, setIsCreating] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const revalidator = useRevalidator();

  const handleCreateReward = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    const form = e.currentTarget;
    const payload = {
      name: (form.elements.namedItem("rewardName") as HTMLInputElement).value,
      description: (form.elements.namedItem("rewardDesc") as HTMLInputElement).value,
      type: (form.elements.namedItem("rewardType") as HTMLSelectElement).value,
      value: Number((form.elements.namedItem("rewardValue") as HTMLInputElement).value),
      pointsCost: Number((form.elements.namedItem("pointsCost") as HTMLInputElement).value),
    };

    await fetch("/api/loyalty?intent=create-reward", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: JSON.stringify(payload) }),
    });

    form.reset();
    setIsCreating(false);
    revalidator.revalidate();
  };

  const handleToggleActive = async (reward: Reward) => {
    await fetch("/api/loyalty?intent=update-reward", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        data: JSON.stringify({ rewardId: reward.id, isActive: !reward.isActive }),
      }),
    });
    revalidator.revalidate();
  };

  const handleDelete = async (reward: Reward) => {
    if (!confirm(`¿Eliminar "${reward.name}"? Esta acción no se puede deshacer.`)) return;

    const res = await fetch("/api/loyalty?intent=delete-reward", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: JSON.stringify({ rewardId: reward.id }) }),
    });
    const result = await res.json();

    if (result.error) {
      alert(result.error);
    } else {
      revalidator.revalidate();
    }
  };

  const handleUpdateReward = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingReward) return;
    setIsUpdating(true);

    const form = e.currentTarget;
    const payload = {
      rewardId: editingReward.id,
      name: (form.elements.namedItem("editName") as HTMLInputElement).value,
      description: (form.elements.namedItem("editDesc") as HTMLInputElement).value || null,
      type: (form.elements.namedItem("editType") as HTMLSelectElement).value,
      value: Number((form.elements.namedItem("editValue") as HTMLInputElement).value),
      pointsCost: Number((form.elements.namedItem("editPointsCost") as HTMLInputElement).value),
    };

    await fetch("/api/loyalty?intent=update-reward", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: JSON.stringify(payload) }),
    });

    setEditingReward(null);
    setIsUpdating(false);
    revalidator.revalidate();
  };

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
              <div
                key={r.id}
                className={`bg-white border rounded-lg p-4 ${!r.isActive ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {r.name}
                      {!r.isActive && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          Inactiva
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{r.description}</div>
                    <div className="mt-2 text-sm">
                      <span className="font-semibold">{r.pointsCost} pts</span>
                      {" · "}
                      {r.type === "discount_percent" && `${r.value}% descuento`}
                      {r.type === "discount_fixed" && `$${r.value / 100} descuento`}
                      {r.type === "free_service" && "Servicio gratis"}
                    </div>
                    {r.minTier && (
                      <div className="text-xs text-gray-400 mt-1">Mínimo: {r.minTier}</div>
                    )}
                    {r.currentRedemptions > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {r.currentRedemptions} canjes
                        {r.maxRedemptions && ` / ${r.maxRedemptions} máx`}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => setEditingReward(r)}
                      className="p-1.5 text-gray-500 hover:text-brand_blue hover:bg-gray-100 rounded"
                      title="Editar"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      onClick={() => handleToggleActive(r)}
                      className={`p-1.5 rounded ${
                        r.isActive
                          ? "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={r.isActive ? "Desactivar" : "Activar"}
                    >
                      {r.isActive ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button
                      onClick={() => handleDelete(r)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit modal */}
        {editingReward && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="font-semibold text-lg mb-4">Editar recompensa</h3>
              <form onSubmit={handleUpdateReward} className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                  <input
                    name="editName"
                    defaultValue={editingReward.name}
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Descripción</label>
                  <input
                    name="editDesc"
                    defaultValue={editingReward.description || ""}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                  <select
                    name="editType"
                    defaultValue={editingReward.type}
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="discount_percent">% Descuento</option>
                    <option value="discount_fixed">$ Descuento fijo</option>
                    <option value="free_service">Servicio gratis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Valor</label>
                  <input
                    name="editValue"
                    type="number"
                    defaultValue={editingReward.value}
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Costo en puntos</label>
                  <input
                    name="editPointsCost"
                    type="number"
                    defaultValue={editingReward.pointsCost}
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingReward(null)}
                    className="flex-1 border rounded px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 bg-brand_blue text-white px-4 py-2 rounded text-sm hover:bg-brand_blue/90 disabled:opacity-50"
                  >
                    {isUpdating ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create reward form */}
        <form
          ref={formRef}
          onSubmit={handleCreateReward}
          className="mt-6 bg-gray-50 p-4 rounded-lg max-w-md"
        >
          <h3 className="font-medium mb-3">Nueva recompensa</h3>
          <div className="space-y-3">
            <input
              name="rewardName"
              placeholder="Nombre"
              required
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <input
              name="rewardDesc"
              placeholder="Descripción (opcional)"
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <select name="rewardType" required className="w-full border rounded px-3 py-2 text-sm">
              <option value="discount_percent">% Descuento</option>
              <option value="discount_fixed">$ Descuento fijo</option>
              <option value="free_service">Servicio gratis</option>
            </select>
            <input
              name="rewardValue"
              type="number"
              placeholder="Valor (ej: 10 para 10%)"
              required
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <input
              name="pointsCost"
              type="number"
              placeholder="Costo en puntos"
              required
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={isCreating}
              className="bg-brand_blue text-white px-4 py-2 rounded text-sm hover:bg-brand_blue/90 disabled:opacity-50"
            >
              {isCreating ? "Creando..." : "Crear recompensa"}
            </button>
          </div>
        </form>
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
                    <td
                      className={`px-4 py-2 text-right ${tx.points >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {tx.points >= 0 ? "+" : ""}
                      {tx.points}
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

// Icons
function PencilIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
    </svg>
  );
}
