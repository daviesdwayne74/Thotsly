/**
 * Stripe Webhooks Handler
 * Handles all Stripe webhook events for payments and payouts
 * Integrates with payment and payout processors
 */

import Stripe from "stripe";
import { handlePaymentSuccessWebhook } from "./payment-processor";
import { handleTransferWebhook } from "./payout-processor";
import { logPaymentOperation, LogLevel } from "./payment-logger";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Verify Stripe webhook signature
 * Ensures the webhook came from Stripe and hasn't been tampered with
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): Stripe.Event | null {
  if (!stripe || !webhookSecret) {
    console.error("[Stripe Webhooks] Stripe not configured");
    return null;
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return event;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Stripe Webhooks] Webhook signature verification failed:", errorMessage);
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.WARN,
      operation: "webhook_verification",
      status: "failed",
      message: `Webhook signature verification failed: ${errorMessage}`,
    });
    return null;
  }
}

/**
 * Handle payment intent succeeded event
 * Called when a payment is successfully completed
 */
async function handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
  try {
    await handlePaymentSuccessWebhook(event);
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "payment_intent_succeeded",
      status: "success",
      message: "Payment intent succeeded webhook processed",
      metadata: { eventId: event.id },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Stripe Webhooks] Error handling payment intent succeeded:", errorMessage);
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "payment_intent_succeeded",
      status: "failed",
      message: `Failed to process payment intent succeeded webhook: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : undefined,
      metadata: { eventId: event.id },
    });
  }
}

/**
 * Handle payment intent failed event
 * Called when a payment fails
 */
async function handlePaymentIntentFailed(event: Stripe.Event): Promise<void> {
  try {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.WARN,
      operation: "payment_intent_failed",
      status: "failed",
      amount: paymentIntent.amount,
      message: `Payment intent failed: ${paymentIntent.last_payment_error?.message || "Unknown reason"}`,
      metadata: {
        eventId: event.id,
        paymentIntentId: paymentIntent.id,
        lastError: paymentIntent.last_payment_error,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Stripe Webhooks] Error handling payment intent failed:", errorMessage);
  }
}

/**
 * Handle charge refunded event
 * Called when a charge is refunded
 */
async function handleChargeRefunded(event: Stripe.Event): Promise<void> {
  try {
    const charge = event.data.object as Stripe.Charge;

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "charge_refunded",
      status: "refunded",
      amount: charge.amount_refunded,
      message: `Charge refunded: $${(charge.amount_refunded / 100).toFixed(2)}`,
      metadata: {
        eventId: event.id,
        chargeId: charge.id,
        refundReason: charge.refunded ? "Full refund" : "Partial refund",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Stripe Webhooks] Error handling charge refunded:", errorMessage);
  }
}

/**
 * Handle transfer created event
 * Called when a transfer to a connected account is created
 */
async function handleTransferCreated(event: Stripe.Event): Promise<void> {
  try {
    await handleTransferWebhook(event);
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "transfer_created",
      status: "pending",
      message: "Transfer created webhook processed",
      metadata: { eventId: event.id },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Stripe Webhooks] Error handling transfer created:", errorMessage);
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "transfer_created",
      status: "failed",
      message: `Failed to process transfer created webhook: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : undefined,
      metadata: { eventId: event.id },
    });
  }
}

/**
 * Handle transfer paid event
 * Called when a transfer to a connected account is paid
 */
async function handleTransferPaid(event: Stripe.Event): Promise<void> {
  try {
    await handleTransferWebhook(event);
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "transfer_paid",
      status: "paid",
      message: "Transfer paid webhook processed",
      metadata: { eventId: event.id },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Stripe Webhooks] Error handling transfer paid:", errorMessage);
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "transfer_paid",
      status: "failed",
      message: `Failed to process transfer paid webhook: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : undefined,
      metadata: { eventId: event.id },
    });
  }
}

/**
 * Handle transfer failed event
 * Called when a transfer to a connected account fails
 */
async function handleTransferFailed(event: Stripe.Event): Promise<void> {
  try {
    await handleTransferWebhook(event);
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "transfer_failed",
      status: "failed",
      message: "Transfer failed webhook processed",
      metadata: { eventId: event.id },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Stripe Webhooks] Error handling transfer failed:", errorMessage);
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "transfer_failed",
      status: "failed",
      message: `Failed to process transfer failed webhook: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : undefined,
      metadata: { eventId: event.id },
    });
  }
}

/**
 * Handle account updated event
 * Called when a connected account is updated
 */
async function handleAccountUpdated(event: Stripe.Event): Promise<void> {
  try {
    const account = event.data.object as Stripe.Account;

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "account_updated",
      status: "updated",
      message: `Connected account updated: ${account.id}`,
      metadata: {
        eventId: event.id,
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Stripe Webhooks] Error handling account updated:", errorMessage);
  }
}

/**
 * Main webhook handler
 * Routes events to appropriate handlers
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  console.log(`[Stripe Webhooks] Processing event: ${event.type}`);

  const eventType = event.type as string;
  switch (eventType) {
    // Payment events
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event);
      break;

    case "charge.refunded":
      await handleChargeRefunded(event);
      break;

    // Transfer events
    case "transfer.created":
      await handleTransferCreated(event);
      break;

    case "transfer.paid":
      await handleTransferPaid(event);
      break;

    case "transfer.failed":
      await handleTransferFailed(event);
      break;

    // Connected account events
    case "account.updated":
      await handleAccountUpdated(event);
      break;

    default:
      console.log(`[Stripe Webhooks] Unhandled event type: ${event.type}`);
  }
}

export default {
  verifyWebhookSignature,
  handleStripeWebhook,
};

