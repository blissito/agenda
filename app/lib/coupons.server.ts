import { db } from "~/utils/db.server"

const COUPON_META_PREFIX = "__COUPON_META__:"

type CouponMeta = {
  code: string
  durationType: "one_time" | "several_months" | "forever"
  months: number
  applyAllServices: boolean
  serviceIds: string[]
}

function parseCouponMeta(
  description: string | null | undefined,
): CouponMeta | null {
  if (!description || !description.startsWith(COUPON_META_PREFIX)) return null
  try {
    const parsed = JSON.parse(
      description.slice(COUPON_META_PREFIX.length),
    ) as Partial<CouponMeta> & { durationType?: string }

    return {
      code: parsed.code || "",
      durationType:
        parsed.durationType === "several_months"
          ? "several_months"
          : parsed.durationType === "forever"
            ? "forever"
            : "one_time",
      months:
        typeof parsed.months === "number" && parsed.months > 0
          ? parsed.months
          : 1,
      applyAllServices: Boolean(parsed.applyAllServices),
      serviceIds: Array.isArray(parsed.serviceIds) ? parsed.serviceIds : [],
    }
  } catch {
    return null
  }
}

export type CouponDiscountType = "discount_percent" | "discount_fixed"

export type ValidCoupon = {
  rewardId: string
  code: string
  type: CouponDiscountType
  discountAmount: number
  label: string
}

export type ValidationResult =
  | { ok: true; coupon: ValidCoupon }
  | { ok: false; error: string }

export async function validateCouponByCode(params: {
  code: string
  orgId: string
  serviceId: string
  servicePrice: number
}): Promise<ValidationResult> {
  const code = params.code.trim()
  if (!code) return { ok: false, error: "Código de cupón requerido" }

  const rewards = await db.loyaltyReward.findMany({
    where: { orgId: params.orgId, isActive: true },
  })

  const match = rewards.find((reward) => {
    const meta = parseCouponMeta(reward.description)
    if (!meta) return false
    return meta.code.toLowerCase() === code.toLowerCase()
  })

  if (!match) return { ok: false, error: "Cupón inválido" }

  const meta = parseCouponMeta(match.description)
  if (!meta) return { ok: false, error: "Cupón inválido" }

  if (!meta.applyAllServices && !meta.serviceIds.includes(params.serviceId)) {
    return { ok: false, error: "Cupón no aplicable a este servicio" }
  }

  if (
    match.maxRedemptions !== null &&
    match.currentRedemptions >= match.maxRedemptions
  ) {
    return { ok: false, error: "Cupón agotado" }
  }

  if (match.type !== "discount_percent" && match.type !== "discount_fixed") {
    return { ok: false, error: "Cupón inválido" }
  }

  const type = match.type as CouponDiscountType

  // service.price is in whole MXN (BigInt). Reward.value is % (1-100) for percent
  // and cents for fixed (wizard does Math.round(parsedDiscountValue * 100)).
  const rawDiscount =
    type === "discount_percent"
      ? params.servicePrice * (match.value / 100)
      : match.value / 100

  const capped = Math.min(rawDiscount, params.servicePrice)
  const discountAmount = Math.round(capped * 100) / 100
  if (discountAmount <= 0) {
    return { ok: false, error: "Cupón sin valor aplicable" }
  }

  return {
    ok: true,
    coupon: {
      rewardId: match.id,
      code: meta.code,
      type,
      discountAmount,
      label: `Cupón ${meta.code}`,
    },
  }
}

export async function incrementCouponRedemption(rewardId: string) {
  await db.loyaltyReward.update({
    where: { id: rewardId },
    data: { currentRedemptions: { increment: 1 } },
  })
}
