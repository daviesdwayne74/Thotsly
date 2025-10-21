/**
 * Payment Logger
 * Comprehensive logging and error tracking for all payment and payout operations
 * Ensures complete audit trail for compliance and debugging
 */

import { getDb } from "./db";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

export interface PaymentLog {
  timestamp: Date;
  level: LogLevel;
  operation: string;
  userId?: string;
  creatorId?: string;
  transactionId?: string;
  payoutId?: string;
  amount?: number;
  status: string;
  message: string;
  errorDetails?: string;
  metadata?: Record<string, any>;
}

// In-memory log store (in production, use a proper logging service like Winston or Bunyan)
const logStore: PaymentLog[] = [];
const MAX_LOGS = 10000;

/**
 * Log a payment operation
 */
export function logPaymentOperation(log: PaymentLog): void {
  const timestamp = new Date();
  const fullLog = { ...log, timestamp };

  // Add to in-memory store
  logStore.push(fullLog);

  // Keep store size manageable
  if (logStore.length > MAX_LOGS) {
    logStore.shift();
  }

  // Also log to console with appropriate level
  const consoleMethod = getConsoleMethod(log.level);
  consoleMethod(`[${log.level}] [${log.operation}] ${log.message}`, {
    userId: log.userId,
    creatorId: log.creatorId,
    transactionId: log.transactionId,
    payoutId: log.payoutId,
    amount: log.amount,
    status: log.status,
    errorDetails: log.errorDetails,
    metadata: log.metadata,
  });
}

/**
 * Get console method based on log level
 */
function getConsoleMethod(level: LogLevel): typeof console.log {
  switch (level) {
    case LogLevel.DEBUG:
      return console.debug;
    case LogLevel.INFO:
      return console.info;
    case LogLevel.WARN:
      return console.warn;
    case LogLevel.ERROR:
    case LogLevel.CRITICAL:
      return console.error;
    default:
      return console.log;
  }
}

/**
 * Log payment success
 */
export function logPaymentSuccess(
  operation: string,
  userId: string,
  creatorId: string,
  transactionId: string,
  amount: number,
  metadata?: Record<string, any>
): void {
  logPaymentOperation({
    level: LogLevel.INFO,
    operation,
    userId,
    creatorId,
    transactionId,
    amount,
    status: "success",
    message: `Payment processed successfully: $${(amount / 100).toFixed(2)}`,
    metadata,
  } as PaymentLog);
}

/**
 * Log payment failure
 */
export function logPaymentFailure(
  operation: string,
  userId: string | undefined,
  creatorId: string | undefined,
  error: Error | string,
  amount?: number,
  metadata?: Record<string, any>
): void {
  const errorMessage = error instanceof Error ? error.message : error;

  logPaymentOperation({
    level: LogLevel.ERROR,
    operation,
    userId,
    creatorId,
    amount,
    status: "failed",
    message: `Payment failed: ${errorMessage}`,
    errorDetails: error instanceof Error ? error.stack : undefined,
    metadata,
  } as PaymentLog);
}

/**
 * Log payout success
 */
export function logPayoutSuccess(
  operation: string,
  creatorId: string,
  payoutId: string,
  amount: number,
  stripePayoutId?: string,
  metadata?: Record<string, any>
): void {
  logPaymentOperation({
    timestamp: new Date(),
    level: LogLevel.INFO,
    operation,
    creatorId,
    payoutId,
    amount,
    status: "success",
    message: `Payout initiated successfully: $${(amount / 100).toFixed(2)}`,
    metadata: { ...metadata, stripePayoutId },
  });
}

/**
 * Log payout failure
 */
export function logPayoutFailure(
  operation: string,
  creatorId: string,
  error: Error | string,
  amount?: number,
  metadata?: Record<string, any>
): void {
  const errorMessage = error instanceof Error ? error.message : error;

  logPaymentOperation({
    level: LogLevel.ERROR,
    operation,
    creatorId,
    amount,
    status: "failed",
    message: `Payout failed: ${errorMessage}`,
    errorDetails: error instanceof Error ? error.stack : undefined,
    metadata,
  } as PaymentLog);
}

/**
 * Log critical payment issue
 */
