import { getDb } from "./db";
import { posts, users, subscriptions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Content Recommendation Engine
 * Recommends creators and posts based on engagement patterns
 */

export async function getRecommendedCreators(userId: string, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get creators user is already subscribed to
    const subscribedCreators = await db
      .select({ creatorId: subscriptions.creatorId })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    const subscribedIds = subscribedCreators.map(s => s.creatorId);

    // Get all creators
    const allCreators = await db.select().from(users);

    // Score creators based on engagement
    const scoredCreators = await Promise.all(
      allCreators
        .filter(c => c.role === "creator" && !subscribedIds.includes(c.id))
        .map(async (creator) => {
          const creatorPosts = await db
            .select()
            .from(posts)
            .where(eq(posts.creatorId, creator.id));

          const creatorSubs = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.creatorId, creator.id));

          const totalLikes = creatorPosts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
          const engagementRate = creatorPosts.length > 0
            ? totalLikes / creatorPosts.length
            : 0;

          const score =
            (creatorSubs.length * 0.4) +
            (engagementRate * 0.3) +
            (creatorPosts.length * 0.2) +
            (creator.name ? 0.1 : 0);

          return {
            ...creator,
            score,
            postCount: creatorPosts.length,
            subscriberCount: creatorSubs.length,
            engagementRate: Math.round(engagementRate * 100),
          };
        })
    );

    return scoredCreators
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting recommended creators:", error);
    return [];
  }
}

export async function getRecommendedPosts(userId: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get user's subscription list
    const userSubs = await db
      .select({ creatorId: subscriptions.creatorId })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    const subIds = userSubs.map(s => s.creatorId);

    if (subIds.length === 0) {
      return await getTrendingPosts(limit);
    }

    // Get posts from subscribed creators
    const allPosts = await db.select().from(posts);
    const recommendedPosts = allPosts.filter(p => subIds.includes(p.creatorId));

    // Score posts based on engagement
    const scoredPosts = recommendedPosts.map((post) => {
      const score =
        (post.likesCount || 0) * 0.5 +
        (post.commentsCount || 0) * 0.3 +
        (post.isPaid ? 0.2 : 0);

      return {
        ...post,
        score,
      };
    });

    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting recommended posts:", error);
    return [];
  }
}

export async function getTrendingPosts(limit = 20) {
  const db = await getDb();
  if (!db) return [];

  try {
    const allPosts = await db.select().from(posts);

    const scoredPosts = allPosts.map((post) => {
      // Trending score: likes + comments + recency
      const ageInHours =
        (Date.now() - (post.createdAt?.getTime() || 0)) / (1000 * 60 * 60);
      const recencyScore = Math.max(0, 100 - ageInHours);

      const score =
        (post.likesCount || 0) * 2 +
        (post.commentsCount || 0) * 1.5 +
        recencyScore * 0.1;

      return {
        ...post,
        score,
      };
    });

    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting trending posts:", error);
    return [];
  }
}

export async function getSimilarCreators(creatorId: string, limit = 5) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get target creator's subscribers
    const targetSubs = await db
      .select({ userId: subscriptions.userId })
      .from(subscriptions)
      .where(eq(subscriptions.creatorId, creatorId));

    const targetSubIds = targetSubs.map(s => s.userId);

    if (targetSubIds.length === 0) return [];

    // Find other creators these subscribers follow
    const similarCreators = await db
      .select({ creatorId: subscriptions.creatorId })
      .from(subscriptions)
      .where(eq(subscriptions.userId, targetSubIds[0] || ""));

    // Count overlap
    const creatorScores: Record<string, number> = {};
    similarCreators.forEach(({ creatorId: cId }) => {
      if (cId !== creatorId) {
        creatorScores[cId] = (creatorScores[cId] || 0) + 1;
      }
    });

    // Get top creators
    const topCreatorIds = Object.entries(creatorScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);

    const creators = await Promise.all(
      topCreatorIds.map(id =>
        db.select().from(users).where(eq(users.id, id)).then(r => r[0])
      )
    );

    return creators.filter(Boolean);
  } catch (error) {
    console.error("Error getting similar creators:", error);
    return [];
  }
}

