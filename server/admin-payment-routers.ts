/**
 * Admin Payment Routers
 * Provides admin endpoints for payment monitoring, reconciliation, and creator management
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import {
  generateReconciliationReport,
  validateTransactionIntegrity,
  getCreatorPayoutBalance,
} from "./payment-processor";
import {
  processBatchPayouts,
  validatePayoutIntegrity,
  getCreatorPayoutHistory,
} from "./payout-processor";
import {
  getAllCreatorTiers,
  getCreatorFeeInfo,
  grantEliteFounding,
  recalculateAllCreatorTiers,
} from "./creator-fees";
import {
  getLogSummary,
  getLogs,
  getErrorLogs,
  getCriticalLogs,
  LogLevel,
} from "./payment-logger";
import {
  monthlyTierRecalculation,
  dailyBatchPayoutProcessing,
  weeklyReconciliationCheck,
  executeTask,
} from "./scheduled-tasks";

/**
 * Failover Management Endpoints
 */
const failoverRouter = router({
  getQueueStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await db.getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view failover status",
        });
      }

      const { getFailoverQueueStatus } = await import("./payment-redundancy");
      return getFailoverQueueStatus();
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get failover queue status",
      });
    }
  }),

  getCreatorFailovers: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await db.getUser(ctx.user.id);
        if (user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can view failover records",
          });
        }

        const { getCreatorFailoverRecords } = await import("./payment-redundancy");
        return getCreatorFailoverRecords(input.creatorId);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get creator failover records",
        });
      }
    }),

  manualRetry: protectedProcedure
    .input(z.object({ failoverId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await db.getUser(ctx.user.id);
        if (user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can retry failover operations",
          });
        }

        const { manuallyRetryFailover } = await import("./payment-redundancy");
        const success = await manuallyRetryFailover(input.failoverId);

        return {
          success,
          message: success ? "Failover operation retried successfully" : "Failed to retry failover operation",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retry failover operation",
        });
      }
    }),
});

export const adminPaymentRouter = router({
  /**
   * Get financial reconciliation report
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
   * Validate payout integrity
   */
  validatePayoutIntegrity: protectedProcedure.query(async ({ ctx }) => {
    try {
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

  /**
   * Get all creators and their fee tiers
   */
  getAllCreatorTiers: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await db.getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view creator tiers",
        });
      }

      const tiers = await getAllCreatorTiers();

      return tiers.map((tier) => ({
        creatorId: tier.creatorId,
        currentTier: tier.currentTier,
        platformFeePercentage: tier.platformFeePercentage,
        creatorEarningsPercentage: tier.creatorEarningsPercentage,
        monthlyEarnings: tier.monthlyEarnings,
        monthlyEarningsInDollars: (tier.monthlyEarnings / 100).toFixed(2),
        isEliteFounding: tier.isEliteFounding,
        lastRecalculatedAt: tier.lastRecalculatedAt,
      }));
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get creator tiers",
      });
    }
  }),

  /**
   * Grant elite founding status to a creator
   */
  grantEliteFounding: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await db.getUser(ctx.user.id);
        if (user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can grant elite founding status",
          });
        }

        const creator = await db.getCreatorProfile(input.creatorId);
        if (!creator) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Creator not found",
          });
        }

        if (creator.isEliteFounding) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Creator already has elite founding status",
          });
        }

        const success = await grantEliteFounding(input.creatorId);

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to grant elite founding status",
          });
        }

        return {
          success: true,
          creatorId: input.creatorId,
          message: "Elite founding status granted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to grant elite founding status",
        });
      }
    }),

  /**
   * Get creator's payout balance
   */
  getCreatorPayoutBalance: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await db.getUser(ctx.user.id);
        if (user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can view creator balances",
          });
        }

        const balance = await getCreatorPayoutBalance(input.creatorId);

        return {
          creatorId: input.creatorId,
          balanceInCents: balance,
          balanceInDollars: (balance / 100).toFixed(2),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get creator payout balance",
        });
      }
    }),

  /**
   * Get creator's payout history
   */
  getCreatorPayoutHistory: protectedProcedure
    .input(z.object({ creatorId: z.string(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await db.getUser(ctx.user.id);
        if (user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can view payout history",
          });
        }

        const payouts = await getCreatorPayoutHistory(input.creatorId, input.limit);

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
        });
      }
    }),

  /**
   * Process batch payouts manually
   */
  processBatchPayouts: protectedProcedure
    .input(z.object({ minAmountInCents: z.number().default(10000) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await db.getUser(ctx.user.id);
        if (user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can process batch payouts",
          });
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
   * Recalculate all creator tiers manually
   */
  recalculateAllCreatorTiers: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const user = await db.getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can recalculate tiers",
        });
      }

      const result = await recalculateAllCreatorTiers();

      return {
        success: true,
        totalCreators: result.totalCreators,
        tiersUpdated: result.tiersUpdated,
        results: result.results,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to recalculate tiers",
      });
    }
  }),

  /**
   * Get payment logs
   */
  getPaymentLogs: protectedProcedure
    .input(
      z.object({
        level: z.enum(["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]).optional(),
        limit: z.number().max(500).default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const user = await db.getUser(ctx.user.id);
        if (user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can view payment logs",
          });
        }

        let logs;
        if (input.level === "ERROR") {
          logs = getErrorLogs(input.limit);
        } else if (input.level === "CRITICAL") {
          logs = getCriticalLogs(input.limit);
        } else {
          logs = getLogs({ level: input.level as LogLevel, limit: input.limit });
        }

        return logs.map((log) => ({
          timestamp: log.timestamp,
          level: log.level,
          operation: log.operation,
          userId: log.userId,
          creatorId: log.creatorId,
          transactionId: log.transactionId,
          payoutId: log.payoutId,
          amount: log.amount,
          status: log.status,
          message: log.message,
          errorDetails: log.errorDetails,
          metadata: log.metadata,
        }));
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get payment logs",
        });
      }
    }),

  /**
   * Get log summary
   */
  getLogSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await db.getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view log summary",
        });
      }

      const summary = getLogSummary();

      return {
        totalLogs: summary.totalLogs,
        byLevel: summary.byLevel,
        byStatus: summary.byStatus,
        recentErrors: summary.recentErrors,
        recentCritical: summary.recentCritical,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get log summary",
      });
    }
  }),

  /**
   * Execute scheduled task manually
   */
  failover: failoverRouter,

  executeTask: protectedProcedure
    .input(
      z.object({
        taskName: z.enum([
          "monthly_tier_recalculation",
          "daily_batch_payout",
          "weekly_reconciliation",
          "process_failover_queue",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await db.getUser(ctx.user.id);
        if (user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can execute tasks",
          });
        }

        const result = await executeTask(input.taskName);

        return {
          success: result.success,
          message: result.message,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to execute task",
        });
      }
    }),
});

export default adminPaymentRouter;

