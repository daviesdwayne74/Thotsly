/**
 * Payout API Routers
 * Exposes payment and payout functionality via tRPC endpoints
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import {
  initiatePayout,
  processBatchPayouts,
  getPayoutStatus,
  getCreatorPayoutHistory,
  validatePayoutIntegrity,
} from "./payout-processor";
import {
  getCreatorPayoutBalance,
  generateReconciliationReport,
  validateTransactionIntegrity,
} from "./payment-processor";
import { getCreatorFeeInfo } from "./creator-fees";
import {
  createConnectedAccount,
  createAccountLink,
  getConnectedAccountByCreatorId,
  updateConnectedAccountStatus,
} from "./stripe-connect";

export const payoutRouter = router({
  /**
   * Get creator's current payout balance
   */
  getPayoutBalance: protectedProcedure.query(async ({ ctx }) => {
    try {
      const creator = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!creator) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found" });
      }

      const balance = await getCreatorPayoutBalance(creator.id);

      return {
        creatorId: creator.id,
        balanceInCents: balance,
        balanceInDollars: (balance / 100).toFixed(2),
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get payout balance",
      });
    }
  }),

  /**
   * Get creator's payout history
   */
  getPayoutHistory: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      try {
        const creator = await db.getCreatorProfileByUserId(ctx.user.id);
        if (!creator) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found" });
        }

        const payouts = await getCreatorPayoutHistory(creator.id, input.limit);

        return payouts.map((p) => ({
          id: p.payoutId,
          amount: p.amount,
          amountInDollars: (p.amount / 100).toFixed(2),
          status: p.status,
          arrivalDate: p.arrivalDate,
          failureReason: p.failureReason,
          timestamp: p.timestamp,
        }));
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get payout history",
        });;
      }
    }),

  /**
   * Initiate a payout for the creator
   */
  initiatePayout: protectedProcedure
    .input(z.object({ amountInCents: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const creator = await db.getCreatorProfileByUserId(ctx.user.id);
        if (!creator) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found" });
        }

        // Check if creator has connected account
        const connectedAccount = await getConnectedAccountByCreatorId(creator.id);
        if (!connectedAccount) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Creator must connect a Stripe account first",
          });
        }

        if (connectedAccount.status !== "active") {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Creator's Stripe account is not active",
          });
        }

        // Check balance
        const balance = await getCreatorPayoutBalance(creator.id);
        if (balance < input.amountInCents) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient balance. Available: ${(balance / 100).toFixed(2)}`,
          });
        }

        const result = await initiatePayout(creator.id, input.amountInCents);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error || "Failed to initiate payout",
          });
        }

        return {
          success: true,
          payoutId: result.payoutId,
          amount: result.amount,
          amountInDollars: (result.amount / 100).toFixed(2),
          status: result.status,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initiate payout",
        });
      }
    }),

  /**
   * Get payout status
   */
  getPayoutStatus: protectedProcedure
    .input(z.object({ payoutId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const creator = await db.getCreatorProfileByUserId(ctx.user.id);
        if (!creator) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found" });
        }

        const status = await getPayoutStatus(input.payoutId);
        if (!status) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Payout not found" });
        }

        // Verify ownership
        if (status.creatorId !== creator.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this payout" });
        }

        return {
          id: status.payoutId,
          amount: status.amount,
          amountInDollars: (status.amount / 100).toFixed(2),
          status: status.status,
          arrivalDate: status.arrivalDate,
          failureReason: status.failureReason,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get payout status",
        });
      }
    }),

  /**
   * Get creator's fee information
   */
  getCreatorFeeInfo: protectedProcedure.query(async ({ ctx }) => {
    try {
      const creator = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!creator) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found" });
      }
      const feeInfo = await getCreatorFeeInfo(creator.id);
      return feeInfo;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get creator fee info",
        });
    }
  }),

  /**
   * Create Stripe Connect account for creator
   */
  createStripeConnectAccount: protectedProcedure
    .input(z.object({ country: z.string().default("US") }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await db.getUser(ctx.user.id);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        const creator = await db.getCreatorProfileByUserId(ctx.user.id);
        if (!creator) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found" });
        }

        // Check if creator already has a connected account
        const existing = await getConnectedAccountByCreatorId(creator.id);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Creator already has a connected Stripe account",
          });
        }

        const accountId = await createConnectedAccount(
          creator.id,
          user.email || "",
          input.country,
          "express"
        );

        return {
          success: true,
          accountId,
          message: "Stripe Connect account created. Please complete onboarding.",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Stripe Connect account",
        });
      }
    }),

  /**
   * Get Stripe Connect onboarding link
   */
  getOnboardingLink: protectedProcedure
    .input(
      z.object({
        returnUrl: z.string().url(),
        refreshUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const creator = await db.getCreatorProfileByUserId(ctx.user.id);
        if (!creator) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found" });
        }

        const connectedAccount = await getConnectedAccountByCreatorId(creator.id);
        if (!connectedAccount) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Creator has no Stripe Connect account",
          });
        }

        const link = await createAccountLink(
          connectedAccount.stripeConnectAccountId,
          input.refreshUrl,
          input.returnUrl
        );

        return {
          success: true,
          onboardingUrl: link,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get onboarding link",
        });
      }
    }),

  /**
   * Get connected account status
   */
  getConnectedAccountStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const creator = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!creator) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found" });
      }

      const connectedAccount = await getConnectedAccountByCreatorId(creator.id);

      if (!connectedAccount) {
        return {
          connected: false,
          status: null,
        };
      }

      return {
        connected: true,
        status: connectedAccount.status,
        accountId: connectedAccount.stripeConnectAccountId,
        createdAt: connectedAccount.createdAt,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get account status",
        });
    }
  }),

  /**
   * Admin: Process batch payouts
   */
  processBatchPayouts: protectedProcedure
    .input(z.object({ minAmountInCents: z.number().default(10000) }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin
        const user = await db.getUser(ctx.user.id);
        if (user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can process batch payouts" });
        }

        const result = await processBatchPayouts(input.minAmountInCents);

        return {
          success: true,
          totalPayouts: result.totalPayouts,
          successfulPayouts: result.successfulPayouts,
          failedPayouts: result.failedPayouts,
          totalAmount: result.totalAmount,
          totalAmountInDollars: (result.totalAmount / 100).toFixed(2),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process batch payouts",
        });
      }
    }),

  /**
   * Admin: Get financial reconciliation report
   */
  getReconciliationReport: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Check if user is admin
      const user = await db.getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view reconciliation reports",
        });
      }

      const report = await generateReconciliationReport();

      return {
        totalTransactions: report.totalTransactions,
        totalCollected: report.totalCollected,
        totalCollectedInDollars: (report.totalCollected / 100).toFixed(2),
        totalCreatorEarnings: report.totalCreatorEarnings,
        totalCreatorEarningsInDollars: (report.totalCreatorEarnings / 100).toFixed(2),
        totalPlatformEarnings: report.totalPlatformEarnings,
        totalPlatformEarningsInDollars: (report.totalPlatformEarnings / 100).toFixed(2),
        discrepancies: report.discrepancies,
        hasDiscrepancies: report.discrepancies.length > 0,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate reconciliation report",
        });
    }
  }),

  /**
   * Admin: Validate payout integrity
   */
  validatePayoutIntegrity: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Check if user is admin
      const user = await db.getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can validate payout integrity",
        });
      }

      const result = await validatePayoutIntegrity();

      return {
        valid: result.valid,
        discrepancies: result.discrepancies,
        totalPayoutsInDb: result.totalPayoutsInDb,
        totalPayoutsInStripe: result.totalPayoutsInStripe,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate payout integrity",
        });
    }
  }),
});

