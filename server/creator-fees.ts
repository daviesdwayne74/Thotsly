/**
 * Creator Fee Tier Management
 * Handles creator fee tier calculation, assignment, and monthly recalculation
 * All creators start at 20% platform fee (80% creator earnings)
 * Tiers are recalculated monthly based on earnings
 * Elite Founding Status is admin-only and locked at 10% for life
 */

import { getDb } from "./db";
import { creatorProfiles, transactions } from "../drizzle/schema";
import { eq, and, gte } from "drizzle-orm";

export interface CreatorFeeStructure {
  tier: number;
  monthlyEarningsThreshold: number;
  platformFeePercentage: number;
  creatorEarningsPercentage: number;
  description: string;
}

export interface CreatorFeeInfo {
  creatorId: string;
  currentTier: number;
  tierName: string;
  platformFeePercentage: number;
  creatorEarningsPercentage: number;
  monthlyEarnings: number;
  isEliteFounding: boolean;
  lastRecalculatedAt: Date;
}

/**
 * Fee tier structure
 * All creators start at Tier 5 (20% platform fee)
 * Tiers are recalculated monthly based on earnings
 */
export const FEE_TIERS: CreatorFeeStructure[] = [
  {
    tier: 1,
    monthlyEarningsThreshold: 50000 * 100, // $50,000
    platformFeePercentage: 10,
    creatorEarningsPercentage: 90,
    description: "Top Tier - $50k+/month",
  },
  {
    tier: 2,
    monthlyEarningsThreshold: 25000 * 100, // $25,000
    platformFeePercentage: 12,
    creatorEarningsPercentage: 88,
    description: "Tier 2 - $25k+/month",
  },
  {
    tier: 3,
    monthlyEarningsThreshold: 10000 * 100, // $10,000
    platformFeePercentage: 14,
    creatorEarningsPercentage: 86,
    description: "Tier 3 - $10k+/month",
  },
  {
    tier: 4,
    monthlyEarningsThreshold: 2500 * 100, // $2,500
    platformFeePercentage: 16,
    creatorEarningsPercentage: 84,
    description: "Tier 4 - $2.5k+/month",
  },
  {
    tier: 5,
    monthlyEarningsThreshold: 0, // Default tier for all new creators
    platformFeePercentage: 20,
    creatorEarningsPercentage: 80,
    description: "Tier 5 - New Creators (Default)",
  },
];

/**
 * Elite Founding Status (admin-only)
 * Locked at 10% platform fee for life
 */
export const ELITE_FOUNDING_FEE = {
  platformFeePercentage: 10,
  creatorEarningsPercentage: 90,
  description: "Elite Founding Status - 10% fee locked for life",
};

/**
 * Get creator's current fee tier
 */
export function getCreatorFeeTier(monthlyEarningsInCents: number): CreatorFeeStructure {
  // Find the highest tier the creator qualifies for
  for (const tier of FEE_TIERS) {
    if (monthlyEarningsInCents >= tier.monthlyEarningsThreshold) {
      return tier;
    }
  }

  // Default to Tier 5 if no threshold is met
  return FEE_TIERS[FEE_TIERS.length - 1];
}

/**
 * Calculate creator's monthly earnings
 * Looks at transactions from the current month
 */
export async function calculateMonthlyEarnings(creatorId: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    // Get current month start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get all completed transactions for this creator this month
    const monthlyTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.creatorId, creatorId),
          eq(transactions.status, "completed")
        )
      );

    // Filter by date in code since Drizzle has issues with date comparisons
    const filtered = monthlyTransactions.filter((tx) => {
      const txDate = tx.createdAt || new Date();
      return txDate >= monthStart && txDate <= monthEnd;
    });

    // Calculate total earnings (amount minus platform fee)
    let totalEarnings = 0;
    for (const tx of filtered) {
      const creatorEarnings = tx.amount - (tx.platformFee || 0);
      totalEarnings += creatorEarnings;
    }

    return totalEarnings;
  } catch (error) {
    console.error("[Creator Fees] Error calculating monthly earnings:", error);
    return 0;
  }
}

/**
 * Get creator's current fee information
 */
