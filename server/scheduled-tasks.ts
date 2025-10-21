/**
 * Scheduled Tasks
 * Handles recurring tasks like monthly tier recalculation and daily batch payouts
 * Should be integrated with a task scheduler like node-cron or Bull
 */

import { recalculateAllCreatorTiers } from "./creator-fees";
import { processBatchPayouts } from "./payout-processor";
import { logPaymentOperation, LogLevel } from "./payment-logger";
import { processFailoverQueue } from "./payment-redundancy";

/**
 * Task: Recalculate creator fee tiers monthly
 * Should be run once per month (e.g., on the 1st of each month at 00:00 UTC)
 * Cron expression: 0 0 1 * * (first day of month at midnight)
 */
export async function monthlyTierRecalculation(): Promise<void> {
  const startTime = new Date();
  console.log("[Scheduled Tasks] Starting monthly tier recalculation...");

  try {
    const result = await recalculateAllCreatorTiers();

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "monthly_tier_recalculation",
      status: "success",
      message: `Monthly tier recalculation completed: ${result.tiersUpdated} creators updated`,
      metadata: {
        totalCreators: result.totalCreators,
        tiersUpdated: result.tiersUpdated,
        duration: Date.now() - startTime.getTime(),
      },
    });

    console.log(
      `[Scheduled Tasks] Monthly tier recalculation completed: ${result.tiersUpdated}/${result.totalCreators} creators updated`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Scheduled Tasks] Monthly tier recalculation failed:", errorMessage);

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "monthly_tier_recalculation",
      status: "failed",
      message: `Monthly tier recalculation failed: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : undefined,
    });
  }
}

/**
 * Task: Process batch payouts daily
 * Should be run once per day (e.g., at 02:00 UTC)
 * Cron expression: 0 2 * * * (every day at 2 AM)
 * Minimum payout threshold: $100 (10000 cents)
 */
export async function dailyBatchPayoutProcessing(): Promise<void> {
  const startTime = new Date();
  console.log("[Scheduled Tasks] Starting daily batch payout processing...");

  try {
    const result = await processBatchPayouts(10000); // $100 minimum

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "daily_batch_payout",
      status: "success",
      message: `Daily batch payout processing completed: ${result.successfulPayouts}/${result.totalPayouts} successful`,
      metadata: {
        totalPayouts: result.totalPayouts,
        successfulPayouts: result.successfulPayouts,
        failedPayouts: result.failedPayouts,
        totalAmount: result.totalAmount,
        duration: Date.now() - startTime.getTime(),
      },
    });

    console.log(
      `[Scheduled Tasks] Daily batch payout processing completed: ${result.successfulPayouts}/${result.totalPayouts} successful, $${(result.totalAmount / 100).toFixed(2)} distributed`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Scheduled Tasks] Daily batch payout processing failed:", errorMessage);

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "daily_batch_payout",
      status: "failed",
      message: `Daily batch payout processing failed: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : undefined,
    });
  }
}

/**
 * Task: Process failover queue
 * Should be run frequently (e.g., every 5 minutes)
 * Cron expression: 0 0,5,10,15,20,25,30,35,40,45,50,55 * * * * (every 5 minutes)
 */
export async function processFailoverQueueTask(): Promise<void> {
  const startTime = new Date();
  console.log("[Scheduled Tasks] Starting failover queue processing...");

  try {
    const result = await processFailoverQueue();

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "failover_queue_task",
      status: "success",
      message: `Failover queue processed: ${result.successful}/${result.processed} successful`,
      metadata: {
        processed: result.processed,
        successful: result.successful,
        failed: result.failed,
        stillPending: result.stillPending,
        duration: Date.now() - startTime.getTime(),
      },
    });

    console.log(
      `[Scheduled Tasks] Failover queue processing completed: ${result.successful}/${result.processed} successful`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Scheduled Tasks] Failover queue processing failed:", errorMessage);

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "failover_queue_task",
      status: "failed",
      message: `Failover queue processing failed: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : undefined,
    });
  }
}

/**
 * Task: Weekly reconciliation check
 * Should be run once per week (e.g., Monday at 03:00 UTC)
 * Cron expression: 0 3 * * 1 (every Monday at 3 AM)
 */
export async function weeklyReconciliationCheck(): Promise<void> {
  const startTime = new Date();
  console.log("[Scheduled Tasks] Starting weekly reconciliation check...");

  try {
    // Import here to avoid circular dependencies
    const { generateReconciliationReport, validateTransactionIntegrity } = await import(
      "./payment-processor"
    );

    const report = await generateReconciliationReport();

    const status = report.discrepancies.length === 0 ? "success" : "warning";
    const level = report.discrepancies.length === 0 ? LogLevel.INFO : LogLevel.WARN;

    logPaymentOperation({
      timestamp: new Date(),
      level,
      operation: "weekly_reconciliation",
      status,
      message: `Weekly reconciliation check completed: ${report.totalTransactions} transactions, ${report.discrepancies.length} discrepancies`,
      metadata: {
        totalTransactions: report.totalTransactions,
        totalCollected: report.totalCollected,
        totalCreatorEarnings: report.totalCreatorEarnings,
        totalPlatformEarnings: report.totalPlatformEarnings,
        discrepancies: report.discrepancies,
        duration: Date.now() - startTime.getTime(),
      },
    });

    if (report.discrepancies.length > 0) {
      console.warn(
        `[Scheduled Tasks] Weekly reconciliation found ${report.discrepancies.length} discrepancies:`
      );
      report.discrepancies.forEach((disc) => console.warn(`  - ${disc}`));
    } else {
      console.log("[Scheduled Tasks] Weekly reconciliation check passed - no discrepancies found");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Scheduled Tasks] Weekly reconciliation check failed:", errorMessage);

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "weekly_reconciliation",
      status: "failed",
      message: `Weekly reconciliation check failed: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : undefined,
    });
  }
}

