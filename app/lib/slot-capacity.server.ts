import type { Prisma } from "@prisma/client"
import { db } from "~/utils/db.server"

// Estados que NO ocupan un cupo (cita cancelada). El resto sí cuenta.
const CANCELLED_STATUSES = ["CANCELLED", "canceled"]

// Filtro de sede robusto: el índice unique trata `branchId` ausente y null como
// el mismo carril, pero Prisma Mongo los distingue al filtrar. Sin este OR, la
// query no "ve" citas sin sede y reintenta el mismo slotIndex (P2002 → falso lleno).
export function branchIdFilter(branchId: string | null): Prisma.EventWhereInput {
  return branchId
    ? { branchId }
    : { OR: [{ branchId: null }, { branchId: { isSet: false } }] }
}

/**
 * Capacidad efectiva de un servicio por slot (cuántas reservas simultáneas
 * admite el MISMO servicio a la misma hora). Si `allowMultiple` está apagado,
 * la capacidad es 1 (comportamiento histórico).
 */
export function getServiceCapacity(service: {
  allowMultiple: boolean
  seats: bigint | number | null
}): number {
  if (!service.allowMultiple) return 1
  const seats = Number(service.seats ?? 1)
  return Number.isFinite(seats) && seats > 1 ? Math.floor(seats) : 1
}

type ResolveParams = {
  org: { config?: { simultaneousServices?: boolean | null } | null }
  service: { id: string; allowMultiple: boolean; seats: bigint | number | null }
  branchId: string | null
  // Filtro de sede para la verificación cross-service (de branchEventFilter()).
  branchWhere?: Prisma.EventWhereInput
  start: Date
  end: Date
}

export type SlotReason = "full" | "conflict"

/**
 * Cuenta los cupos ocupados del MISMO servicio en (serviceId, branchId, start)
 * y devuelve el menor `slotIndex` libre (0..capacidad-1), o null si está lleno.
 */
async function findFreeSlotIndex(
  serviceId: string,
  branchId: string | null,
  start: Date,
  capacity: number,
): Promise<number | null> {
  const taken = await db.event.findMany({
    where: {
      serviceId,
      start,
      ...branchIdFilter(branchId),
      archived: false,
      status: { notIn: CANCELLED_STATUSES },
    },
    select: { slotIndex: true },
  })
  const used = new Set(taken.map((e) => e.slotIndex ?? 0))
  for (let i = 0; i < capacity; i++) {
    if (!used.has(i)) return i
  }
  return null
}

/**
 * Recurso único: un evento de OTRO servicio en la sede bloquea el horario por
 * solapamiento. Se excluye el mismo servicio (su concurrencia la rige `seats`),
 * así los dos ejes quedan ortogonales.
 */
async function hasCrossServiceOverlap(
  branchWhere: Prisma.EventWhereInput,
  excludeServiceId: string,
  start: Date,
  end: Date,
): Promise<boolean> {
  // Solapan si: existente.start < nuevo.end AND existente.end > nuevo.start
  const overlap = await db.event.findFirst({
    where: {
      ...branchWhere,
      serviceId: { not: excludeServiceId },
      archived: false,
      status: { notIn: CANCELLED_STATUSES },
      start: { lt: end },
      end: { gt: start },
    },
    select: { id: true },
  })
  return !!overlap
}

/**
 * Decide si un slot está disponible y, de estarlo, en qué `slotIndex` crear.
 * Combina los dos ejes:
 *  - Eje 1 (org.config.simultaneousServices === false): bloqueo cross-service
 *    por solapamiento de duración.
 *  - Eje 2 (Service.allowMultiple + seats): capacidad del mismo servicio.
 */
export async function resolveSlot(
  params: ResolveParams,
): Promise<{ ok: true; slotIndex: number } | { ok: false; reason: SlotReason }> {
  const { org, service, branchId, branchWhere, start, end } = params

  // Default OFF (false/ausente) = recurso único ⇒ bloquea servicios distintos
  // en el mismo horario. Solo `true` (el dueño lo prendió) permite simultáneos.
  const simultaneous = org.config?.simultaneousServices === true
  if (!simultaneous) {
    const blocked = await hasCrossServiceOverlap(
      branchWhere ?? {},
      service.id,
      start,
      end,
    )
    if (blocked) return { ok: false, reason: "conflict" }
  }

  const capacity = getServiceCapacity(service)
  const slotIndex = await findFreeSlotIndex(service.id, branchId, start, capacity)
  if (slotIndex === null) return { ok: false, reason: "full" }
  return { ok: true, slotIndex }
}

const isP2002 = (e: unknown): boolean =>
  !!e &&
  typeof e === "object" &&
  "code" in e &&
  (e as { code: string }).code === "P2002"

/**
 * Crea un evento en un cupo libre, reintentando ante colisiones de carrera
 * (P2002 = otro cliente tomó ese `slotIndex` entre el resolve y el create).
 * El callback recibe el `slotIndex` a usar y debe incluirlo en el create.
 */
export async function createEventInFreeSlot<T>(
  params: ResolveParams,
  create: (slotIndex: number) => Promise<T>,
): Promise<{ ok: true; event: T } | { ok: false; reason: SlotReason }> {
  const capacity = getServiceCapacity(params.service)
  // A lo sumo `capacity` intentos: cada P2002 descarta un carril ocupado.
  for (let attempt = 0; attempt <= capacity; attempt++) {
    const decision = await resolveSlot(params)
    if (!decision.ok) return decision
    try {
      const event = await create(decision.slotIndex)
      return { ok: true, event }
    } catch (e) {
      if (isP2002(e)) continue
      throw e
    }
  }
  return { ok: false, reason: "full" }
}