export async function getCreatorFeeInfo(creatorId: string): Promise<CreatorFeeInfo> {
  const db = await getDb();
  if (!db) {
    return {
      creatorId,
      currentTier: 5,
      tierName: FEE_TIERS[FEE_TIERS.length - 1].description,
      platformFeePercentage: 20,
      creatorEarningsPercentage: 80,
      monthlyEarnings: 0,
      isEliteFounding: false,
      lastRecalculatedAt: new Date(),
    };
  }

  try {
    const creator = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, creatorId)).limit(1);

    if (!creator[0]) {
      throw new Error("Creator not found");
    }

    // Check if creator has elite founding status
    const isEliteFounding = creator[0].isEliteFounding || false;

    if (isEliteFounding) {
      return {
        creatorId,
        currentTier: 1, // Elite is equivalent to Tier 1
        tierName: ELITE_FOUNDING_FEE.description,
        platformFeePercentage: ELITE_FOUNDING_FEE.platformFeePercentage,
        creatorEarningsPercentage: ELITE_FOUNDING_FEE.creatorEarningsPercentage,
        monthlyEarnings: 0,
        isEliteFounding: true,
        lastRecalculatedAt: creator[0].createdAt || new Date(),
      };
    }

    // Calculate monthly earnings
    const monthlyEarnings = await calculateMonthlyEarnings(creatorId);

    // Determine tier based on monthly earnings
    const feeTier = getCreatorFeeTier(monthlyEarnings);

    return {
      creatorId,
      currentTier: feeTier.tier,
      tierName: feeTier.description,
      platformFeePercentage: feeTier.platformFeePercentage,
      creatorEarningsPercentage: feeTier.creatorEarningsPercentage,
      monthlyEarnings,
      isEliteFounding: false,
      lastRecalculatedAt: new Date(),
    };
  } catch (error) {
    console.error("[Creator Fees] Error getting creator fee info:", error);
    return {
      creatorId,
      currentTier: 5,
      tierName: FEE_TIERS[FEE_TIERS.length - 1].description,
      platformFeePercentage: 20,
      creatorEarningsPercentage: 80,
      monthlyEarnings: 0,
      isEliteFounding: false,
      lastRecalculatedAt: new Date(),
    };
  }
}

/**
 * Recalculate all creator fee tiers for the month
 * Should be called once per month (e.g., on the 1st of each month)
 */
export async function recalculateAllCreatorTiers(): Promise<{
  totalCreators: number;
  tiersUpdated: number;
  results: Array<{
    creatorId: string;
    newTier: number;
    monthlyEarnings: number;
    platformFeePercentage: number;
  }>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalCreators: 0,
      tiersUpdated: 0,
      results: [],
    };
  }

  try {
    const creators = await db.select().from(creatorProfiles);
    const results = [];

    for (const creator of creators) {
      // Skip elite founding creators - their tier is locked
      if (creator.isEliteFounding) {
        continue;
      }

      const monthlyEarnings = await calculateMonthlyEarnings(creator.id);
      const feeTier = getCreatorFeeTier(monthlyEarnings);

      results.push({
        creatorId: creator.id,
        newTier: feeTier.tier,
        monthlyEarnings,
        platformFeePercentage: feeTier.platformFeePercentage,
      });
    }

    return {
      totalCreators: creators.length,
      tiersUpdated: results.length,
      results,
    };
  } catch (error) {
    console.error("[Creator Fees] Error recalculating creator tiers:", error);
    return {
      totalCreators: 0,
      tiersUpdated: 0,
      results: [],
    };
  }
}

/**
 * Grant elite founding status to a creator (admin only)
 */
export async function grantEliteFounding(creatorId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(creatorProfiles)
      .set({ isEliteFounding: true })
      .where(eq(creatorProfiles.id, creatorId));

    return true;
  } catch (error) {
    console.error("[Creator Fees] Error granting elite founding status:", error);
    return false;
  }
}

/**
 * Get all creators and their current tiers
 */
export async function getAllCreatorTiers(): Promise<CreatorFeeInfo[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const creators = await db.select().from(creatorProfiles);
    const results = [];

    for (const creator of creators) {
      const feeInfo = await getCreatorFeeInfo(creator.id);
      results.push(feeInfo);
    }

    return results;
  } catch (error) {
    console.error("[Creator Fees] Error getting all creator tiers:", error);
    return [];
  }
}

export default {
  FEE_TIERS,
  ELITE_FOUNDING_FEE,
  getCreatorFeeTier,
  calculateMonthlyEarnings,
  getCreatorFeeInfo,
  recalculateAllCreatorTiers,
  grantEliteFounding,
  getAllCreatorTiers,
};

