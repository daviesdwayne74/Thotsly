import Stripe from "stripe";
import { getStripeCustomer, createStripeCustomer } from "./db-stripe";
import * as db from "./db";
import { v4 as uuidv4 } from "uuid";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * Get or create Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string, email: string, name: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
  }

  // Check if customer already exists
  const existing = await getStripeCustomer(userId);
  if (existing) {
    return existing.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { userId },
  });

  // Save to database
  await createStripeCustomer({
    id: uuidv4(),
    userId,
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

/**
 * Create a subscription for a creator
 */
export async function createSubscriptionCheckout(
  userId: string,
  creatorId: string,
  creatorStripeAccountId: string,
  priceInCents: number
) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }
  const user = await db.getUser(userId);
  if (!user) throw new Error("User not found");

  const creator = await db.getCreatorProfile(creatorId);
  if (!creator) throw new Error("Creator not found");

  const customerId = await getOrCreateStripeCustomer(userId, user.email || "", user.name || "");

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${creator.displayName} Monthly Subscription`,
            description: creator.bio || "Creator subscription",
          },
          unit_amount: priceInCents,
          recurring: {
            interval: "month",
            interval_count: 1,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/subscription-success?creator=${creatorId}`,
    cancel_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/creator/${creatorId}`,
    metadata: {
      userId,
      creatorId,
    },
  });

  return session.url;
}

/**
 * Create a one-time payment checkout (PPV or merch)
 */
export async function createPaymentCheckout(
  userId: string,
  amount: number,
  description: string,
  type: "ppv" | "merch" | "tip",
  metadata: Record<string, string>
) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }
  const user = await db.getUser(userId);
  if (!user) throw new Error("User not found");

  const customerId = await getOrCreateStripeCustomer(userId, user.email || "", user.name || "");

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: description,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/payment-success?type=${type}`,
    cancel_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/`,
    metadata: {
      userId,
      type,
      ...metadata,
    },
  });

  return session.url;
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const creatorId = session.metadata?.creatorId;

      if (userId && creatorId && session.mode === "subscription") {
        // Create subscription record
        await db.createSubscription({
          id: uuidv4(),
          userId,
          creatorId,
          status: "active",
          amountPaid: (session.amount_total || 0) / 100,
        });

        // Update creator stats
        const creator = await db.getCreatorProfile(creatorId);
        if (creator) {
          await db.updateCreatorProfile(creatorId, {
            totalSubscribers: creator.totalSubscribers + 1,
            totalEarnings: creator.totalEarnings + (session.amount_total || 0),
          });
        }
      }
      break;
    }

    case "invoice.payment_succeeded": {
      // Handle recurring payment
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // Mark subscription as cancelled in database
      break;
    }
  }
}

export default stripe;

