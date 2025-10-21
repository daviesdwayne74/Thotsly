import { getDb } from "./db";
import { creatorProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Creator Recruitment System
 * Tracks recruitment status, earnings, and performance
 */

export async function trackCreatorPerformance(creatorId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const creator = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.id, creatorId))
      .then(r => r[0]);

    if (!creator) return null;

    return {
      creatorId,
      name: creator.displayName,
      bio: creator.bio,
      earnings: creator.totalEarnings || 0,
      subscribers: creator.totalSubscribers || 0,
      joinedAt: creator.createdAt,
      status: creator.isVerified ? "verified" : "pending",
      performanceScore: calculatePerformanceScore(creator),
    };
  } catch (error) {
    console.error("Error tracking creator performance:", error);
    return null;
  }
}

export function calculatePerformanceScore(creator: any) {
  // Score based on: earnings, subscribers, verification
  const earningsScore = Math.min((creator.totalEarnings || 0) / 10000, 100);
  const subscriberScore = Math.min((creator.totalSubscribers || 0) / 1000, 100);
  const verificationBonus = creator.isVerified ? 20 : 0;

  return Math.round(
    (earningsScore * 0.4 + subscriberScore * 0.4 + verificationBonus * 0.2)
  );
}

export async function getTopCreators(limit = 20) {
  const db = await getDb();
  if (!db) return [];

  try {
    const creators = await db.select().from(creatorProfiles);

    return creators
      .map(creator => ({
        ...creator,
        performanceScore: calculatePerformanceScore(creator),
      }))
      .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting top creators:", error);
    return [];
  }
}

export async function getCreatorMetrics(creatorId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const creator = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.id, creatorId))
      .then(r => r[0]);

    if (!creator) return null;

    return {
      creatorId,
      totalEarnings: creator.totalEarnings || 0,
      subscribers: creator.totalSubscribers || 0,
      monthlyEarnings: creator.totalEarnings || 0,
      growthRate: 0,
      engagementRate: 0,
      conversionRate: creator.totalSubscribers ? 
        ((creator.totalSubscribers / 1000) * 100) : 0,
    };
  } catch (error) {
    console.error("Error getting creator metrics:", error);
    return null;
  }
}

