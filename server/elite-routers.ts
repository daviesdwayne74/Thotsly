import { z } from "zod";
import { protectedProcedure, router, publicProcedure } from "./_core/trpc";
import {
  determineCreatorTier,
  getTierInfo,
  getAllTiers,
  getCreatorTierInfo,
  checkEliteFoundingQualification,
} from "./elite-program";

export const eliteRouter = router({
  // Get creator's current tier based on earnings
  getCreatorTier: protectedProcedure
    .input(z.object({
      monthlyEarnings: z.number(),
    }))
    .query(async ({ input }) => {
      return getCreatorTierInfo(input.monthlyEarnings);
    }),

  // Get specific tier info
  getTierInfo: publicProcedure
    .input(z.enum(["tier_1", "tier_2", "tier_3", "tier_4", "tier_5"]))
    .query(async ({ input }) => {
      return getTierInfo(input);
    }),

  // Get all tiers
  getAllTiers: publicProcedure.query(async () => {
    return getAllTiers();
  }),

  // Check elite founding qualification
  checkEliteFoundingQualification: protectedProcedure
    .input(z.object({
      monthlyEarnings: z.number(),
    }))
    .query(async ({ input }) => {
      const qualifies = checkEliteFoundingQualification(input.monthlyEarnings);
      return {
        qualifies,
        monthlyEarnings: input.monthlyEarnings,
        message: qualifies
          ? "You qualify for Elite Founding status with 10% fee locked for life"
          : `You need $50,000/month to qualify for Elite Founding. Currently at $${(input.monthlyEarnings / 100).toFixed(2)}/month`,
      };
    }),
});

