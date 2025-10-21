/**
 * THOTSLY Revenue Split Configuration
 * Defines how revenue is split between creators and the platform
 */

export const REVENUE_SPLITS = {
  // Live Streaming: 80% creator, 20% platform
  LIVE_STREAMING: {
    creatorPercentage: 80,
    platformPercentage: 20,
    description: "Live streaming revenue split",
  },

  // Tips: 80% creator, 20% platform
  TIPS: {
    creatorPercentage: 80,
    platformPercentage: 20,
    description: "Direct tips from fans to creators",
  },

  // Pay-Per-View: 80% creator, 20% platform
  PPV: {
    creatorPercentage: 80,
    platformPercentage: 20,
    description: "Pay-per-view exclusive content",
  },

  // Subscriptions: 80% creator, 20% platform
  SUBSCRIPTIONS: {
    creatorPercentage: 80,
    platformPercentage: 20,
    description: "Monthly subscription revenue",
  },

  // Merch: 90% creator, 10% platform
  MERCH: {
    creatorPercentage: 90,
    platformPercentage: 10,
    description: "Merchandise sales commission",
  },

  // Stories: 80% creator, 20% platform
  STORIES: {
    creatorPercentage: 80,
    platformPercentage: 20,
    description: "24-hour ephemeral content",
  },

  // Content Bundles: 80% creator, 20% platform
  CONTENT_BUNDLES: {
    creatorPercentage: 80,
    platformPercentage: 20,
    description: "Multiple posts sold as bundle",
  },

  // Exclusive Content: 80% creator, 20% platform
  EXCLUSIVE_CONTENT: {
    creatorPercentage: 80,
    platformPercentage: 20,
    description: "Exclusive creator content packages",
  },
};

/**
 * Calculate creator earnings from transaction amount
 */
export function calculateCreatorEarnings(
  amount: number,
  type: keyof typeof REVENUE_SPLITS
): number {
  const split = REVENUE_SPLITS[type];
  return (amount * split.creatorPercentage) / 100;
}

/**
 * Calculate platform earnings from transaction amount
 */
export function calculatePlatformEarnings(
  amount: number,
  type: keyof typeof REVENUE_SPLITS
): number {
  const split = REVENUE_SPLITS[type];
  return (amount * split.platformPercentage) / 100;
}

/**
 * Get revenue split details
 */
export function getRevenueSplit(type: keyof typeof REVENUE_SPLITS) {
  return REVENUE_SPLITS[type];
}

/**
 * Validate revenue split (ensure it adds to 100%)
 */
export function validateRevenueSplit(creatorPct: number, platformPct: number): boolean {
  return creatorPct + platformPct === 100 && creatorPct > 0 && platformPct > 0;
}

/**
 * Get all revenue splits summary
 */
export function getAllRevenueSplits() {
  return Object.entries(REVENUE_SPLITS).map(([key, value]) => ({
    type: key,
    ...value,
  }));
}

