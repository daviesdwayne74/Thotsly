import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getRecommendedCreators,
  getRecommendedPosts,
  getTrendingPosts,
  getSimilarCreators,
} from "./recommendation-engine";

export const recommendationRouter = router({
  // Get recommended creators for user
  getRecommendedCreators: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return await getRecommendedCreators(ctx.user.id, input.limit || 10);
    }),

  // Get recommended posts for user
  getRecommendedPosts: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return await getRecommendedPosts(ctx.user.id, input.limit || 20);
    }),

  // Get trending posts (public)
  getTrendingPosts: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await getTrendingPosts(input.limit || 20);
    }),

  // Get creators similar to a given creator
  getSimilarCreators: publicProcedure
    .input(z.object({
      creatorId: z.string(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await getSimilarCreators(input.creatorId, input.limit || 5);
    }),
});

