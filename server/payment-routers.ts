import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { createSubscriptionCheckout, createPaymentCheckout, handleStripeWebhook } from "./stripe";

export const paymentRouter = router({
  createSubscriptionCheckout: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const creator = await db.getCreatorProfile(input.creatorId);
      if (!creator) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Creator not found" });
      }

      const existing = await db.checkSubscription(ctx.user.id, input.creatorId);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Already subscribed" });
      }

      try {
        const url = await createSubscriptionCheckout(
          ctx.user.id,
          input.creatorId,
          creator.userId,
          creator.subscriptionPrice
        );
        return { url };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Checkout failed" });
      }
    }),

  createPaymentCheckout: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string(),
        type: z.enum(["ppv", "merch", "tip"]),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const metadata = (input.metadata || {}) as Record<string, string>;
        const url = await createPaymentCheckout(
          ctx.user.id,
          input.amount,
          input.description,
          input.type,
          metadata
        );
        return { url };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Checkout failed" });
      }
    }),

  getTransactions: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      return await db.getUserTransactions(ctx.user.id, input.limit);
    }),

  getCreatorPayouts: protectedProcedure.query(async ({ ctx }) => {
    const creator = await db.getCreatorProfileByUserId(ctx.user.id);
    if (!creator) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Creator not found" });
    }

    const transactions = await db.getCreatorTransactions(creator.id, 100);
    return {
      totalEarnings: creator.totalEarnings,
      totalSubscribers: creator.totalSubscribers,
      recentTransactions: transactions,
    };
  }),
});

