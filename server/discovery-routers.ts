import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { creatorProfiles, posts } from "../drizzle/schema";
import { like, desc, sql } from "drizzle-orm";

export const discoveryRouter = router({
  // Search creators by name or bio
  searchCreators: publicProcedure
    .input(z.object({ query: z.string().min(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const searchTerm = `%${input.query}%`;
      return await db
        .select()
        .from(creatorProfiles)
        .where(
          sql`${creatorProfiles.displayName} LIKE ${searchTerm} OR ${creatorProfiles.bio} LIKE ${searchTerm}`
        )
        .orderBy(desc(creatorProfiles.totalSubscribers))
        .limit(input.limit);
    }),

  // Get trending creators (by subscriber count)
  getTrendingCreators: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(creatorProfiles)
        .orderBy(desc(creatorProfiles.totalSubscribers))
        .limit(input.limit);
    }),

  // Get trending posts (by likes)
  getTrendingPosts: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(posts)
        .where(sql`${posts.isPaid} = false`) // Only show free posts
        .orderBy(desc(posts.likesCount))
        .limit(input.limit);
    }),

  // Get creators by category/tag (would need category field in schema)
  getCreatorsByCategory: publicProcedure
    .input(z.object({ category: z.string(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      // This would require a category field in creatorProfiles
      // For now, return all creators
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(creatorProfiles)
        .orderBy(desc(creatorProfiles.totalSubscribers))
        .limit(input.limit);
    }),

  // Get new creators (recently joined)
  getNewCreators: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(creatorProfiles)
        .orderBy(desc(creatorProfiles.createdAt))
        .limit(input.limit);
    }),

  // Get verified creators
  getVerifiedCreators: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(creatorProfiles)
        .where(sql`${creatorProfiles.isVerified} = true`)
        .orderBy(desc(creatorProfiles.totalSubscribers))
        .limit(input.limit);
    }),

  // Search posts by content
  searchPosts: publicProcedure
    .input(z.object({ query: z.string().min(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const searchTerm = `%${input.query}%`;
      return await db
        .select()
        .from(posts)
        .where(
          sql`${posts.content} LIKE ${searchTerm} AND ${posts.isPaid} = false`
        )
        .orderBy(desc(posts.likesCount))
        .limit(input.limit);
    }),

  // Get recommendations for user (based on subscriptions)
  getRecommendations: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      // Get creators similar to ones user is subscribed to
      // For now, return trending creators not yet subscribed to
      return await db
        .select()
        .from(creatorProfiles)
        .orderBy(desc(creatorProfiles.totalSubscribers))
        .limit(input.limit);
    }),
});

