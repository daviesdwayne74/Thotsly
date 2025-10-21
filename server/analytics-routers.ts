import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getCreatorAnalytics,
  getContentEngagementSummary,
  getAudienceInsights,
  getRevenueAnalytics,
  hasAnalyticsSubscription,
  subscribeToAnalytics,
  cancelAnalyticsSubscription,
  trackWatchTime,
} from "./analytics-service";

export const analyticsRouter = router({
  // Get creator analytics dashboard (requires subscription)
  getAnalytics: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      const hasSubscription = await hasAnalyticsSubscription(input.creatorId);
      if (!hasSubscription) {
        return {
          error: "Analytics subscription required",
          requiresSubscription: true,
        };
      }

      return await getCreatorAnalytics(input.creatorId, true);
    }),

  // Get content engagement summary
  getContentEngagement: protectedProcedure
    .input(z.object({ contentId: z.string() }))
    .query(async ({ input }) => {
      return await getContentEngagementSummary(input.contentId);
    }),

  // Get audience insights (requires subscription)
  getAudienceInsights: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      const hasSubscription = await hasAnalyticsSubscription(input.creatorId);
      if (!hasSubscription) {
        return { error: "Analytics subscription required" };
      }

      return await getAudienceInsights(input.creatorId);
    }),

  // Get revenue analytics (requires subscription)
  getRevenueAnalytics: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      const hasSubscription = await hasAnalyticsSubscription(input.creatorId);
      if (!hasSubscription) {
        return { error: "Analytics subscription required" };
      }

      return await getRevenueAnalytics(input.creatorId);
    }),

  // Track watch time event
  trackWatchTime: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      contentId: z.string(),
      durationSeconds: z.number(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await trackWatchTime(
        input.creatorId,
        input.contentId,
        ctx.user.id,
        input.durationSeconds,
        input.metadata
      );
    }),

  // Subscribe to analytics
  subscribe: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .mutation(async ({ input }) => {
      return await subscribeToAnalytics(input.creatorId);
    }),

  // Cancel analytics subscription
  cancel: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .mutation(async ({ input }) => {
      return await cancelAnalyticsSubscription(input.creatorId);
    }),

  // Check subscription status
  hasSubscription: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      const hasSubscription = await hasAnalyticsSubscription(input.creatorId);
      return { hasSubscription, monthlyFee: 5000 };
    }),
});