/**
 * Initialize all scheduled tasks
 * Call this during application startup
 * Uses node-cron for scheduling
 */
export async function initializeScheduledTasks(): Promise<void> {
  console.log("[Scheduled Tasks] Initializing scheduled tasks...");

  try {
    // Try to import node-cron
    // In production, you should use a proper task scheduler like Bull, node-cron, or AWS Lambda
    let cron: any = null;
    try {
      cron = require("node-cron");
    } catch {
      cron = null;
    }

    if (!cron) {
      console.warn(
        "[Scheduled Tasks] node-cron not available. Scheduled tasks will not run automatically."
      );
      console.warn("[Scheduled Tasks] Install node-cron or use an external task scheduler.");
      return;
    }

    // Schedule monthly tier recalculation (1st of month at 00:00 UTC)
    cron.schedule("0 0 1 * *", monthlyTierRecalculation, {
      timezone: "UTC",
    });
    console.log("[Scheduled Tasks] ✓ Monthly tier recalculation scheduled (1st of month at 00:00 UTC)");

    // Schedule daily batch payout processing (every day at 02:00 UTC)
    cron.schedule("0 2 * * *", dailyBatchPayoutProcessing, {
      timezone: "UTC",
    });
    console.log("[Scheduled Tasks] ✓ Daily batch payout processing scheduled (every day at 02:00 UTC)");

    // Schedule weekly reconciliation check (Monday at 03:00 UTC)
    cron.schedule("0 3 * * 1", weeklyReconciliationCheck, {
      timezone: "UTC",
    });
    console.log("[Scheduled Tasks] ✓ Weekly reconciliation check scheduled (Monday at 03:00 UTC)");

    // Schedule failover queue processing (every 5 minutes)
    cron.schedule("0 */5 * * * *", processFailoverQueueTask, {
      timezone: "UTC",
    });
    console.log("[Scheduled Tasks] ✓ Failover queue processing scheduled (every 5 minutes)");

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "scheduled_tasks_init",
      status: "success",
      message: "All scheduled tasks initialized successfully",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Scheduled Tasks] Failed to initialize scheduled tasks:", errorMessage);

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "scheduled_tasks_init",
      status: "failed",
      message: `Failed to initialize scheduled tasks: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : undefined,
    });
  }
}

/**
 * Manual task execution (for testing or manual triggers)
 */
export async function executeTask(taskName: string): Promise<{ success: boolean; message: string }> {
  console.log(`[Scheduled Tasks] Manually executing task: ${taskName}`);

  try {
    switch (taskName) {
      case "monthly_tier_recalculation":
        await monthlyTierRecalculation();
        return { success: true, message: "Monthly tier recalculation executed successfully" };

      case "daily_batch_payout":
        await dailyBatchPayoutProcessing();
        return { success: true, message: "Daily batch payout processing executed successfully" };

      case "weekly_reconciliation":
        await weeklyReconciliationCheck();
        return { success: true, message: "Weekly reconciliation check executed successfully" };

      case "process_failover_queue":
        await processFailoverQueueTask();
        return { success: true, message: "Failover queue processing executed successfully" };

      default:
        return { success: false, message: `Unknown task: ${taskName}` };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Task execution failed: ${errorMessage}` };
  }
}

export default {
  monthlyTierRecalculation,
  dailyBatchPayoutProcessing,
  weeklyReconciliationCheck,
  initializeScheduledTasks,
  executeTask,
};

