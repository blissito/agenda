import { db } from "~/utils/db.server";
import { nanoid } from "nanoid";

// ==================== TYPES ====================

export type Tier = "bronze" | "silver" | "gold" | "platinum";

export interface TierConfig {
  name: Tier;
  minPoints: number;
  multiplier: number; // Point earning multiplier
}

export interface LoyaltyConfig {
  tiers: TierConfig[];
  firstVisitBonus: number;
  redemptionExpiryDays: number;
}

// ==================== CONFIG ====================

export const LOYALTY_CONFIG: LoyaltyConfig = {
  tiers: [
    { name: "bronze", minPoints: 0, multiplier: 1 },
    { name: "silver", minPoints: 500, multiplier: 1.25 },
    { name: "gold", minPoints: 2000, multiplier: 1.5 },
    { name: "platinum", minPoints: 5000, multiplier: 2 },
  ],
  firstVisitBonus: 50,
  redemptionExpiryDays: 30,
};

// ==================== TIER LOGIC ====================

export function getTierForPoints(totalEarned: number): Tier {
  const tiers = [...LOYALTY_CONFIG.tiers].reverse();
  for (const tier of tiers) {
    if (totalEarned >= tier.minPoints) return tier.name;
  }
  return "bronze";
}

export function getTierConfig(tier: Tier): TierConfig {
  return LOYALTY_CONFIG.tiers.find((t) => t.name === tier) ?? LOYALTY_CONFIG.tiers[0];
}

export function getNextTier(currentTier: Tier): TierConfig | null {
  const idx = LOYALTY_CONFIG.tiers.findIndex((t) => t.name === currentTier);
  return LOYALTY_CONFIG.tiers[idx + 1] ?? null;
}

// ==================== POINT OPERATIONS ====================

/**
 * Award points to a customer for a completed booking
 */
export async function awardPoints(params: {
  customerId: string;
  orgId: string;
  eventId: string;
  basePoints: number;
}) {
  const { customerId, orgId, eventId, basePoints } = params;

  const customer = await db.customer.findUnique({
    where: { id: customerId },
    select: { loyaltyPoints: true, loyaltyTotalEarned: true, loyaltyTier: true },
  });
  if (!customer) throw new Error("Customer not found");

  // Check if first visit (no previous transactions)
  const prevTx = await db.loyaltyTransaction.findFirst({
    where: { customerId, orgId, type: "earn" },
  });
  const isFirstVisit = !prevTx;

  // Calculate points with tier multiplier
  const tierConfig = getTierConfig(customer.loyaltyTier as Tier);
  let earnedPoints = Math.floor(basePoints * tierConfig.multiplier);

  // Add first visit bonus
  if (isFirstVisit) {
    earnedPoints += LOYALTY_CONFIG.firstVisitBonus;
  }

  const newBalance = customer.loyaltyPoints + earnedPoints;
  const newTotalEarned = customer.loyaltyTotalEarned + earnedPoints;
  const newTier = getTierForPoints(newTotalEarned);

  // Update customer and create transaction atomically
  const [updatedCustomer, transaction] = await db.$transaction([
    db.customer.update({
      where: { id: customerId },
      data: {
        loyaltyPoints: newBalance,
        loyaltyTotalEarned: newTotalEarned,
        loyaltyTier: newTier,
      },
    }),
    db.loyaltyTransaction.create({
      data: {
        customerId,
        orgId,
        eventId,
        type: "earn",
        points: earnedPoints,
        balance: newBalance,
        reason: isFirstVisit ? "first_visit_bonus" : "booking_completed",
        metadata: {
          basePoints,
          multiplier: tierConfig.multiplier,
          isFirstVisit,
        },
      },
    }),
  ]);

  return { customer: updatedCustomer, transaction, tierUpgrade: newTier !== customer.loyaltyTier };
}

/**
 * Deduct points for a redemption
 */
