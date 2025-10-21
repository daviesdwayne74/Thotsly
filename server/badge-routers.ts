import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getCreatorBadges, getBadge, getAllBadges } from "./badges";

export const badgeRouter = router({
  // Get all badges for a creator
  getCreatorBadges: publicProcedure
    .input(z.object({
      monthlyEarnings: z.number(),
      subscriptionRate: z.number(),
      isVerified: z.boolean(),
      isEliteFounder: z.boolean(),
    }))
    .query(async ({ input }) => {
      const badgeIds = getCreatorBadges(
        input.monthlyEarnings,
        input.subscriptionRate,
        input.isVerified,
        input.isEliteFounder
      );

      return badgeIds.map(id => getBadge(id));
    }),

  // Get specific badge details
  getBadge: publicProcedure
    .input(z.enum(["verified", "elite_founding"]))
    .query(async ({ input }) => {
      return getBadge(input);
    }),

  // Get all available badges
  getAllBadges: publicProcedure.query(async () => {
    return getAllBadges();
  }),
});

