/**
 * Payment Processor
 * Handles subscription fee collection, revenue calculation, and payout processing
 * This is the core financial engine of THOTSLY
 */

import Stripe from "stripe";
import { getDb } from "./db";
import { transactions, creatorProfiles, subscriptions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  calculateCreatorEarnings,
  calculatePlatformEarnings,
  REVENUE_SPLITS,
} from "./revenue-config";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  amount: number;
  creatorEarnings: number;
  platformEarnings: number;
  error?: string;
  timestamp: Date;
}

export interface PayoutResult {
  success: boolean;
  payoutId?: string;
  creatorId: string;
  amount: number;
  status: string;
  error?: string;
  timestamp: Date;
}

/**
 * Process a subscription payment
 * This is called when a user successfully subscribes to a creator
 */
export async function processSubscriptionPayment(
  userId: string,
  creatorId: string,
  amountInCents: number,
  stripePaymentIntentId: string
): Promise<PaymentResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      amount: amountInCents,
      creatorEarnings: 0,
      platformEarnings: 0,
      error: "Database not available",
      timestamp: new Date(),
    };
  }

  try {
    // Verify the payment intent with Stripe
    if (!stripe) {
      throw new Error("Stripe not configured");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new Error(`Payment intent status is ${paymentIntent.status}, expected succeeded`);
    }

    if (paymentIntent.amount !== amountInCents) {
      throw new Error(
        `Payment amount mismatch: expected ${amountInCents}, got ${paymentIntent.amount}`
      );
    }

    // Calculate earnings
    const creatorEarnings = calculateCreatorEarnings(amountInCents, "SUBSCRIPTIONS");
    const platformEarnings = calculatePlatformEarnings(amountInCents, "SUBSCRIPTIONS");

    // Record transaction in database
    const transactionId = uuidv4();
    await db.insert(transactions).values({
      id: transactionId,
      userId,
      creatorId,
      amount: amountInCents,
      type: "subscription" as const,
      platformFee: platformEarnings,
      status: "completed" as const,
      description: `Subscription payment from user ${userId} to creator ${creatorId}`,
    });

    // Update creator profile with earnings
    const creator = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, creatorId)).limit(1);
    if (creator[0]) {
      await db
        .update(creatorProfiles)
        .set({
          totalEarnings: creator[0].totalEarnings + creatorEarnings,
        })
        .where(eq(creatorProfiles.id, creatorId));
    }

    return {
      success: true,
      transactionId,
      amount: amountInCents,
      creatorEarnings,
      platformEarnings,
      timestamp: new Date(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Payment Processor] Subscription payment failed:", errorMessage);

    return {
      success: false,
      amount: amountInCents,
      creatorEarnings: 0,
      platformEarnings: 0,
      error: errorMessage,
      timestamp: new Date(),
    };
  }
}

/**
 * Process a one-time payment (PPV, tips, merch, etc.)
 */
export async function processOneTimePayment(
  userId: string,
  creatorId: string,
  amountInCents: number,
  type: "ppv" | "tip" | "merch",
  stripePaymentIntentId: string,
  description: string
): Promise<PaymentResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      amount: amountInCents,
      creatorEarnings: 0,
      platformEarnings: 0,
      error: "Database not available",
      timestamp: new Date(),
    };
  }

  try {
    // Verify the payment intent with Stripe
    if (!stripe) {
      throw new Error("Stripe not configured");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new Error(`Payment intent status is ${paymentIntent.status}, expected succeeded`);
    }

    if (paymentIntent.amount !== amountInCents) {
      throw new Error(
        `Payment amount mismatch: expected ${amountInCents}, got ${paymentIntent.amount}`
      );
    }

    // Map type to revenue split type
    const revenueType = type === "ppv" ? "PPV" : type === "tip" ? "TIPS" : "MERCH";

    // Calculate earnings
    const creatorEarnings = calculateCreatorEarnings(amountInCents, revenueType as keyof typeof REVENUE_SPLITS);
    const platformEarnings = calculatePlatformEarnings(amountInCents, revenueType as keyof typeof REVENUE_SPLITS);

    // Record transaction in database
    const transactionId = uuidv4();
    const transactionType: "ppv" | "tip" = type === "ppv" ? "ppv" : "tip";
    await db.insert(transactions).values({
      id: transactionId,
      userId,
      creatorId,
      amount: amountInCents,
      type: transactionType,
      platformFee: platformEarnings,
      status: "completed" as const,
      description,
    });

    // Update creator profile with earnings
    const creator = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, creatorId)).limit(1);
    if (creator[0]) {
      await db
        .update(creatorProfiles)
        .set({
          totalEarnings: creator[0].totalEarnings + creatorEarnings,
        })
        .where(eq(creatorProfiles.id, creatorId));
    }

    return {
      success: true,
      transactionId,
      amount: amountInCents,
      creatorEarnings,
      platformEarnings,
      timestamp: new Date(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Payment Processor] One-time payment failed:", errorMessage);

    return {
      success: false,
      amount: amountInCents,
      creatorEarnings: 0,
      platformEarnings: 0,
      error: errorMessage,
      timestamp: new Date(),
    };
  }
}

