import { TRPCError } from "@trpc/server";
import { logCriticalIssue, logPaymentOperation, LogLevel } from "./payment-logger";

export interface ErrorNotification {
  type: "error" | "warning" | "info" | "success";
  message: string;
  code?: string;
  creatorId?: string;
  userId?: string;
  timestamp: Date;
}

export class PaymentErrorHandler {
  static handlePaymentError(error: unknown, context: any): TRPCError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "Payment Error",
      message: errorMessage,
      status: "error",
      errorDetails: error instanceof Error ? error.stack : undefined,
      metadata: context,
    });

    // Stripe-specific errors
    if (errorMessage.includes("stripe")) {
      if (errorMessage.includes("authentication")) {
        return new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment authentication failed. Please try again.",
        });
      }
      if (errorMessage.includes("rate_limit")) {
        return new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many payment requests. Please wait a moment and try again.",
        });
      }
      if (errorMessage.includes("card_error")) {
        return new TRPCError({
          code: "BAD_REQUEST",
          message: "Card declined. Please check your payment method.",
        });
      }
    }

    // Database errors
    if (errorMessage.includes("database") || errorMessage.includes("ECONNREFUSED")) {
      return new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database error. Please try again later.",
      });
    }

    // Generic error
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An error occurred processing your payment. Please contact support.",
    });
  }

  static handlePayoutError(error: unknown, context: any): TRPCError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "Payout Error",
      message: errorMessage,
      status: "error",
      errorDetails: error instanceof Error ? error.stack : undefined,
      metadata: context,
    });

    // Stripe Connect errors
    if (errorMessage.includes("stripe")) {
      if (errorMessage.includes("not_connected")) {
        return new TRPCError({
          code: "BAD_REQUEST",
          message: "Stripe account not connected. Please complete onboarding.",
        });
      }
      if (errorMessage.includes("insufficient_funds")) {
        return new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient funds for payout. Please try again later.",
        });
      }
    }

    // Insufficient balance
    if (errorMessage.includes("insufficient") || errorMessage.includes("balance")) {
      return new TRPCError({
        code: "BAD_REQUEST",
        message: "Insufficient balance for payout.",
      });
    }

    // Generic error
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An error occurred processing your payout. Please contact support.",
    });
  }

  static createNotification(
    type: "error" | "warning" | "info" | "success",
    message: string,
    code?: string,
    creatorId?: string,
    userId?: string
  ): ErrorNotification {
    return {
      type,
      message,
      code,
      creatorId,
      userId,
      timestamp: new Date(),
    };
  }
}

export class NotificationService {
  static async notifyCreator(
    creatorId: string,
    notification: ErrorNotification
  ): Promise<void> {
    // In a real application, this would send email/SMS/in-app notifications
    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "Creator Notification",
      message: notification.message,
      creatorId: creatorId,
      status: "sent",
      metadata: notification,
    });

    // TODO: Implement actual notification delivery
    // - Email notification
    // - SMS notification
    // - In-app notification
    // - Webhook to external service
  }

  static async notifyAdmin(
    notification: ErrorNotification
  ): Promise<void> {
    // In a real application, this would alert admins of critical issues
    if (notification.type === "error") {
      logPaymentOperation({
        timestamp: new Date(),
        level: LogLevel.ERROR,
        operation: "Admin Alert",
        message: notification.message,
        status: "alert",
        metadata: notification,
      });

      // TODO: Implement actual admin notification delivery
      // - Email to admin
      // - Slack notification
      // - PagerDuty alert
      // - SMS alert
    }
  }

  static async notifyPaymentSuccess(
    creatorId: string,
    userId: string,
    amount: number
  ): Promise<void> {
    const notification = this.createSuccessNotification(
      `Payment received: $${amount.toFixed(2)}`,
      creatorId
    );

    await this.notifyCreator(creatorId, notification);

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "Payment Success Notification",
      message: `Payment success for creator ${creatorId} by user ${userId} for $${amount.toFixed(2)}`,
      creatorId,
      userId,
      amount,
      status: "success",
    });
  }

  static async notifyPayoutSuccess(
    creatorId: string,
    amount: number,
    arrivalDate: Date
  ): Promise<void> {
    const notification = this.createSuccessNotification(
      `Payout initiated: $${amount.toFixed(2)} arriving on ${arrivalDate.toLocaleDateString()}`,
      creatorId
    );

    await this.notifyCreator(creatorId, notification);

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "Payout Success Notification",
      message: `Payout success for creator ${creatorId} for $${amount.toFixed(2)} arriving on ${arrivalDate.toLocaleDateString()}`,
      creatorId,
      amount,
      status: "success",
      metadata: { arrivalDate: arrivalDate.toISOString() },
    });
  }

  static async notifyPayoutFailure(
    creatorId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    const notification = this.createErrorNotification(
      `Payout failed: $${amount.toFixed(2)} - ${reason}`,
      "PAYOUT_FAILED",
      creatorId
    );

    await this.notifyCreator(creatorId, notification);
    await this.notifyAdmin(notification);

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      operation: "Payout Failure Notification",
      message: `Payout failure for creator ${creatorId} for $${amount.toFixed(2)}. Reason: ${reason}`,
      creatorId,
      amount,
      status: "failed",
      metadata: { reason },
    });
  }

  static async notifyTierUpgrade(
    creatorId: string,
    oldTier: string,
    newTier: string,
    newFeePercentage: number
  ): Promise<void> {
    const notification = this.createSuccessNotification(
      `Congratulations! Your tier has been upgraded from ${oldTier} to ${newTier}. Your new platform fee is ${newFeePercentage}%.`,
      creatorId
    );

    await this.notifyCreator(creatorId, notification);

    logPaymentOperation({
      timestamp: new Date(),
      level: LogLevel.INFO,
      operation: "Tier Upgrade Notification",
      message: `Creator ${creatorId} upgraded from ${oldTier} to ${newTier} with ${newFeePercentage}% fee.`,
      creatorId,
      status: "success",
      metadata: { oldTier, newTier, newFeePercentage },
    });
  }

  private static createSuccessNotification(
    message: string,
    creatorId?: string
  ): ErrorNotification {
    return {
      type: "success",
      message,
      creatorId,
      timestamp: new Date(),
    };
  }

  private static createErrorNotification(
    message: string,
    code: string,
    creatorId?: string
  ): ErrorNotification {
    return {
      type: "error",
      message,
      code,
      creatorId,
      timestamp: new Date(),
    };
  }
}

