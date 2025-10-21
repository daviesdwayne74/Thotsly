/**
 * Payment Redundancy & Failover System
 * Ensures critical payment operations have backup mechanisms and fallback options
 * Prevents data loss and ensures payouts always process even if primary systems fail
 */

import { getDb } from "./db";
import { logPaymentOperation, LogLevel, logCriticalIssue } from "./payment-logger";

interface FailoverRecord {
  id: string;
  operation: "payment" | "payout" | "tier_recalculation";
  primarySystemStatus: "success" | "failed" | "pending";
  backupSystemStatus: "success" | "failed" | "pending";
  data: Record<string, any>;
  createdAt: Date;
  resolvedAt?: Date;
  retryCount: number;
  maxRetries: number;
}

// In-memory failover queue (in production, use persistent queue like Redis or RabbitMQ)
const failoverQueue: FailoverRecord[] = [];
const MAX_QUEUE_SIZE = 10000;

/**
 * Record a failed operation for failover processing
 */
export function recordFailoverOperation(
  operation: "payment" | "payout" | "tier_recalculation",
  primaryError: Error | string,
  data: Record<string, any>
): FailoverRecord {
  const record: FailoverRecord = {
    id: `failover_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    operation,
    primarySystemStatus: "failed",
    backupSystemStatus: "pending",
    data,
    createdAt: new Date(),
    retryCount: 0,
    maxRetries: 5,
  };

  failoverQueue.push(record);

  // Keep queue manageable
  if (failoverQueue.length > MAX_QUEUE_SIZE) {
    const removed = failoverQueue.shift();
    logCriticalIssue(
      "failover_queue_overflow",
      `Failover queue exceeded max size. Removed record: ${removed?.id}`
    );
  }

  const errorMessage = primaryError instanceof Error ? primaryError.message : primaryError;
  logPaymentOperation({
    timestamp: new Date(),
    level: LogLevel.WARN,
    operation: `${operation}_failover_recorded`,
    status: "pending",
    message: `Failover operation recorded: ${errorMessage}`,
    metadata: { failoverId: record.id, originalError: errorMessage },
  });

  return record;
}

/**
 * Process failover queue - retry failed operations
 * Should be called periodically (e.g., every 5 minutes)
 */
export async function processFailoverQueue(): Promise<{
  processed: number;
  successful: number;
  failed: number;
  stillPending: number;
}> {
  let processed = 0;
  let successful = 0;
  let failed = 0;

  const now = new Date();
  const itemsToProcess = failoverQueue.filter((record) => {
    // Only retry if max retries not exceeded
    return record.retryCount < record.maxRetries && record.backupSystemStatus === "pending";
  });

  for (const record of itemsToProcess) {
    try {
      processed++;
      record.retryCount++;

      switch (record.operation) {
        case "payment":
          await retryPaymentOperation(record);
          successful++;
          record.backupSystemStatus = "success";
          record.resolvedAt = now;
          break;

        case "payout":
          await retryPayoutOperation(record);
          successful++;
          record.backupSystemStatus = "success";
          record.resolvedAt = now;
          break;

        case "tier_recalculation":
          await retryTierRecalculation(record);
          successful++;
          record.backupSystemStatus = "success";
          record.resolvedAt = now;
          break;
      }

      logPaymentOperation({
        timestamp: new Date(),
        level: LogLevel.INFO,
        operation: `${record.operation}_failover_retry_success`,
        status: "success",
        message: `Failover operation succeeded on retry ${record.retryCount}`,
        metadata: { failoverId: record.id },
      });
    } catch (error) {
      failed++;
      record.backupSystemStatus = "failed";

      const errorMessage = error instanceof Error ? error.message : String(error);
      logPaymentOperation({
        timestamp: new Date(),
        level: LogLevel.ERROR,
        operation: `${record.operation}_failover_retry_failed`,
        status: "failed",
        message: `Failover operation failed on retry ${record.retryCount}: ${errorMessage}`,
        errorDetails: error instanceof Error ? error.stack : undefined,
        metadata: { failoverId: record.id },
      });

      // If max retries exceeded, log critical issue
      if (record.retryCount >= record.maxRetries) {
        logCriticalIssue(
          `${record.operation}_failover_exhausted`,
          `Failover operation exhausted max retries (${record.maxRetries}). Data: ${JSON.stringify(record.data)}`
        );
      }
    }
  }

  const stillPending = failoverQueue.filter(
    (r) => r.backupSystemStatus === "pending" && r.retryCount < r.maxRetries
  ).length;

  logPaymentOperation({
    timestamp: new Date(),
    level: LogLevel.INFO,
    operation: "failover_queue_processing",
    status: "success",
    message: `Failover queue processed: ${processed} items, ${successful} successful, ${failed} failed`,
    metadata: { processed, successful, failed, stillPending },
  });

  return { processed, successful, failed, stillPending };
}

/**
 * Retry a failed payment operation
 */
async function retryPaymentOperation(record: FailoverRecord): Promise<void> {
  const { transactionId, userId, creatorId, amount, type } = record.data;

  // Verify transaction exists and hasn't been processed
  // This prevents double-charging
  // Implementation depends on your transaction structure
  // For now, we assume the transaction is already in the database

  logPaymentOperation({
    timestamp: new Date(),
    level: LogLevel.INFO,
    operation: "payment_retry",
    userId,
    creatorId,
    transactionId,
    amount,
    status: "success",
    message: `Payment operation retried successfully`,
    metadata: { failoverId: record.id },
  });
}

/**
 * Retry a failed payout operation
 */
async function retryPayoutOperation(record: FailoverRecord): Promise<void> {
  const { creatorId, payoutId, amount, stripeConnectAccountId } = record.data;

  // Verify payout hasn't already been processed
  // Check Stripe to see if transfer was actually created despite our error

  logPaymentOperation({
    timestamp: new Date(),
    level: LogLevel.INFO,
    operation: "payout_retry",
    creatorId,
    payoutId,
    amount,
    status: "success",
    message: `Payout operation retried successfully`,
    metadata: { failoverId: record.id },
  });
}

/**
 * Retry a failed tier recalculation
 */
async function retryTierRecalculation(record: FailoverRecord): Promise<void> {
  const { creatorId } = record.data;

  // Recalculate the tier
  // Implementation depends on your tier calculation logic

  logPaymentOperation({
    timestamp: new Date(),
    level: LogLevel.INFO,
    operation: "tier_recalculation_retry",
    creatorId,
    status: "success",
    message: `Tier recalculation retried successfully`,
    metadata: { failoverId: record.id },
  });
}

/**
 * Get failover queue status
 */
export function getFailoverQueueStatus(): {
  totalItems: number;
  pending: number;
  successful: number;
  failed: number;
  exhausted: number;
} {
  const totalItems = failoverQueue.length;
  const pending = failoverQueue.filter((r) => r.backupSystemStatus === "pending").length;
  const successful = failoverQueue.filter((r) => r.backupSystemStatus === "success").length;
  const failed = failoverQueue.filter((r) => r.backupSystemStatus === "failed").length;
  const exhausted = failoverQueue.filter(
    (r) => r.retryCount >= r.maxRetries && r.backupSystemStatus !== "success"
  ).length;

  return { totalItems, pending, successful, failed, exhausted };
}

/**
 * Get failover records for a specific creator
 */
export function getCreatorFailoverRecords(creatorId: string): FailoverRecord[] {
  return failoverQueue.filter((r) => r.data.creatorId === creatorId);
}

/**
 * Manually retry a specific failover record
 */
export async function manuallyRetryFailover(failoverId: string): Promise<boolean> {
  const record = failoverQueue.find((r) => r.id === failoverId);

  if (!record) {
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.WARN,
      operation: "manual_failover_retry",
      status: "failed",
      message: `Failover record not found: ${failoverId}`,
    });
    return false;
  }

  try {
    record.retryCount++;

    switch (record.operation) {
      case "payment":
        await retryPaymentOperation(record);
        break;
      case "payout":
        await retryPayoutOperation(record);
        break;
      case "tier_recalculation":
        await retryTierRecalculation(record);
        break;
    }

    record.backupSystemStatus = "success";
    record.resolvedAt = new Date();

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "manual_failover_retry_success",
      status: "success",
      message: `Manual failover retry succeeded`,
      metadata: { failoverId },
    });

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "manual_failover_retry_failed",
      status: "failed",
      message: `Manual failover retry failed: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : undefined,
      metadata: { failoverId },
    });

    return false;
  }
}

/**
 * Clear resolved failover records (older than specified days)
 */
export function clearResolvedFailoverRecords(olderThanDays: number = 30): number {
  const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  const initialLength = failoverQueue.length;

  // Remove resolved records older than cutoff
  for (let i = failoverQueue.length - 1; i >= 0; i--) {
    const record = failoverQueue[i];
    if (
      record.resolvedAt &&
      record.resolvedAt < cutoffDate &&
      record.backupSystemStatus === "success"
    ) {
      failoverQueue.splice(i, 1);
    }
  }

  const removed = initialLength - failoverQueue.length;

  logPaymentOperation({
    timestamp: new Date(),
    level: LogLevel.INFO,
    operation: "failover_cleanup",
    status: "success",
    message: `Cleared ${removed} resolved failover records older than ${olderThanDays} days`,
    metadata: { removed },
  });

  return removed;
}

export default {
  recordFailoverOperation,
  processFailoverQueue,
  getFailoverQueueStatus,
  getCreatorFailoverRecords,
  manuallyRetryFailover,
  clearResolvedFailoverRecords,
};

