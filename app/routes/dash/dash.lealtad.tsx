import { useRef, useState } from "react";
import { useFetcher, useLoaderData, useRevalidator, useSearchParams } from "react-router";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { PrimaryButton } from "~/components/common/primaryButton";
import { ArrowRight } from "~/components/icons/arrowRight";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getOrgLoyaltyStats, getAllRewards, getTransactions, getLevels } from "~/lib/loyalty.server";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/dash.lealtad";

// ==================== TYPES ====================

type Level = {
  id: string;
  name: string;
  image: string | null;
  minPoints: number;
  discountPercent: number;
  serviceIds: string[];
};

type Reward = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  value: number;
  pointsCost: number;
  maxRedemptions: number | null;
  currentRedemptions: number;
  isActive: boolean;
};

type ServiceOption = { id: string; name: string };

// ==================== LOADER / ACTION ====================

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

  const [stats, levels, rewards, transactions, services] = await Promise.all([
    getOrgLoyaltyStats(org.id),
    getLevels(org.id),
    getAllRewards(org.id),
    getTransactions({ orgId: org.id, limit: 20 }),
    db.service.findMany({
      where: { orgId: org.id, archived: false },
      select: { id: true, name: true },
    }),
  ]);

  return { enabled: true as const, stats, levels, rewards, transactions, services };
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

// ==================== COMPONENT ====================

export default function Lealtad() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!data.enabled) {
    return (
      <main>
        <RouteTitle>Lealtad</RouteTitle>
        <EmptyStateLoyalty fetcher={fetcher} />
      </main>
    );
  }

  const { stats, levels, rewards, transactions, services } = data;
  const activeTab = searchParams.get("tab") === "descuentos" ? "descuentos" : "niveles";

  const changeTab = (tab: "niveles" | "descuentos") => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next);
  };

  return (
    <main className="p-6">
      <RouteTitle>Programa de Lealtad</RouteTitle>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Clientes activos" value={stats.totalCustomers} />
        <StatCard label="Transacciones (30d)" value={stats.transactionsLast30Days} />
        <StatCard label="Recompensas activas" value={stats.activeRewards} />
        <StatCard label="Niveles" value={stats.levels.length} />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex items-center gap-6">
        <TabButton label="Niveles" active={activeTab === "niveles"} onClick={() => changeTab("niveles")} />
        <TabButton
          label="Descuentos"
          active={activeTab === "descuentos"}
          onClick={() => changeTab("descuentos")}
        />
      </div>

      <div className="mt-6">
        {activeTab === "niveles" ? (
          <NivelesTab levels={levels} services={services} levelBreakdown={stats.levelBreakdown} />
        ) : (
          <DescuentosTab rewards={rewards} transactions={transactions} />
        )}
      </div>
    </main>
  );
}

// ==================== TAB: NIVELES ====================

/**
 * Upload a file to Tigris via presigned URL.
 * Returns the storage key or null on failure.
 */
async function uploadLevelImage(file: File): Promise<string | null> {
  try {
    const res = await fetch("/api/loyalty?intent=level-upload-url");
    const { putUrl, key } = await res.json();
    const upload = await fetch(putUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Length": String(file.size),
        "Content-Type": file.type,
        "x-amz-acl": "public-read",
      },
    });
    return upload.ok ? key : null;
  } catch {
    return null;
  }
}

