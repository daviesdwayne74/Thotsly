/**
 * Creator Tier System
 * 5 tiers based on monthly earnings thresholds
 * High earners pay lowest fees, new creators pay highest
 */

export type CreatorTier = "tier_1" | "tier_2" | "tier_3" | "tier_4" | "tier_5";

export interface TierInfo {
  tier: CreatorTier;
  name: string;
  minEarnings: number; // in cents
  platformFeePercentage: number;
  creatorEarningsPercentage: number;
  description: string;
}

/**
 * 5-tier system based on monthly earnings only
 * Tier 1: $50,000+/month = 10% fee
 * Tier 5: $0+/month = 20% fee
 */
export const TIER_THRESHOLDS: Record<CreatorTier, TierInfo> = {
  tier_1: {
    tier: "tier_1",
    name: "Tier 1 - Elite Earner",
    minEarnings: 5000000, // $50,000/month in cents
    platformFeePercentage: 10,
    creatorEarningsPercentage: 90,
    description: "$50,000+ monthly earnings",
  },

  tier_2: {
    tier: "tier_2",
    name: "Tier 2 - High Earner",
    minEarnings: 2500000, // $25,000/month in cents
    platformFeePercentage: 12,
    creatorEarningsPercentage: 88,
    description: "$25,000+ monthly earnings",
  },

  tier_3: {
    tier: "tier_3",
    name: "Tier 3 - Growing Creator",
    minEarnings: 1000000, // $10,000/month in cents
    platformFeePercentage: 14,
    creatorEarningsPercentage: 86,
    description: "$10,000+ monthly earnings",
  },

  tier_4: {
    tier: "tier_4",
    name: "Tier 4 - Emerging Creator",
    minEarnings: 250000, // $2,500/month in cents
    platformFeePercentage: 16,
    creatorEarningsPercentage: 84,
    description: "$2,500+ monthly earnings",
  },

  tier_5: {
    tier: "tier_5",
    name: "Tier 5 - New Creator",
    minEarnings: 0,
    platformFeePercentage: 20,
    creatorEarningsPercentage: 80,
    description: "All new creators start here",
  },
};

/**
 * Determine creator tier based on monthly earnings only
 */
export function determineCreatorTier(monthlyEarnings: number): CreatorTier {
  if (monthlyEarnings >= TIER_THRESHOLDS.tier_1.minEarnings) {
    return "tier_1";
  }

  if (monthlyEarnings >= TIER_THRESHOLDS.tier_2.minEarnings) {
    return "tier_2";
  }

  if (monthlyEarnings >= TIER_THRESHOLDS.tier_3.minEarnings) {
    return "tier_3";
  }

  if (monthlyEarnings >= TIER_THRESHOLDS.tier_4.minEarnings) {
    return "tier_4";
  }

  return "tier_5";
}

/**
 * Get tier info
 */
export function getTierInfo(tier: CreatorTier): TierInfo {
  return TIER_THRESHOLDS[tier];
}

/**
 * Get all tiers
 */
export function getAllTiers(): TierInfo[] {
  return Object.values(TIER_THRESHOLDS);
}

/**
 * Get creator's current tier
 */
export function getCreatorTierInfo(monthlyEarnings: number): TierInfo {
  const tier = determineCreatorTier(monthlyEarnings);
  return getTierInfo(tier);
}

/**
 * Calculate creator earnings based on tier
 */
export function calculateCreatorEarnings(amount: number, tier: CreatorTier): number {
  const tierInfo = getTierInfo(tier);
  return (amount * tierInfo.creatorEarningsPercentage) / 100;
}

/**
 * Calculate platform earnings based on tier
 */
export function calculatePlatformEarnings(amount: number, tier: CreatorTier): number {
  const tierInfo = getTierInfo(tier);
  return (amount * tierInfo.platformFeePercentage) / 100;
}

/**
 * Check if creator qualifies for elite founding (10% fee locked for life)
 * Elite Founding = Tier 1 ($50,000+/month)
 */
export function checkEliteFoundingQualification(monthlyEarnings: number): boolean {
  return monthlyEarnings >= TIER_THRESHOLDS.tier_1.minEarnings;
}

