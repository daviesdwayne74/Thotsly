/**
 * Transaction Processor
 * Handles all financial transactions with proper revenue splits
 */

import { getDb } from "./db";
import { transactions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  calculateCreatorEarnings,
  calculatePlatformEarnings,
  REVENUE_SPLITS,
} from "./revenue-config";
import { v4 as uuid } from "uuid";

export type TransactionType = "TIPS" | "PPV" | "LIVE_STREAMING" | "SUBSCRIPTIONS" | "MERCH";

interface TransactionData {
  creatorId: string;
  amount: number;
  type: TransactionType;
  description?: string;
}

interface ProcessedTransaction {
  id: string;
  creatorId: string;
  amount: number;
  type: TransactionType;
  creatorEarnings: number;
  platformEarnings: number;
  creatorPercentage: number;
  platformPercentage: number;
  status: "completed" | "pending" | "failed";
  createdAt: Date;
}

/**
 * Process a transaction with proper revenue split
 */
export async function processTransaction(
  data: TransactionData
): Promise<ProcessedTransaction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const transactionId = uuid();
  const split = REVENUE_SPLITS[data.type];

  const creatorEarnings = calculateCreatorEarnings(data.amount, data.type);
  const platformEarnings = calculatePlatformEarnings(data.amount, data.type);

  // Map transaction type to schema enum
  const typeMap: Record<TransactionType, "subscription" | "ppv" | "tip" | "payout"> = {
    TIPS: "tip",
    PPV: "ppv",
    LIVE_STREAMING: "tip",
    SUBSCRIPTIONS: "subscription",
    MERCH: "ppv",
  };

  // Record transaction
  await db.insert(transactions).values({
    id: transactionId,
    userId: data.creatorId,
    creatorId: data.creatorId,
    amount: data.amount,
    type: typeMap[data.type],
    platformFee: platformEarnings,
    status: "completed",
    description: data.description,
  });

  return {
    id: transactionId,
    creatorId: data.creatorId,
    amount: data.amount,
    type: data.type,
    creatorEarnings,
    platformEarnings,
    creatorPercentage: split.creatorPercentage,
    platformPercentage: split.platformPercentage,
    status: "completed",
    createdAt: new Date(),
  };
}

/**
 * Get creator earnings summary
 */
export async function getCreatorEarnings(creatorId: string) {
  const db = await getDb();
  if (!db) return null;

  const creatorTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.creatorId, creatorId));

  const summary = {
    totalEarnings: 0,
    byType: {
      TIPS: 0,
      PPV: 0,
      LIVE_STREAMING: 0,
      SUBSCRIPTIONS: 0,
      MERCH: 0,
    },
    transactionCount: creatorTransactions.length,
  };

  creatorTransactions.forEach((tx) => {
    const creatorEarnings = tx.amount - (tx.platformFee || 0);
    summary.totalEarnings += creatorEarnings;
    // Map back to our type
    const typeMap: Record<string, TransactionType> = {
      tip: "TIPS",
      ppv: "PPV",
      subscription: "SUBSCRIPTIONS",
      payout: "TIPS",
    };
    const txType = typeMap[tx.type] || "TIPS";
    if (txType in summary.byType) {
      summary.byType[txType] += creatorEarnings;
    }
  });

  return summary;
}

/**
 * Get platform revenue summary
 */
export async function getPlatformRevenue() {
  const db = await getDb();
  if (!db) return null;

  const allTransactions = await db.select().from(transactions);

  const summary = {
    totalRevenue: 0,
    byType: {
      TIPS: 0,
      PPV: 0,
      LIVE_STREAMING: 0,
      SUBSCRIPTIONS: 0,
      MERCH: 0,
    },
    transactionCount: allTransactions.length,
  };

  allTransactions.forEach((tx) => {
    summary.totalRevenue += tx.platformFee || 0;
    const typeMap: Record<string, TransactionType> = {
      tip: "TIPS",
      ppv: "PPV",
      subscription: "SUBSCRIPTIONS",
      payout: "TIPS",
    };
    const txType = typeMap[tx.type] || "TIPS";
    if (txType in summary.byType) {
      summary.byType[txType] += tx.platformFee || 0;
    }
  });

  return summary;
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(
  creatorId: string,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.creatorId, creatorId))
    .limit(limit);
}