function NivelesTab({
  levels,
  services,
  levelBreakdown,
}: {
  levels: Level[];
  services: ServiceOption[];
  levelBreakdown: Record<string, number>;
}) {
  const revalidator = useRevalidator();
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const apiCall = async (intent: string, payload: Record<string, unknown>) => {
    await fetch(`/api/loyalty?intent=${intent}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: JSON.stringify(payload) }),
    });
    revalidator.revalidate();
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    const form = e.currentTarget;
    const selectedServices = Array.from(
      form.querySelectorAll<HTMLInputElement>('input[name="serviceId"]:checked')
    ).map((el) => el.value);

    // Upload image if selected
    const fileInput = form.elements.namedItem("levelImage") as HTMLInputElement;
    let imageKey: string | null = null;
    if (fileInput?.files?.[0]) {
      imageKey = await uploadLevelImage(fileInput.files[0]);
    }

    await apiCall("create-level", {
      name: (form.elements.namedItem("levelName") as HTMLInputElement).value,
      minPoints: Number((form.elements.namedItem("minPoints") as HTMLInputElement).value),
      discountPercent: Number((form.elements.namedItem("discountPercent") as HTMLInputElement).value),
      serviceIds: selectedServices,
      ...(imageKey && { image: imageKey }),
    });
    form.reset();
    setIsCreating(false);
    setShowForm(false);
  };

  const handleDelete = async (level: Level) => {
    const res = await fetch("/api/loyalty?intent=delete-level", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: JSON.stringify({ levelId: level.id }) }),
    });
    const result = await res.json();
    if (result.error) {
      alert(result.error);
    } else {
      revalidator.revalidate();
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLevel) return;
    const form = e.currentTarget;
    const selectedServices = Array.from(
      form.querySelectorAll<HTMLInputElement>('input[name="editServiceId"]:checked')
    ).map((el) => el.value);

    // Upload new image if selected
    const fileInput = form.elements.namedItem("editLevelImage") as HTMLInputElement;
    let imageKey: string | null = editingLevel.image;
    if (fileInput?.files?.[0]) {
      imageKey = await uploadLevelImage(fileInput.files[0]);
    }

    await apiCall("update-level", {
      levelId: editingLevel.id,
      name: (form.elements.namedItem("editLevelName") as HTMLInputElement).value,
      minPoints: Number((form.elements.namedItem("editMinPoints") as HTMLInputElement).value),
      discountPercent: Number((form.elements.namedItem("editDiscountPercent") as HTMLInputElement).value),
      serviceIds: selectedServices,
      image: imageKey,
    });
    setEditingLevel(null);
  };

  return (
    <div>
      {/* Level cards */}
      {levels.length === 0 ? (
        <p className="text-gray-500">No hay niveles configurados. Crea el primero.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {levels.map((level) => (
            <div key={level.id} className="bg-white border border-brand_stroke rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {level.image ? (
                    <img src={`/api/images?key=${level.image}`} alt={level.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand_sky flex items-center justify-center text-lg">
                      {level.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-brand_dark">{level.name}</h3>
                    <p className="text-xs text-gray-500">{level.minPoints} puntos requeridos</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingLevel(level)}
                    className="p-1.5 text-gray-500 hover:text-brand_blue hover:bg-gray-100 rounded"
                    title="Editar"
                  >
                    <PencilIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(level)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                  {level.discountPercent}% descuento
                </div>
                <div className="text-xs text-gray-400">
                  {levelBreakdown[level.id] ?? 0} cliente(s)
                </div>
              </div>

              {level.serviceIds.length > 0 && (
                <p className="mt-2 text-xs text-gray-400">
                  Aplica a {level.serviceIds.length} servicio(s)
                </p>
              )}
              {level.serviceIds.length === 0 && (
                <p className="mt-2 text-xs text-gray-400">Aplica a todos los servicios</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create button / form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mt-6 inline-flex items-center gap-2 bg-brand_blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand_blue/90"
        >
          + Nuevo nivel
        </button>
      ) : (
        <LevelForm
          title="Nuevo nivel"
          services={services}
          onSubmit={handleCreate}
          isLoading={isCreating}
          onCancel={() => setShowForm(false)}
          namePrefix=""
          serviceCheckboxName="serviceId"
        />
      )}

      {/* Edit modal */}
      {editingLevel && (
        <Modal onClose={() => setEditingLevel(null)}>
          <LevelForm
            title="Editar nivel"
            services={services}
            onSubmit={handleUpdate}
            isLoading={false}
            onCancel={() => setEditingLevel(null)}
            namePrefix="edit"
            serviceCheckboxName="editServiceId"
            defaultValues={editingLevel}
          />
        </Modal>
      )}
    </div>
  );
}

// ==================== TAB: DESCUENTOS ====================

function DescuentosTab({
  rewards,
  transactions,
}: {
  rewards: Reward[];
  transactions: {
    id: string;
    type: string;
    points: number;
    balance: number;
    reason: string;
    customer: { displayName: string; email: string };
  }[];
}) {
  const revalidator = useRevalidator();
  const formRef = useRef<HTMLFormElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const apiCall = async (intent: string, payload: Record<string, unknown>) => {
    const res = await fetch(`/api/loyalty?intent=${intent}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: JSON.stringify(payload) }),
    });
    return res.json();
  };

  const handleCreateReward = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    const form = e.currentTarget;
    await apiCall("create-reward", {
      name: (form.elements.namedItem("rewardName") as HTMLInputElement).value,
      description: (form.elements.namedItem("rewardDesc") as HTMLInputElement).value,
      type: (form.elements.namedItem("rewardType") as HTMLSelectElement).value,
      value: Number((form.elements.namedItem("rewardValue") as HTMLInputElement).value),
      pointsCost: Number((form.elements.namedItem("pointsCost") as HTMLInputElement).value),
    });
    form.reset();
    setIsCreating(false);
    revalidator.revalidate();
  };

  const handleToggleActive = async (reward: Reward) => {
    await apiCall("update-reward", { rewardId: reward.id, isActive: !reward.isActive });
    revalidator.revalidate();
  };

  const handleDelete = async (reward: Reward) => {
    const result = await apiCall("delete-reward", { rewardId: reward.id });
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
    await apiCall("update-reward", {
      rewardId: editingReward.id,
      name: (form.elements.namedItem("editName") as HTMLInputElement).value,
      description: (form.elements.namedItem("editDesc") as HTMLInputElement).value || null,
      type: (form.elements.namedItem("editType") as HTMLSelectElement).value,
      value: Number((form.elements.namedItem("editValue") as HTMLInputElement).value),
      pointsCost: Number((form.elements.namedItem("editPointsCost") as HTMLInputElement).value),
    });
    setEditingReward(null);
    setIsUpdating(false);
    revalidator.revalidate();
  };

  return (
    <div>
      {/* Rewards grid */}
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
                  {r.currentRedemptions > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      {r.currentRedemptions} canjes
                      {r.maxRedemptions && ` / ${r.maxRedemptions} max`}
                    </div>
                  )}
                </div>
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

      {/* Edit reward modal */}
      {editingReward && (
        <Modal onClose={() => setEditingReward(null)}>
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
              <label className="block text-sm text-gray-600 mb-1">Descripcion</label>
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
        </Modal>
      )}

      {/* Create reward form */}
      <form
        ref={formRef}
        onSubmit={handleCreateReward}
        className="mt-6 bg-gray-50 p-4 rounded-lg max-w-md"
      >
        <h3 className="font-medium mb-3">Nueva recompensa</h3>
        <div className="space-y-3">
          <input name="rewardName" placeholder="Nombre" required className="w-full border rounded px-3 py-2 text-sm" />
          <input
            name="rewardDesc"
            placeholder="Descripcion (opcional)"
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

      {/* Recent transactions */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Transacciones recientes</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">Sin transacciones aun.</p>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2">Cliente</th>
                  <th className="text-left px-4 py-2">Tipo</th>
                  <th className="text-right px-4 py-2">Puntos</th>
                  <th className="text-right px-4 py-2">Balance</th>
                  <th className="text-left px-4 py-2">Razon</th>
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
    </div>
  );
}