export function logCriticalIssue(
  operation: string,
  error: Error | string,
  metadata?: Record<string, any>
): void {
  const errorMessage = error instanceof Error ? error.message : error;

  logPaymentOperation({
    level: LogLevel.CRITICAL,
    operation,
    status: "critical",
    message: `CRITICAL ISSUE: ${errorMessage}`,
    errorDetails: error instanceof Error ? error.stack : undefined,
    metadata,
  } as PaymentLog);
}

/**
 * Get logs filtered by criteria
 */
export function getLogs(filters?: {
  level?: LogLevel;
  operation?: string;
  userId?: string;
  creatorId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): PaymentLog[] {
  let filtered = [...logStore];

  if (filters?.level) {
    filtered = filtered.filter((log) => log.level === filters.level);
  }

  if (filters?.operation) {
    filtered = filtered.filter((log) => log.operation === filters.operation);
  }

  if (filters?.userId) {
    filtered = filtered.filter((log) => log.userId === filters.userId);
  }

  if (filters?.creatorId) {
    filtered = filtered.filter((log) => log.creatorId === filters.creatorId);
  }

  if (filters?.status) {
    filtered = filtered.filter((log) => log.status === filters.status);
  }

  if (filters?.startDate) {
    filtered = filtered.filter((log) => log.timestamp >= filters.startDate!);
  }

  if (filters?.endDate) {
    filtered = filtered.filter((log) => log.timestamp <= filters.endDate!);
  }

  // Sort by timestamp descending (newest first)
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply limit
  const limit = filters?.limit || 100;
  return filtered.slice(0, limit);
}

/**
 * Get error logs
 */
export function getErrorLogs(limit: number = 100): PaymentLog[] {
  return getLogs({
    level: LogLevel.ERROR,
    limit,
  });
}

/**
 * Get critical logs
 */
export function getCriticalLogs(limit: number = 100): PaymentLog[] {
  return getLogs({
    level: LogLevel.CRITICAL,
    limit,
  });
}

/**
 * Get logs for a specific creator
 */
export function getCreatorLogs(creatorId: string, limit: number = 100): PaymentLog[] {
  return getLogs({
    creatorId,
    limit,
  });
}

/**
 * Get logs for a specific user
 */
export function getUserLogs(userId: string, limit: number = 100): PaymentLog[] {
  return getLogs({
    userId,
    limit,
  });
}

/**
 * Get transaction logs
 */
export function getTransactionLogs(transactionId: string): PaymentLog[] {
  return logStore.filter((log) => log.transactionId === transactionId);
}

/**
 * Get payout logs
 */
export function getPayoutLogs(payoutId: string): PaymentLog[] {
  return logStore.filter((log) => log.payoutId === payoutId);
}

/**
 * Get summary statistics
 */
export function getLogSummary(): {
  totalLogs: number;
  byLevel: Record<LogLevel, number>;
  byStatus: Record<string, number>;
  recentErrors: number;
  recentCritical: number;
} {
  const byLevel: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 0,
    [LogLevel.WARN]: 0,
    [LogLevel.ERROR]: 0,
    [LogLevel.CRITICAL]: 0,
  };

  const byStatus: Record<string, number> = {};

  for (const log of logStore) {
    byLevel[log.level]++;
    byStatus[log.status] = (byStatus[log.status] || 0) + 1;
  }

  // Count errors in last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentErrors = logStore.filter(
    (log) => log.level === LogLevel.ERROR && log.timestamp >= oneDayAgo
  ).length;

  const recentCritical = logStore.filter(
    (log) => log.level === LogLevel.CRITICAL && log.timestamp >= oneDayAgo
  ).length;

  return {
    totalLogs: logStore.length,
    byLevel,
    byStatus,
    recentErrors,
    recentCritical,
  };
}

/**
 * Clear logs (use with caution!)
 */
export function clearLogs(): void {
  logStore.length = 0;
  console.warn("[Payment Logger] All logs have been cleared");
}

export default {
  LogLevel,
  logPaymentOperation,
  logPaymentSuccess,
  logPaymentFailure,
  logPayoutSuccess,
  logPayoutFailure,
  logCriticalIssue,
  getLogs,
  getErrorLogs,
  getCriticalLogs,
  getCreatorLogs,
  getUserLogs,
  getTransactionLogs,
  getPayoutLogs,
  getLogSummary,
  clearLogs,
};

