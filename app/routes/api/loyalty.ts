import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import {
  adjustPoints,
  awardPoints,
  createLevel,
  createReward,
  deleteLevel,
  deleteReward,
  getCustomerLoyalty,
  getCustomerRedemptions,
  getLevels,
  getOrgLoyaltyStats,
  getRewards,
  getTransactions,
  redeemReward,
  updateLevel,
  updateReward,
  useRedemption,
} from "~/lib/loyalty.server"
import { getPutFileUrl } from "~/utils/lib/tigris.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")

  if (intent === "stats") {
    return getOrgLoyaltyStats(org.id)
  }

  if (intent === "levels") {
    return getLevels(org.id)
  }

  if (intent === "level-upload-url") {
    const key = `loyalty-levels/${org.id}/${Date.now()}`
    const putUrl = await getPutFileUrl(key)
    return { putUrl, key }
  }

  if (intent === "rewards") {
    return getRewards(org.id)
  }

  if (intent === "transactions") {
    const limit = Number(url.searchParams.get("limit")) || 50
    return getTransactions({ orgId: org.id, limit })
  }

  if (intent === "customer") {
    const customerId = url.searchParams.get("customerId")
    if (!customerId)
      return Response.json({ error: "customerId required" }, { status: 400 })
    const [loyalty, redemptions] = await Promise.all([
      getCustomerLoyalty(customerId),
      getCustomerRedemptions(customerId),
    ])
    return { loyalty, redemptions }
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")
  const formData = await request.formData()
  const data = JSON.parse((formData.get("data") as string) || "{}")

  // ==================== LEVELS ====================

  if (intent === "create-level") {
    const { name, image, minPoints, discountPercent, serviceIds } = data
    if (!name || minPoints == null || discountPercent == null) {
      return Response.json(
        { error: "name, minPoints, discountPercent required" },
        { status: 400 },
      )
    }
    const numMinPoints = Number(minPoints)
    const numDiscountPercent = Number(discountPercent)
    if (Number.isNaN(numMinPoints))
      return Response.json(
        { error: "minPoints must be a number" },
        { status: 400 },
      )
    if (Number.isNaN(numDiscountPercent))
      return Response.json(
        { error: "discountPercent must be a number" },
        { status: 400 },
      )
    if (numMinPoints < 0)
      return Response.json({ error: "minPoints must be >= 0" }, { status: 400 })
    if (numDiscountPercent < 0 || numDiscountPercent > 100)
      return Response.json(
        { error: "discountPercent must be between 0 and 100" },
        { status: 400 },
      )

    return createLevel({
      orgId: org.id,
      name,
      image,
      minPoints: numMinPoints,
      discountPercent: numDiscountPercent,
      serviceIds: serviceIds ?? [],
    })
  }

  if (intent === "update-level") {
    const { levelId, ...updates } = data
    if (!levelId)
      return Response.json({ error: "levelId required" }, { status: 400 })
    return updateLevel(levelId, updates)
  }

  if (intent === "delete-level") {
    const { levelId } = data
    if (!levelId)
      return Response.json({ error: "levelId required" }, { status: 400 })
    return deleteLevel(levelId)
  }

  // ==================== POINTS ====================

  if (intent === "award") {
    const { customerId, eventId, basePoints } = data
    if (!customerId || !eventId || basePoints == null) {
      return Response.json(
        { error: "customerId, eventId, basePoints required" },
        { status: 400 },
      )
    }
    const numBasePoints = Number(basePoints)
    if (Number.isNaN(numBasePoints) || numBasePoints <= 0) {
      return Response.json(
        { error: "basePoints must be a positive number" },
        { status: 400 },
      )
    }
    return awardPoints({
      customerId,
      orgId: org.id,
      eventId,
      basePoints: numBasePoints,
    })
  }

  if (intent === "adjust") {
    const { customerId, points, reason } = data
    if (!customerId || points == null || !reason) {
      return Response.json(
        { error: "customerId, points, reason required" },
        { status: 400 },
      )
    }
    const numPoints = Number(points)
    if (Number.isNaN(numPoints)) {
      return Response.json(
        { error: "points must be a number" },
        { status: 400 },
      )
    }
    return adjustPoints({
      customerId,
      orgId: org.id,
      points: numPoints,
      reason,
    })
  }

  // ==================== REWARDS ====================

  if (intent === "redeem") {
    const { customerId, rewardId } = data
    if (!customerId || !rewardId) {
      return Response.json(
        { error: "customerId, rewardId required" },
        { status: 400 },
      )
    }
    return redeemReward({ customerId, orgId: org.id, rewardId })
  }

  if (intent === "use-code") {
    // Auth already checked above (getUserAndOrgOrRedirect)
    const { code } = data
    if (!code) return Response.json({ error: "code required" }, { status: 400 })
    return useRedemption(code)
  }

  if (intent === "create-reward") {
    const { name, description, type, value, pointsCost, maxRedemptions } = data
    if (!name || !type || value == null || pointsCost == null) {
      return Response.json(
        { error: "name, type, value, pointsCost required" },
        { status: 400 },
      )
    }
    const numValue = Number(value)
    const numPointsCost = Number(pointsCost)
    if (Number.isNaN(numValue) || numValue <= 0) {
      return Response.json(
        { error: "value must be a positive number" },
        { status: 400 },
      )
    }
    if (Number.isNaN(numPointsCost) || numPointsCost <= 0) {
      return Response.json(
        { error: "pointsCost must be a positive number" },
        { status: 400 },
      )
    }
    if (type === "discount_percent" && numValue > 100) {
      return Response.json(
        { error: "discount_percent value must be <= 100" },
        { status: 400 },
      )
    }
    return createReward({
      orgId: org.id,
      name,
      description,
      type,
      value: numValue,
      pointsCost: numPointsCost,
      maxRedemptions,
    })
  }

  if (intent === "update-reward") {
    const { rewardId, ...updates } = data
    if (!rewardId)
      return Response.json({ error: "rewardId required" }, { status: 400 })
    return updateReward(rewardId, updates)
  }

  if (intent === "delete-reward") {
    const { rewardId } = data
    if (!rewardId)
      return Response.json({ error: "rewardId required" }, { status: 400 })
    return deleteReward(rewardId)
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}