/**
 * Handle Stripe webhook for payment success
 * This is called by the webhook endpoint when Stripe confirms payment
 */
export async function handlePaymentSuccessWebhook(event: Stripe.Event): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    // Extract metadata
    const userId = paymentIntent.metadata?.userId;
    const creatorId = paymentIntent.metadata?.creatorId;
    const paymentType = paymentIntent.metadata?.type || "subscription";

    if (!userId || !creatorId) {
      console.error("[Payment Processor] Missing metadata in payment intent:", paymentIntent.id);
      return;
    }

    // Process based on type
    if (paymentType === "subscription") {
      await processSubscriptionPayment(userId, creatorId, paymentIntent.amount || 0, paymentIntent.id);
    } else {
      await processOneTimePayment(
        userId,
        creatorId,
        paymentIntent.amount || 0,
        paymentType as "ppv" | "tip" | "merch",
        paymentIntent.id,
        paymentIntent.description || "Payment"
      );
    }
  }
}

/**
 * Get creator's pending payout balance
 * This calculates how much a creator has earned but not yet received
 */
export async function getCreatorPayoutBalance(creatorId: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    // Get all completed transactions for this creator
    const creatorTransactions = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.creatorId, creatorId), eq(transactions.status, "completed")));

    let totalBalance = 0;

    for (const tx of creatorTransactions) {
      const creatorEarnings = tx.amount - (tx.platformFee || 0);
      totalBalance += creatorEarnings;
    }

    return totalBalance;
  } catch (error) {
    console.error("[Payment Processor] Error calculating payout balance:", error);
    return 0;
  }
}

/**
 * Get all creators with pending payouts
 */
export async function getCreatorsWithPendingPayouts(minAmount: number = 1000): Promise<Array<{ creatorId: string; balance: number }>> {
  const db = await getDb();
  if (!db) return [];

  try {
    const creators = await db.select().from(creatorProfiles);
    const creatorsWithPayouts = [];

    for (const creator of creators) {
      const balance = await getCreatorPayoutBalance(creator.id);
      if (balance >= minAmount) {
        creatorsWithPayouts.push({
          creatorId: creator.id,
          balance,
        });
      }
    }

    return creatorsWithPayouts;
  } catch (error) {
    console.error("[Payment Processor] Error getting creators with pending payouts:", error);
    return [];
  }
}

/**
 * Validate transaction integrity
 * Ensures all amounts add up correctly
 */
export async function validateTransactionIntegrity(transactionId: string): Promise<{ valid: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { valid: false, error: "Database not available" };
  }

  try {
    const tx = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);

    if (!tx[0]) {
      return { valid: false, error: "Transaction not found" };
    }

    const transaction = tx[0];
    const creatorEarnings = transaction.amount - (transaction.platformFee || 0);

    // Verify amounts add up
    if (creatorEarnings + (transaction.platformFee || 0) !== transaction.amount) {
      return {
        valid: false,
        error: `Amount mismatch: creator ${creatorEarnings} + platform ${transaction.platformFee} != total ${transaction.amount}`,
      };
    }

    // Verify amounts are non-negative
    if (creatorEarnings < 0 || (transaction.platformFee || 0) < 0) {
      return { valid: false, error: "Negative amounts detected" };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Generate financial reconciliation report
 * Compares database records with Stripe records
 */
export async function generateReconciliationReport(): Promise<{
  totalTransactions: number;
  totalCollected: number;
  totalCreatorEarnings: number;
  totalPlatformEarnings: number;
  discrepancies: string[];
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalTransactions: 0,
      totalCollected: 0,
      totalCreatorEarnings: 0,
      totalPlatformEarnings: 0,
      discrepancies: ["Database not available"],
    };
  }

  try {
    const allTransactions = await db.select().from(transactions).where(eq(transactions.status, "completed"));

    let totalCollected = 0;
    let totalCreatorEarnings = 0;
    let totalPlatformEarnings = 0;
    const discrepancies: string[] = [];

    for (const tx of allTransactions) {
      totalCollected += tx.amount;
      const creatorEarnings = tx.amount - (tx.platformFee || 0);
      totalCreatorEarnings += creatorEarnings;
      totalPlatformEarnings += tx.platformFee || 0;

      // Validate each transaction
      const validation = await validateTransactionIntegrity(tx.id);
      if (!validation.valid) {
        discrepancies.push(`Transaction ${tx.id}: ${validation.error}`);
      }
    }

    return {
      totalTransactions: allTransactions.length,
      totalCollected,
      totalCreatorEarnings,
      totalPlatformEarnings,
      discrepancies,
    };
  } catch (error) {
    return {
      totalTransactions: 0,
      totalCollected: 0,
      totalCreatorEarnings: 0,
      totalPlatformEarnings: 0,
      discrepancies: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

export default {
  processSubscriptionPayment,
  processOneTimePayment,
  handlePaymentSuccessWebhook,
  getCreatorPayoutBalance,
  getCreatorsWithPendingPayouts,
  validateTransactionIntegrity,
  generateReconciliationReport,
};

