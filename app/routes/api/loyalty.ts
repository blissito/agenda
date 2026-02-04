import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import {
  awardPoints,
  adjustPoints,
  redeemReward,
  useRedemption,
  createReward,
  updateReward,
  getRewards,
  getTransactions,
  getOrgLoyaltyStats,
  getCustomerLoyalty,
  getCustomerRedemptions,
} from "~/lib/loyalty.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  if (!org) throw new Response("Org not found", { status: 404 });

  const url = new URL(request.url);
  const intent = url.searchParams.get("intent");

  // GET /api/loyalty?intent=stats
  if (intent === "stats") {
    return getOrgLoyaltyStats(org.id);
  }

  // GET /api/loyalty?intent=rewards
  if (intent === "rewards") {
    return getRewards(org.id);
  }

  // GET /api/loyalty?intent=transactions&limit=50
  if (intent === "transactions") {
    const limit = Number(url.searchParams.get("limit")) || 50;
    return getTransactions({ orgId: org.id, limit });
  }

  // GET /api/loyalty?intent=customer&customerId=xxx
  if (intent === "customer") {
    const customerId = url.searchParams.get("customerId");
    if (!customerId) return Response.json({ error: "customerId required" }, { status: 400 });
    const [loyalty, redemptions] = await Promise.all([
      getCustomerLoyalty(customerId),
      getCustomerRedemptions(customerId),
    ]);
    return { loyalty, redemptions };
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  if (!org) throw new Response("Org not found", { status: 404 });

  const url = new URL(request.url);
  const intent = url.searchParams.get("intent");
  const formData = await request.formData();
  const data = JSON.parse((formData.get("data") as string) || "{}");

  // POST /api/loyalty?intent=award
  if (intent === "award") {
    const { customerId, eventId, basePoints } = data;
    if (!customerId || !eventId || basePoints == null) {
      return Response.json({ error: "customerId, eventId, basePoints required" }, { status: 400 });
    }
    return awardPoints({ customerId, orgId: org.id, eventId, basePoints });
  }

  // POST /api/loyalty?intent=adjust
  if (intent === "adjust") {
    const { customerId, points, reason } = data;
    if (!customerId || points == null || !reason) {
      return Response.json({ error: "customerId, points, reason required" }, { status: 400 });
    }
    return adjustPoints({ customerId, orgId: org.id, points, reason });
  }

  // POST /api/loyalty?intent=redeem
  if (intent === "redeem") {
    const { customerId, rewardId } = data;
    if (!customerId || !rewardId) {
      return Response.json({ error: "customerId, rewardId required" }, { status: 400 });
    }
    return redeemReward({ customerId, orgId: org.id, rewardId });
  }

  // POST /api/loyalty?intent=use-code
  if (intent === "use-code") {
    const { code } = data;
    if (!code) return Response.json({ error: "code required" }, { status: 400 });
    return useRedemption(code);
  }

  // POST /api/loyalty?intent=create-reward
  if (intent === "create-reward") {
    const { name, description, type, value, pointsCost, minTier, maxRedemptions } = data;
    if (!name || !type || value == null || pointsCost == null) {
      return Response.json({ error: "name, type, value, pointsCost required" }, { status: 400 });
    }
    return createReward({ orgId: org.id, name, description, type, value, pointsCost, minTier, maxRedemptions });
  }

  // POST /api/loyalty?intent=update-reward
  if (intent === "update-reward") {
    const { rewardId, ...updates } = data;
    if (!rewardId) return Response.json({ error: "rewardId required" }, { status: 400 });
    return updateReward(rewardId, updates);
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 });
};
