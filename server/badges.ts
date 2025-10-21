/**
 * Creator Badge System
 * Only Verified and Elite Founding badges
 */

export type BadgeType = "verified" | "elite_founding";

export interface Badge {
  id: BadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
}

export const BADGES: Record<BadgeType, Badge> = {
  verified: {
    id: "verified",
    name: "Verified",
    description: "Identity verified creator",
    icon: "✓",
    color: "text-blue-500",
    requirement: "Passed government ID verification",
  },

  elite_founding: {
    id: "elite_founding",
    name: "Elite Founding Creator",
    description: "One of 10 exclusive founding creators with 10% fee locked for life",
    icon: "⭐",
    color: "text-yellow-500",
    requirement: "$500+/month earnings + 80%+ subscription rate",
  },
};

/**
 * Check if creator qualifies for a badge
 */
export function checkBadgeQualification(
  badgeType: BadgeType,
  monthlyEarnings: number,
  subscriptionRate: number,
  isVerified: boolean,
  isEliteFounder: boolean
): boolean {
  switch (badgeType) {
    case "verified":
      return isVerified;

    case "elite_founding":
      return isEliteFounder;

    default:
      return false;
  }
}

/**
 * Get all badges for a creator
 */
export function getCreatorBadges(
  monthlyEarnings: number,
  subscriptionRate: number,
  isVerified: boolean,
  isEliteFounder: boolean
): BadgeType[] {
  const badges: BadgeType[] = [];

  if (isVerified) badges.push("verified");
  if (isEliteFounder) badges.push("elite_founding");

  return badges;
}

/**
 * Get badge details
 */
export function getBadge(badgeType: BadgeType): Badge {
  return BADGES[badgeType];
}

/**
 * Get all available badges
 */
export function getAllBadges(): Badge[] {
  return Object.values(BADGES);
}

