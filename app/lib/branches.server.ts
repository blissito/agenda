import type { Branch, Prisma } from "@prisma/client"
import { getSession } from "~/sessions"
import { generateUniqueBranchSlug } from "~/utils/slugs.server"
import { db } from "~/utils/db.server"

// ==================== TYPES ====================

export interface CreateBranchInput {
  orgId: string
  name: string
  address?: string | null
  lat?: number | null
  lng?: number | null
  timezone?: string | null
  tel?: string | null
  email?: string | null
  weekDays?: Prisma.BranchWeekDaysCreateInput | null
  isDefault?: boolean
}

export type UpdateBranchInput = Partial<
  Omit<CreateBranchInput, "orgId" | "isDefault">
> & { isActive?: boolean }

// ==================== QUERIES ====================

/** Sucursales de una org, default primero y luego por fecha de creación. */
export async function listBranches(orgId: string): Promise<Branch[]> {
  return db.branch.findMany({
    where: { orgId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  })
}

/**
 * Resuelve la sede activa. Si `branchId` es válido y pertenece a la org la usa;
 * si no, cae a `Org.defaultBranchId` y, en último caso, a la primera sucursal.
 * Devuelve null si la org no tiene ninguna sucursal (no debería pasar tras backfill).
 */
export async function getActiveBranch(
  orgId: string,
  branchId?: string | null,
): Promise<Branch | null> {
  if (branchId) {
    const match = await db.branch.findFirst({ where: { id: branchId, orgId } })
    if (match) return match
  }
  const org = await db.org.findUnique({
    where: { id: orgId },
    select: { defaultBranchId: true },
  })
  if (org?.defaultBranchId) {
    const def = await db.branch.findFirst({
      where: { id: org.defaultBranchId, orgId },
    })
    if (def) return def
  }
  return db.branch.findFirst({
    where: { orgId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  })
}

/**
 * Resuelve la sede del filtro global leyendo `activeBranchId` de la sesión.
 * Devuelve `null` cuando el filtro está en "Todas las sucursales" (agregado) —
 * NO cae al default. Las vistas agregables interpretan null = todo el negocio;
 * la config por-sede interpreta null = default del negocio.
 */
export async function getActiveBranchFromRequest(
  request: Request,
  orgId: string,
): Promise<Branch | null> {
  const session = await getSession(request.headers.get("Cookie"))
  const id = session.get("activeBranchId")
  if (!id) return null
  return db.branch.findFirst({ where: { id, orgId } })
}

/**
 * Verifica que una sucursal pertenezca a la org. Cierra IDOR: nunca confíes en
 * el `branchId` del body para mutar sin comprobar ownership. Throw 404 si no aplica.
 */
export async function assertBranchInOrg(
  branchId: string,
  orgId: string,
): Promise<Branch> {
  const branch = await db.branch.findFirst({ where: { id: branchId, orgId } })
  if (!branch) throw new Response("Branch not found", { status: 404 })
  return branch
}

// ==================== MUTATIONS ====================

/** Crea una sucursal con slug único dentro de la org. */
export async function createBranch(input: CreateBranchInput): Promise<Branch> {
  const slug = await generateUniqueBranchSlug(input.name, input.orgId)
  const branch = await db.branch.create({
    data: {
      orgId: input.orgId,
      name: input.name.trim(),
      slug,
      isDefault: input.isDefault ?? false,
      isActive: true,
      address: input.address ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      timezone: input.timezone ?? null,
      tel: input.tel ?? null,
      email: input.email ?? null,
      weekDays: input.weekDays ?? undefined,
    },
  })
  return branch
}

/**
 * Crea un ServiceBranch (sin overrides) por cada servicio no archivado del Org.
 * Se llama al crear una sucursal para que herede todo el catálogo por default.
 */
export async function offerAllServicesAtBranch(
  orgId: string,
  branchId: string,
): Promise<number> {
  const services = await db.service.findMany({
    where: { orgId, archived: false },
    select: { id: true },
  })
  if (!services.length) return 0
  // La sucursal es nueva → no hay ServiceBranch previos que deduplicar.
  await db.serviceBranch.createMany({
    data: services.map((s) => ({ serviceId: s.id, branchId })),
  })
  return services.length
}

/**
 * Escribe el horario de una sucursal. Si es la sede default, también espeja a
 * `Org.weekDays` para no romper consumidores legacy (landing/agenda org-level).
 */
export async function setBranchWeekDays(
  branchId: string,
  orgId: string,
  weekDays: Prisma.BranchWeekDaysCreateInput | null,
): Promise<void> {
  const branch = await assertBranchInOrg(branchId, orgId)
  await db.branch.update({
    where: { id: branchId },
    data: { weekDays: weekDays ? { set: weekDays } : { unset: true } },
  })
  if (branch.isDefault) {
    await db.org.update({
      where: { id: orgId },
      data: { weekDays: weekDays ? { set: weekDays as any } : { unset: true } },
    })
  }
}

/** Actualiza campos de una sucursal (ownership ya verificada por el caller). */
export async function updateBranch(
  branchId: string,
  orgId: string,
  data: UpdateBranchInput,
): Promise<Branch> {
  await assertBranchInOrg(branchId, orgId)
  return db.branch.update({
    where: { id: branchId },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
      ...(data.lat !== undefined ? { lat: data.lat } : {}),
      ...(data.lng !== undefined ? { lng: data.lng } : {}),
      ...(data.timezone !== undefined ? { timezone: data.timezone } : {}),
      ...(data.tel !== undefined ? { tel: data.tel } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.weekDays !== undefined
        ? { weekDays: data.weekDays ? { set: data.weekDays } : { unset: true } }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  })
}

/**
 * Activa/desactiva una sucursal. No permite desactivar la sede default (siempre
 * debe haber al menos una sede operativa).
 */
export async function toggleBranchActive(
  branchId: string,
  orgId: string,
): Promise<Branch> {
  const branch = await assertBranchInOrg(branchId, orgId)
  if (branch.isDefault && branch.isActive) {
    throw new Response("No se puede desactivar la sede principal", {
      status: 400,
    })
  }
  return db.branch.update({
    where: { id: branchId },
    data: { isActive: !branch.isActive },
  })
}

/**
 * Fragmento de `where` para scopear queries de Event por el filtro de sede.
 * - null (filtro "Todas") → {} (sin filtro, todo el negocio).
 * - sede principal → matchea su branchId O eventos sin branchId (los que aún no
 *   se taguean al crearse en el booking; la principal es su hogar por default).
 * - sede no-principal → match exacto de branchId.
 * Spread-eable dentro de cualquier where que ya filtre por orgId/fecha/etc.
 */
export function branchEventFilter(
  activeBranch: Pick<Branch, "id" | "isDefault"> | null,
): Prisma.EventWhereInput {
  if (!activeBranch) return {}
  if (activeBranch.isDefault) {
    return {
      OR: [{ branchId: activeBranch.id }, { branchId: { isSet: false } }],
    }
  }
  return { branchId: activeBranch.id }
}

// ==================== RESOLUCIÓN POR CAPAS (Fase 2) ====================
// Precio/horario/timezone efectivos de un servicio en una sede. El override del
// ServiceBranch gana; si no hay, hereda del Service y luego del Branch/Org.

/** timezone efectivo: Branch.timezone ?? Org.timezone. */
export function resolveTimezone(
  branch: Pick<Branch, "timezone"> | null,
  orgTimezone?: string | null,
): string | null {
  return branch?.timezone ?? orgTimezone ?? null
}

// ==================== BOOKING PÚBLICO (Fase 2) ====================

export interface ServiceBookingContext {
  /** Sedes activas que ofrecen este servicio (default primero). */
  branches: Branch[]
  /** Sede resuelta del `?sucursal={slug}` o, si no, la default/primera. */
  activeBranch: Branch | null
  /** Override del servicio en la sede activa (price/weekDays), si existe. */
  activeServiceBranch: {
    price: bigint | null
    weekDays: unknown
  } | null
}

/**
 * Resuelve el contexto de sede para el booking público de un servicio:
 * qué sedes activas lo ofrecen (`ServiceBranch.isActive` + `Branch.isActive`),
 * cuál es la sede activa (por `branchSlug` del `?sucursal=`, o la default), y el
 * override de esa sede para el servicio. Las capas de price/weekDays se resuelven
 * en el loader con este contexto.
 *
 * Para orgs single-location (solo "Principal") devuelve `branches.length === 1`,
 * así el booking se comporta igual que antes (sin picker de sede).
 */
export async function resolveServiceBookingContext(params: {
  serviceId: string
  orgId: string
  branchSlug?: string | null
}): Promise<ServiceBookingContext> {
  const { serviceId, orgId, branchSlug } = params
  const serviceBranches = await db.serviceBranch.findMany({
    where: { serviceId, isActive: true },
    select: { branchId: true, price: true, weekDays: true },
  })
  if (serviceBranches.length === 0) {
    return { branches: [], activeBranch: null, activeServiceBranch: null }
  }
  const branches = await db.branch.findMany({
    where: {
      id: { in: serviceBranches.map((sb) => sb.branchId) },
      orgId,
      isActive: true,
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  })
  let activeBranch: Branch | null = null
  if (branchSlug) {
    activeBranch = branches.find((b) => b.slug === branchSlug) ?? null
  }
  if (!activeBranch) {
    activeBranch = branches.find((b) => b.isDefault) ?? branches[0] ?? null
  }
  const activeServiceBranch = activeBranch
    ? (serviceBranches.find((sb) => sb.branchId === activeBranch?.id) ?? null)
    : null
  return {
    branches,
    activeBranch,
    activeServiceBranch: activeServiceBranch
      ? { price: activeServiceBranch.price, weekDays: activeServiceBranch.weekDays }
      : null,
  }
}
