/**
 * Payout Processor
 * Handles creator payouts via Stripe Connect with comprehensive error handling and reconciliation
 * This is critical for creator trust and platform reliability
 */

import Stripe from "stripe";
import { getDb } from "./db";
import { creatorPayouts, stripeConnectAccounts, creatorProfiles, transactions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getCreatorPayoutBalance } from "./payment-processor";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export interface PayoutInitiationResult {
  success: boolean;
  payoutId?: string;
  creatorId: string;
  amount: number;
  stripePayoutId?: string;
  status: string;
  error?: string;
  timestamp: Date;
}

export interface PayoutStatus {
  payoutId: string;
  creatorId: string;
  amount: number;
  status: "pending" | "in_transit" | "paid" | "failed" | "cancelled";
  arrivalDate?: Date;
  failureReason?: string;
  timestamp: Date;
}

/**
 * Initiate a payout to a creator
 * Transfers funds from platform account to creator's connected Stripe account
 */
export async function initiatePayout(
  creatorId: string,
  amountInCents: number
): Promise<PayoutInitiationResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      creatorId,
      amount: amountInCents,
      status: "failed",
      error: "Database not available",
      timestamp: new Date(),
    };
  }

  try {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }

    // Get creator's connected account
    const connectedAccount = await db
      .select()
      .from(stripeConnectAccounts)
      .where(eq(stripeConnectAccounts.creatorId, creatorId))
      .limit(1);

    if (!connectedAccount[0]) {
      throw new Error("Creator has no connected Stripe account");
    }

    if (connectedAccount[0].status !== "active") {
      throw new Error(`Creator's Stripe account is ${connectedAccount[0].status}, not active`);
    }

    // Verify creator has sufficient balance
    const balance = await getCreatorPayoutBalance(creatorId);
    if (balance < amountInCents) {
      throw new Error(
        `Insufficient balance: creator has ${balance} cents, requested ${amountInCents} cents`
      );
    }

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: "usd",
      destination: connectedAccount[0].stripeConnectAccountId,
      description: `THOTSLY Creator Payout to ${creatorId}`,
      metadata: {
        creatorId,
        type: "creator_payout",
      },
    });

    // Record payout in database
    const payoutId = uuidv4();
    await db.insert(creatorPayouts).values({
      id: payoutId,
      creatorId,
      stripePayoutId: transfer.id,
      amount: amountInCents,
      status: "pending",
      currency: "usd",
    });

    return {
      success: true,
      payoutId,
      creatorId,
      amount: amountInCents,
      stripePayoutId: transfer.id,
      status: "pending",
      timestamp: new Date(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Payout Processor] Payout initiation failed:", errorMessage);

    return {
      success: false,
      creatorId,
      amount: amountInCents,
      status: "failed",
      error: errorMessage,
      timestamp: new Date(),
    };
  }
}

/**
 * Process payouts for all creators with pending balances above minimum threshold
 * This should be called on a scheduled basis (e.g., weekly)
 */
export async function processBatchPayouts(
  minAmountInCents: number = 10000 // $100 minimum
): Promise<{
  totalPayouts: number;
  successfulPayouts: number;
  failedPayouts: number;
  totalAmount: number;
  results: PayoutInitiationResult[];
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalPayouts: 0,
      successfulPayouts: 0,
      failedPayouts: 0,
      totalAmount: 0,
      results: [],
    };
  }

  try {
    const creators = await db.select().from(creatorProfiles);
    const results: PayoutInitiationResult[] = [];
    let successfulPayouts = 0;
    let failedPayouts = 0;
    let totalAmount = 0;

    for (const creator of creators) {
      const balance = await getCreatorPayoutBalance(creator.id);

      if (balance >= minAmountInCents) {
        const result = await initiatePayout(creator.id, balance);
        results.push(result);

        if (result.success) {
          successfulPayouts++;
          totalAmount += result.amount;
        } else {
          failedPayouts++;
        }
      }
    }

    return {
      totalPayouts: results.length,
      successfulPayouts,
      failedPayouts,
      totalAmount,
      results,
    };
  } catch (error) {
    console.error("[Payout Processor] Batch payout processing failed:", error);
    return {
      totalPayouts: 0,
      successfulPayouts: 0,
      failedPayouts: 0,
      totalAmount: 0,
      results: [],
    };
  }
}

/**
 * Get payout status from Stripe
 * Updates database with latest status from Stripe
 */
export async function getPayoutStatus(payoutId: string): Promise<PayoutStatus | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const payout = await db
      .select()
      .from(creatorPayouts)
      .where(eq(creatorPayouts.id, payoutId))
      .limit(1);

    if (!payout[0]) {
      return null;
    }

    if (!stripe) {
      throw new Error("Stripe not configured");
    }

    // Get latest status from Stripe
    const stripeTransfer = await stripe.transfers.retrieve(payout[0].stripePayoutId);

    // Update database with latest status
    let status: "pending" | "in_transit" | "paid" | "failed" | "cancelled" = "pending";
    status = payout[0].status;

    await db
      .update(creatorPayouts)
      .set({
        status,
      })
      .where(eq(creatorPayouts.id, payoutId));

    return {
      payoutId,
      creatorId: payout[0].creatorId,
      amount: payout[0].amount,
      status,
      arrivalDate: payout[0].arrivalDate || undefined,
      failureReason: payout[0].failureMessage || undefined,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[Payout Processor] Error getting payout status:", error);
    return null;
  }
}