export async function deductPoints(params: {
  customerId: string;
  orgId: string;
  points: number;
  reason: string;
}) {
  const { customerId, orgId, points, reason } = params;

  const customer = await db.customer.findUnique({
    where: { id: customerId },
    select: { loyaltyPoints: true },
  });
  if (!customer) throw new Error("Customer not found");
  if (customer.loyaltyPoints < points) throw new Error("Insufficient points");

  const newBalance = customer.loyaltyPoints - points;

  const [updatedCustomer, transaction] = await db.$transaction([
    db.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: newBalance },
    }),
    db.loyaltyTransaction.create({
      data: {
        customerId,
        orgId,
        type: "redeem",
        points: -points,
        balance: newBalance,
        reason,
      },
    }),
  ]);

  return { customer: updatedCustomer, transaction };
}

/**
 * Manual adjustment (admin only)
 */
export async function adjustPoints(params: {
  customerId: string;
  orgId: string;
  points: number;
  reason: string;
}) {
  const { customerId, orgId, points, reason } = params;

  const customer = await db.customer.findUnique({
    where: { id: customerId },
    select: { loyaltyPoints: true, loyaltyTotalEarned: true },
  });
  if (!customer) throw new Error("Customer not found");

  const newBalance = customer.loyaltyPoints + points;
  if (newBalance < 0) throw new Error("Adjustment would result in negative balance");

  const newTotalEarned = points > 0 ? customer.loyaltyTotalEarned + points : customer.loyaltyTotalEarned;
  const newTier = getTierForPoints(newTotalEarned);

  const [updatedCustomer, transaction] = await db.$transaction([
    db.customer.update({
      where: { id: customerId },
      data: {
        loyaltyPoints: newBalance,
        loyaltyTotalEarned: newTotalEarned,
        loyaltyTier: newTier,
      },
    }),
    db.loyaltyTransaction.create({
      data: {
        customerId,
        orgId,
        type: "adjust",
        points,
        balance: newBalance,
        reason,
      },
    }),
  ]);

  return { customer: updatedCustomer, transaction };
}

// ==================== REWARDS ====================

/**
 * Get active rewards for an org
 */
export async function getRewards(orgId: string, customerTier?: Tier) {
  const allRewards = await db.loyaltyReward.findMany({
    where: {
      orgId,
      isActive: true,
    },
    orderBy: { pointsCost: "asc" },
  });

  // Filter out rewards that reached max redemptions
  const rewards = allRewards.filter(
    (r) => r.maxRedemptions === null || r.currentRedemptions < r.maxRedemptions
  );

  if (!customerTier) return rewards;

  // Filter by tier
  const tierOrder: Tier[] = ["bronze", "silver", "gold", "platinum"];
  const customerTierIdx = tierOrder.indexOf(customerTier);

  return rewards.filter((r: { minTier: string | null }) => {
    if (!r.minTier) return true;
    return tierOrder.indexOf(r.minTier as Tier) <= customerTierIdx;
  });
}

/**
 * Redeem a reward
 */
export async function redeemReward(params: { customerId: string; orgId: string; rewardId: string }) {
  const { customerId, orgId, rewardId } = params;

  const [customer, reward] = await Promise.all([
    db.customer.findUnique({
      where: { id: customerId },
      select: { loyaltyPoints: true, loyaltyTier: true },
    }),
    db.loyaltyReward.findUnique({ where: { id: rewardId } }),
  ]);

  if (!customer) throw new Error("Customer not found");
  if (!reward) throw new Error("Reward not found");
  if (!reward.isActive) throw new Error("Reward not active");
  if (reward.orgId !== orgId) throw new Error("Reward not available for this org");
  if (customer.loyaltyPoints < reward.pointsCost) throw new Error("Insufficient points");

  // Check tier requirement
  if (reward.minTier) {
    const tierOrder: Tier[] = ["bronze", "silver", "gold", "platinum"];
    if (tierOrder.indexOf(customer.loyaltyTier as Tier) < tierOrder.indexOf(reward.minTier as Tier)) {
      throw new Error("Tier requirement not met");
    }
  }

  // Check max redemptions
  if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
    throw new Error("Reward no longer available");
  }

  const newBalance = customer.loyaltyPoints - reward.pointsCost;
  const code = nanoid(8).toUpperCase();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + LOYALTY_CONFIG.redemptionExpiryDays);

  const [updatedCustomer, transaction, redemption] = await db.$transaction([
    db.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: newBalance },
    }),
    db.loyaltyTransaction.create({
      data: {
        customerId,
        orgId,
        type: "redeem",
        points: -reward.pointsCost,
        balance: newBalance,
        reason: "redemption",
        metadata: { rewardId, rewardName: reward.name },
      },
    }),
    db.loyaltyRedemption.create({
      data: {
        customerId,
        orgId,
        rewardId,
        transactionId: "", // Will be updated
        code,
        status: "pending",
        expiresAt,
      },
    }),
    db.loyaltyReward.update({
      where: { id: rewardId },
      data: { currentRedemptions: { increment: 1 } },
    }),
  ]);

  // Update transactionId
  await db.loyaltyRedemption.update({
    where: { id: redemption.id },
    data: { transactionId: transaction.id },
  });

  return { customer: updatedCustomer, transaction, redemption: { ...redemption, code } };
}

