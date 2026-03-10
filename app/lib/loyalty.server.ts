import { db } from "~/utils/db.server";
import { nanoid } from "nanoid";

// ==================== CONFIG ====================

const FIRST_VISIT_BONUS = 50;
const REDEMPTION_EXPIRY_DAYS = 30;

// ==================== LEVEL CRUD ====================

export async function getLevels(orgId: string) {
  return db.loyaltyLevel.findMany({
    where: { orgId },
    orderBy: { minPoints: "asc" },
  });
}

export async function createLevel(data: {
  orgId: string;
  name: string;
  image?: string;
  minPoints: number;
  discountPercent: number;
  serviceIds: string[];
}) {
  // Auto-set order based on existing count
  const count = await db.loyaltyLevel.count({ where: { orgId: data.orgId } });
  return db.loyaltyLevel.create({
    data: { ...data, order: count },
  });
}

export async function updateLevel(
  levelId: string,
  data: Partial<{
    name: string;
    image: string | null;
    minPoints: number;
    discountPercent: number;
    serviceIds: string[];
    order: number;
  }>
) {
  return db.loyaltyLevel.update({ where: { id: levelId }, data });
}

export async function deleteLevel(levelId: string) {
  // Check if customers are at this level
  const customers = await db.customer.count({ where: { loyaltyLevelId: levelId } });
  if (customers > 0) {
    return { error: `No se puede eliminar: ${customers} cliente(s) tienen este nivel. Reasígnalos primero.` };
  }
  await db.loyaltyLevel.delete({ where: { id: levelId } });
  return { success: true };
}

// ==================== LEVEL LOGIC ====================

/**
 * Determine which level a customer qualifies for based on totalEarned points.
 * Returns the highest level whose minPoints <= totalEarned, or null if no levels exist.
 */
export async function getLevelForPoints(orgId: string, totalEarned: number) {
  const levels = await db.loyaltyLevel.findMany({
    where: { orgId },
    orderBy: { minPoints: "desc" },
  });
  return levels.find((l) => totalEarned >= l.minPoints) ?? null;
}

/**
 * Get the discount applicable for a customer's level on a specific service.
 * Returns { discountPercent, levelName } or null.
 */