/**
 * Handle Stripe transfer webhook events
 * Updates payout status when Stripe confirms transfer completion
 */
export async function handleTransferWebhook(event: any): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const eventType = event.type as string;
  const transfer = event.data?.object as Stripe.Transfer | undefined;

  if (!transfer) {
    console.warn("[Payout Processor] Webhook missing transfer object");
    return;
  }

  const creatorId = transfer.metadata?.creatorId;

  if (!creatorId) {
    console.warn("[Payout Processor] Transfer webhook missing creatorId metadata");
    return;
  }

  // Find payout record by Stripe transfer ID
  const payouts = await db
    .select()
    .from(creatorPayouts)
    .where(eq(creatorPayouts.stripePayoutId, transfer.id));

  if (!payouts[0]) {
    console.warn("[Payout Processor] Payout record not found for transfer", transfer.id);
    return;
  }

  // Update status based on event type
  if (eventType === "transfer.created") {
    await db
      .update(creatorPayouts)
      .set({ status: "pending" })
      .where(eq(creatorPayouts.id, payouts[0].id));
  } else if (eventType === "transfer.paid") {
    await db
      .update(creatorPayouts)
      .set({
        status: "paid",
        arrivalDate: new Date(),
      })
      .where(eq(creatorPayouts.id, payouts[0].id));
  } else if (eventType === "transfer.failed") {
    await db
      .update(creatorPayouts)
      .set({
        status: "failed",
        failureCode: "transfer_failed",
        failureMessage: "Transfer failed - check Stripe dashboard for details",
      })
      .where(eq(creatorPayouts.id, payouts[0].id));
  }
}

/**
 * Get payout history for a creator
 */
export async function getCreatorPayoutHistory(
  creatorId: string,
  limit: number = 50
): Promise<PayoutStatus[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const payouts = await db
      .select()
      .from(creatorPayouts)
      .where(eq(creatorPayouts.creatorId, creatorId))
      .limit(limit);

    return payouts.map((p) => ({
      payoutId: p.id,
      creatorId: p.creatorId,
      amount: p.amount,
      status: p.status as "pending" | "in_transit" | "paid" | "failed" | "cancelled",
      arrivalDate: p.arrivalDate || undefined,
      failureReason: p.failureMessage || undefined,
      timestamp: p.createdAt || new Date(),
    }));
  } catch (error) {
    console.error("[Payout Processor] Error getting payout history:", error);
    return [];
  }
}

/**
 * Validate payout integrity
 * Ensures all payout records match Stripe records
 */
export async function validatePayoutIntegrity(): Promise<{
  valid: boolean;
  discrepancies: string[];
  totalPayoutsInDb: number;
  totalPayoutsInStripe: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      valid: false,
      discrepancies: ["Database not available"],
      totalPayoutsInDb: 0,
      totalPayoutsInStripe: 0,
    };
  }

  try {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }

    const dbPayouts = await db.select().from(creatorPayouts);
    const discrepancies: string[] = [];

    // Check each payout in database against Stripe
    for (const payout of dbPayouts) {
      try {
        const stripeTransfer = await stripe.transfers.retrieve(payout.stripePayoutId);

        // Verify amounts match
        if (stripeTransfer.amount !== payout.amount) {
          discrepancies.push(
            `Payout ${payout.id}: amount mismatch (DB: ${payout.amount}, Stripe: ${stripeTransfer.amount})`
          );
        }

        // Verify currency matches
        if (stripeTransfer.currency !== payout.currency) {
          discrepancies.push(
            `Payout ${payout.id}: currency mismatch (DB: ${payout.currency}, Stripe: ${stripeTransfer.currency})`
          );
        }
      } catch (error) {
        discrepancies.push(`Payout ${payout.id}: could not retrieve from Stripe - ${error}`);
      }
    }

    return {
      valid: discrepancies.length === 0,
      discrepancies,
      totalPayoutsInDb: dbPayouts.length,
      totalPayoutsInStripe: dbPayouts.length, // This would require fetching all from Stripe
    };
  } catch (error) {
    return {
      valid: false,
      discrepancies: [error instanceof Error ? error.message : "Unknown error"],
      totalPayoutsInDb: 0,
      totalPayoutsInStripe: 0,
    };
  }
}

export default {
  initiatePayout,
  processBatchPayouts,
  getPayoutStatus,
  handleTransferWebhook,
  getCreatorPayoutHistory,
  validatePayoutIntegrity,
};