/**
 * Mark a redemption as used
 */
export async function useRedemption(code: string) {
  const redemption = await db.loyaltyRedemption.findUnique({ where: { code } });

  if (!redemption) throw new Error("Invalid code");
  if (redemption.status === "used") throw new Error("Code already used");
  if (redemption.status === "expired" || redemption.expiresAt < new Date()) {
    throw new Error("Code expired");
  }

  return db.loyaltyRedemption.update({
    where: { id: redemption.id },
    data: { status: "used", usedAt: new Date() },
  });
}

// ==================== QUERIES ====================

/**
 * Get customer loyalty summary
 */
export async function getCustomerLoyalty(customerId: string) {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    select: {
      loyaltyPoints: true,
      loyaltyTotalEarned: true,
      loyaltyTier: true,
    },
  });
  if (!customer) return null;

  const tier = customer.loyaltyTier as Tier;
  const nextTier = getNextTier(tier);
  const tierConfig = getTierConfig(tier);

  return {
    points: customer.loyaltyPoints,
    totalEarned: customer.loyaltyTotalEarned,
    tier,
    tierConfig,
    nextTier,
    pointsToNextTier: nextTier ? nextTier.minPoints - customer.loyaltyTotalEarned : null,
  };
}

/**
 * Get transaction history
 */
export async function getTransactions(params: { customerId?: string; orgId: string; limit?: number }) {
  const { customerId, orgId, limit = 50 } = params;

  return db.loyaltyTransaction.findMany({
    where: {
      orgId,
      ...(customerId && { customerId }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      customer: { select: { displayName: true, email: true } },
    },
  });
}

/**
 * Get customer's redemptions
 */
export async function getCustomerRedemptions(customerId: string) {
  return db.loyaltyRedemption.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: {
      reward: { select: { name: true, type: true, value: true } },
    },
  });
}

// ==================== ADMIN ====================

/**
 * Create a new reward
 */
export async function createReward(data: {
  orgId: string;
  name: string;
  description?: string;
  type: "discount_percent" | "discount_fixed" | "free_service";
  value: number;
  pointsCost: number;
  minTier?: Tier;
  maxRedemptions?: number;
}) {
  return db.loyaltyReward.create({ data });
}

/**
 * Update a reward
 */
export async function updateReward(
  rewardId: string,
  data: Partial<{
    name: string;
    description: string;
    value: number;
    pointsCost: number;
    isActive: boolean;
    minTier: Tier | null;
    maxRedemptions: number | null;
  }>
) {
  return db.loyaltyReward.update({ where: { id: rewardId }, data });
}

/**
 * Get org loyalty stats
 */
export async function getOrgLoyaltyStats(orgId: string) {
  const [totalCustomers, tierCounts, recentTransactions, activeRewards] = await Promise.all([
    db.customer.count({ where: { orgId, loyaltyTotalEarned: { gt: 0 } } }),
    db.customer.groupBy({
      by: ["loyaltyTier"],
      where: { orgId },
      _count: true,
    }),
    db.loyaltyTransaction.count({
      where: { orgId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    db.loyaltyReward.count({ where: { orgId, isActive: true } }),
  ]);

  return {
    totalCustomers,
    tierBreakdown: Object.fromEntries(tierCounts.map((t: { loyaltyTier: string; _count: number }) => [t.loyaltyTier, t._count])),
    transactionsLast30Days: recentTransactions,
    activeRewards,
  };
}