export async function getLevelDiscount(params: { customerId: string; serviceId: string }) {
  const customer = await db.customer.findUnique({
    where: { id: params.customerId },
    select: { loyaltyLevelId: true },
  });
  if (!customer?.loyaltyLevelId) return null;

  const level = await db.loyaltyLevel.findUnique({
    where: { id: customer.loyaltyLevelId },
  });
  if (!level) return null;

  // Empty serviceIds = applies to all services
  if (level.serviceIds.length > 0 && !level.serviceIds.includes(params.serviceId)) {
    return null;
  }

  return { discountPercent: level.discountPercent, levelName: level.name };
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
    select: { loyaltyPoints: true, loyaltyTotalEarned: true, loyaltyLevelId: true },
  });
  if (!customer) throw new Error("Customer not found");

  // Check if first visit (no previous transactions)
  const prevTx = await db.loyaltyTransaction.findFirst({
    where: { customerId, orgId, type: "earn" },
  });
  const isFirstVisit = !prevTx;

  let earnedPoints = basePoints;

  // Add first visit bonus
  if (isFirstVisit) {
    earnedPoints += FIRST_VISIT_BONUS;
  }

  const newBalance = (customer.loyaltyPoints ?? 0) + earnedPoints;
  const newTotalEarned = (customer.loyaltyTotalEarned ?? 0) + earnedPoints;

  // Recalculate level
  const newLevel = await getLevelForPoints(orgId, newTotalEarned);
  const levelUpgrade = newLevel?.id !== customer.loyaltyLevelId;

  const [updatedCustomer, transaction] = await db.$transaction([
    db.customer.update({
      where: { id: customerId },
      data: {
        loyaltyPoints: newBalance,
        loyaltyTotalEarned: newTotalEarned,
        loyaltyLevelId: newLevel?.id ?? null,
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
        metadata: { basePoints, isFirstVisit },
      },
    }),
  ]);

  return { customer: updatedCustomer, transaction, levelUpgrade };
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
  if ((customer.loyaltyPoints ?? 0) < points) throw new Error("Insufficient points");

  const newBalance = (customer.loyaltyPoints ?? 0) - points;

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

  const newBalance = (customer.loyaltyPoints ?? 0) + points;
  if (newBalance < 0) throw new Error("Adjustment would result in negative balance");

  const newTotalEarned = points > 0
    ? (customer.loyaltyTotalEarned ?? 0) + points
    : (customer.loyaltyTotalEarned ?? 0);

  const newLevel = await getLevelForPoints(orgId, newTotalEarned);

  const [updatedCustomer, transaction] = await db.$transaction([
    db.customer.update({
      where: { id: customerId },
      data: {
        loyaltyPoints: newBalance,
        loyaltyTotalEarned: newTotalEarned,
        loyaltyLevelId: newLevel?.id ?? null,
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
 * Get active rewards for an org (for customers)
 */
export async function getRewards(orgId: string) {
  const allRewards = await db.loyaltyReward.findMany({
    where: { orgId, isActive: true },
    orderBy: { pointsCost: "asc" },
  });

  return allRewards.filter(
    (r) => r.maxRedemptions === null || r.currentRedemptions < r.maxRedemptions
  );
}

/**
 * Get all rewards for an org (for admin dashboard, includes inactive)
 */
export async function getAllRewards(orgId: string) {
  return db.loyaltyReward.findMany({
    where: { orgId },
    orderBy: [{ isActive: "desc" }, { pointsCost: "asc" }],
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
      select: { loyaltyPoints: true },
    }),
    db.loyaltyReward.findUnique({ where: { id: rewardId } }),
  ]);

  if (!customer) throw new Error("Customer not found");
  if (!reward) throw new Error("Reward not found");
  if (!reward.isActive) throw new Error("Reward not active");
  if (reward.orgId !== orgId) throw new Error("Reward not available for this org");
  if ((customer.loyaltyPoints ?? 0) < reward.pointsCost) throw new Error("Insufficient points");

  if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
    throw new Error("Reward no longer available");
  }

  const newBalance = (customer.loyaltyPoints ?? 0) - reward.pointsCost;
  const code = nanoid(8).toUpperCase();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REDEMPTION_EXPIRY_DAYS);

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
        transactionId: "",
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
      loyaltyLevelId: true,
      orgId: true,
    },
  });
  if (!customer) return null;

  const [currentLevel, levels] = await Promise.all([
    customer.loyaltyLevelId
      ? db.loyaltyLevel.findUnique({ where: { id: customer.loyaltyLevelId } })
      : null,
    db.loyaltyLevel.findMany({
      where: { orgId: customer.orgId },
      orderBy: { minPoints: "asc" },
    }),
  ]);

  const currentMinPoints = currentLevel?.minPoints ?? -1;
  const nextLevel = levels.find((l) => l.minPoints > currentMinPoints) ?? null;

  return {
    points: customer.loyaltyPoints ?? 0,
    totalEarned: customer.loyaltyTotalEarned ?? 0,
    currentLevel,
    nextLevel,
    pointsToNextLevel: nextLevel
      ? nextLevel.minPoints - (customer.loyaltyTotalEarned ?? 0)
      : null,
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
    type: "discount_percent" | "discount_fixed" | "free_service";
    value: number;
    pointsCost: number;
    isActive: boolean;
    maxRedemptions: number | null;
  }>
) {
  return db.loyaltyReward.update({ where: { id: rewardId }, data });
}

/**
 * Delete a reward (only if no redemptions exist)
 */
export async function deleteReward(rewardId: string) {
  const redemptions = await db.loyaltyRedemption.count({
    where: { rewardId },
  });

  if (redemptions > 0) {
    return { error: "No se puede eliminar una recompensa con canjes. Desactivala en su lugar." };
  }

  await db.loyaltyReward.delete({ where: { id: rewardId } });
  return { success: true };
}

/**
 * Get org loyalty stats
 */
export async function getOrgLoyaltyStats(orgId: string) {
  const [totalCustomers, levelCounts, recentTransactions, activeRewards, levels] = await Promise.all([
    db.customer.count({ where: { orgId, loyaltyTotalEarned: { gt: 0 } } }),
    db.customer.groupBy({
      by: ["loyaltyLevelId"],
      where: { orgId },
      _count: true,
    }),
    db.loyaltyTransaction.count({
      where: { orgId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    db.loyaltyReward.count({ where: { orgId, isActive: true } }),
    db.loyaltyLevel.findMany({ where: { orgId }, orderBy: { minPoints: "asc" } }),
  ]);

  // Build level breakdown: { levelId: count, ... }
  const levelBreakdown: Record<string, number> = {};
  for (const entry of levelCounts) {
    const key = entry.loyaltyLevelId ?? "sin_nivel";
    levelBreakdown[key] = entry._count;
  }

  return {
    totalCustomers,
    levelBreakdown,
    levels,
    transactionsLast30Days: recentTransactions,
    activeRewards,
  };
}
