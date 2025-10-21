/**
 * Stripe Connect Integration
 * Handles creator account onboarding, banking information, and payout management
 */

import Stripe from "stripe";
import { getDb } from "./db";
import { stripeConnectAccounts, creatorPayouts } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * Create a Stripe Connect account for a creator
 */
export async function createConnectedAccount(
  creatorId: string,
  email: string,
  country: string = "US",
  type: "express" | "custom" = "express"
) {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
  }

  const accountData: Stripe.AccountCreateParams = {
    type,
    email,
    country,
    metadata: { creatorId },
  };

  if (type === "express") {
    accountData.capabilities = {
      card_payments: { requested: true },
      transfers: { requested: true },
    };
  }

  const account = await stripe.accounts.create(accountData);

  // Save to database
  const db = await getDb();
  if (db) {
    await db.insert(stripeConnectAccounts).values({
      id: uuidv4(),
      creatorId,
      stripeConnectAccountId: account.id,
      type,
      status: "pending",
      createdAt: new Date(),
    });
  }

  return account.id;
}

/**
 * Create an account link for onboarding (Express account)
 */
export async function createAccountLink(
  stripeConnectAccountId: string,
  refreshUrl: string,
  returnUrl: string
) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const link = await stripe.accountLinks.create({
    account: stripeConnectAccountId,
    type: "account_onboarding",
    refresh_url: refreshUrl,
    return_url: returnUrl,
  });

  return link.url;
}

/**
 * Get connected account details
 */
export async function getConnectedAccount(stripeConnectAccountId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  return await stripe.accounts.retrieve(stripeConnectAccountId);
}

/**
 * Update connected account banking information
 */
export async function updateBankingInformation(
  stripeConnectAccountId: string,
  bankAccountToken: string
) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const account = await stripe.accounts.update(stripeConnectAccountId, {
    external_account: bankAccountToken,
  });

  return account;
}

/**
 * Create a payout to a connected account
 */
export async function createPayout(
  stripeConnectAccountId: string,
  amountInCents: number,
  description: string = "Creator payout"
) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const payout = await stripe.payouts.create(
    {
      amount: amountInCents,
      currency: "usd",
      description,
    },
    {
      stripeAccount: stripeConnectAccountId,
    }
  );

  return payout;
}

/**
 * Get payout history for a connected account
 */
export async function getPayoutHistory(
  stripeConnectAccountId: string,
  limit: number = 10
) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const payouts = await stripe.payouts.list(
    { limit },
    {
      stripeAccount: stripeConnectAccountId,
    }
  );

  return payouts.data;
}

/**
 * Get connected account from database by creator ID
 */
export async function getConnectedAccountByCreatorId(creatorId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(stripeConnectAccounts)
    .where(eq(stripeConnectAccounts.creatorId, creatorId))
    .limit(1);

  return result[0] || null;
}

/**
 * Update connected account status in database
 */
export async function updateConnectedAccountStatus(
  stripeConnectAccountId: string,
  status: "pending" | "active" | "inactive"
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(stripeConnectAccounts)
    .set({ status })
    .where(eq(stripeConnectAccounts.stripeConnectAccountId, stripeConnectAccountId));
}

/**
 * Calculate and initiate payouts for all creators based on their earnings
 */
export async function processCreatorPayouts() {
  const db = await getDb();
  if (!db) return { success: false, message: "Database not available" };

  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  try {
    // Get all active creators with connected accounts
    const connectedAccounts = await db.select().from(stripeConnectAccounts);

    const payoutResults = [];

    for (const account of connectedAccounts) {
      if (account.status !== "active") continue;

      // Get creator earnings (this would be calculated from transactions)
      // For now, this is a placeholder - you would fetch actual earnings
      const creatorEarnings = 0; // TODO: Calculate from transactions

      if (creatorEarnings > 0) {
        try {
          const payout = await createPayout(
            account.stripeConnectAccountId,
            creatorEarnings,
            `THOTSLY Creator Payout`
          );

          payoutResults.push({
            creatorId: account.creatorId,
            payoutId: payout.id,
            amount: payout.amount,
            status: payout.status,
          });
        } catch (error) {
          payoutResults.push({
            creatorId: account.creatorId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    return {
      success: true,
      payoutsProcessed: payoutResults.length,
      results: payoutResults,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default stripe;

