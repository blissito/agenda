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
    return createLevel({
      orgId: org.id,
      name,
      image,
      minPoints: Number(minPoints),
      discountPercent: Number(discountPercent),
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
    return awardPoints({ customerId, orgId: org.id, eventId, basePoints })
  }

  if (intent === "adjust") {
    const { customerId, points, reason } = data
    if (!customerId || points == null || !reason) {
      return Response.json(
        { error: "customerId, points, reason required" },
        { status: 400 },
      )
    }
    return adjustPoints({ customerId, orgId: org.id, points, reason })
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
    return createReward({
      orgId: org.id,
      name,
      description,
      type,
      value,
      pointsCost,
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