// ==================== SHARED COMPONENTS ====================

function LevelForm({
  title,
  services,
  onSubmit,
  isLoading,
  onCancel,
  namePrefix,
  serviceCheckboxName,
  defaultValues,
}: {
  title: string;
  services: ServiceOption[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onCancel: () => void;
  namePrefix: string;
  serviceCheckboxName: string;
  defaultValues?: Level;
}) {
  const n = (name: string) => (namePrefix ? `${namePrefix}${name.charAt(0).toUpperCase() + name.slice(1)}` : name);
  const [imagePreview, setImagePreview] = useState<string | null>(
    defaultValues?.image ? `/api/images?key=${defaultValues.image}` : null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-4 bg-gray-50 p-5 rounded-xl max-w-lg space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>

      {/* Image upload */}
      <div>
        <label className="block text-sm text-gray-600 mb-2">Imagen del nivel</label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
              Sin imagen
            </div>
          )}
          <label className="cursor-pointer bg-white border border-brand_stroke rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            {imagePreview ? "Cambiar" : "Subir imagen"}
            <input
              type="file"
              name={n("levelImage")}
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Nombre del nivel</label>
        <input
          name={n("levelName")}
          defaultValue={defaultValues?.name}
          required
          placeholder="Ej: VIP, Premium, Gold..."
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Puntos requeridos</label>
          <input
            name={n("minPoints")}
            type="number"
            min={0}
            defaultValue={defaultValues?.minPoints}
            required
            placeholder="500"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">% de descuento</label>
          <input
            name={n("discountPercent")}
            type="number"
            min={0}
            max={100}
            step={0.1}
            defaultValue={defaultValues?.discountPercent}
            required
            placeholder="15"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Service multi-select */}
      <div>
        <label className="block text-sm text-gray-600 mb-2">
          Servicios donde aplica el descuento
        </label>
        <p className="text-xs text-gray-400 mb-2">Si no seleccionas ninguno, aplica a todos.</p>
        <div className="max-h-40 overflow-y-auto space-y-1 border rounded-lg p-3 bg-white">
          {services.length === 0 ? (
            <p className="text-xs text-gray-400">No hay servicios creados.</p>
          ) : (
            services.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  name={serviceCheckboxName}
                  value={s.id}
                  defaultChecked={defaultValues?.serviceIds.includes(s.id)}
                  className="rounded border-gray-300"
                />
                {s.name}
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border rounded-lg px-4 py-2 text-sm hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-brand_blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand_blue/90 disabled:opacity-50"
        >
          {isLoading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pb-2 text-sm font-medium leading-5 ${
        active ? "text-[#20242D]" : "text-[#8A90A2]"
      }`}
    >
      {label}
      {active && <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#615FFF]" />}
    </button>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">{children}</div>
    </div>
  );
}

function EmptyStateLoyalty({ fetcher }: { fetcher: ReturnType<typeof useFetcher> }) {
  const isLoading = fetcher.state !== "idle";

  return (
    <div className="w-full h-[80vh] bg-cover mt-10 flex justify-center items-center">
      <div className="text-center">
        <img className="mx-auto mb-4" src="/images/emptyState/loyalty.webp" alt="" />
        <p className="text-xl font-satoBold">
          Convierte visitas en clientes frecuentes!
        </p>
        <p className="mt-2 mx-auto max-w-[620px] text-brand_gray text-center">
          Activa el programa de lealtad y ofrece descuentos permanentes a tus clientes mas fieles,
          ademas de promociones para temporadas especiales
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

// ==================== ICONS ====================

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
