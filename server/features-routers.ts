import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { stories, storyViews, vaultFolders, vaultItems, notifications, referrals, contentFlags, affiliates } from "../drizzle/schema";
import { eq, desc, and, gt } from "drizzle-orm";
import { v4 as uuid } from "uuid";

// ============================================================================
// STORIES ROUTER
// ============================================================================

export const storiesRouter = router({
  create: protectedProcedure
    .input(z.object({
      mediaUrl: z.string(),
      mediaType: z.enum(["image", "video"]),
      caption: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const storyId = uuid();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.insert(stories).values({
        id: storyId,
        creatorId: ctx.user.id,
        mediaUrl: input.mediaUrl,
        mediaType: input.mediaType,
        caption: input.caption,
        expiresAt,
      });

      return { storyId };
    }),

  getCreatorStories: publicProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const now = new Date();
      const creatorStories = await db
        .select()
        .from(stories)
        .where(and(
          eq(stories.creatorId, input.creatorId),
          gt(stories.expiresAt, now)
        ))
        .orderBy(desc(stories.createdAt));

      return creatorStories;
    }),

  viewStory: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(storyViews).values({
        id: uuid(),
        storyId: input.storyId,
        userId: ctx.user.id,
      });

      return { success: true };
    }),
});

// ============================================================================
// VAULT ROUTER
// ============================================================================

export const vaultRouter = router({
  createFolder: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      isPrivate: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const folderId = uuid();
      await db.insert(vaultFolders).values({
        id: folderId,
        creatorId: ctx.user.id,
        name: input.name,
        description: input.description,
        isPrivate: input.isPrivate || false,
      });

      return { folderId };
    }),

  getCreatorFolders: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(vaultFolders)
        .where(eq(vaultFolders.creatorId, ctx.user.id))
        .orderBy(desc(vaultFolders.createdAt));
    }),

  addItemToFolder: protectedProcedure
    .input(z.object({
      folderId: z.string(),
      postId: z.string().optional(),
      title: z.string(),
      mediaUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const itemId = uuid();
      await db.insert(vaultItems).values({
        id: itemId,
        folderId: input.folderId,
        postId: input.postId,
        title: input.title,
        mediaUrl: input.mediaUrl,
      });

      return { itemId };
    }),

  getFolderItems: publicProcedure
    .input(z.object({ folderId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(vaultItems)
        .where(eq(vaultItems.folderId, input.folderId))
        .orderBy(vaultItems.order);
    }),
});

// ============================================================================
// NOTIFICATIONS ROUTER
// ============================================================================

export const notificationsRouter = router({
  getNotifications: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, ctx.user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
    }),

  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, input.notificationId));

      return { success: true };
    }),

  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return 0;

      const result = await db
        .select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.isRead, false)
        ));

      return result.length;
    }),
});

// ============================================================================
// REFERRALS ROUTER
// ============================================================================

export const referralsRouter = router({
  createReferralCode: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const referralCode = `ref-${uuid().slice(0, 8)}`;
      const referralId = uuid();

      await db.insert(referrals).values({
        id: referralId,
        referrerId: ctx.user.id,
        referredUserId: ctx.user.id,
        referralCode,
        status: "active",
      });

      return { referralCode };
    }),

  getReferralStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const referralList = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referrerId, ctx.user.id));

      const totalEarnings = referralList.reduce((sum, ref) => sum + ref.totalEarnings, 0);

      return {
        totalReferrals: referralList.length,
        activeReferrals: referralList.filter(r => r.status === "active").length,
        totalEarnings,
      };
    }),
});

// ============================================================================
// CONTENT MODERATION ROUTER
// ============================================================================

export const moderationRouter = router({
  flagContent: protectedProcedure
    .input(z.object({
      postId: z.string().optional(),
      streamId: z.string().optional(),
      reason: z.enum(["spam", "harassment", "violence", "adult", "copyright", "other"]),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const flagId = uuid();
      await db.insert(contentFlags).values({
        id: flagId,
        postId: input.postId,
        streamId: input.streamId,
        reason: input.reason,
        description: input.description,
        flaggedBy: ctx.user.id,
      });

      return { flagId };
    }),

  getPendingFlags: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      // Only admins can see flags
      if (ctx.user.role !== "admin") return [];

      return await db
        .select()
        .from(contentFlags)
        .where(eq(contentFlags.status, "pending"))
        .orderBy(desc(contentFlags.createdAt))
        .limit(50);
    }),

  reviewFlag: protectedProcedure
    .input(z.object({
      flagId: z.string(),
      approved: z.boolean(),
      action: z.enum(["none", "warning", "suspend", "ban"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Only admins
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");

      await db
        .update(contentFlags)
        .set({
          status: input.approved ? "approved" : "rejected",
          action: input.action,
          reviewedBy: ctx.user.id,
        })
        .where(eq(contentFlags.id, input.flagId));

      return { success: true };
    }),
});

// ============================================================================
// AFFILIATES ROUTER
// ============================================================================

export const affiliatesRouter = router({
  createAffiliateCode: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const affiliateCode = `aff-${uuid().slice(0, 8)}`;
      const affiliateId = uuid();

      await db.insert(affiliates).values({
        id: affiliateId,
        creatorId: ctx.user.id,
        affiliateCode,
      });

      return { affiliateCode };
    }),

  getAffiliateStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.creatorId, ctx.user.id))
        .limit(1);

      if (!affiliate.length) return null;

      return {
        affiliateCode: affiliate[0].affiliateCode,
        commissionRate: affiliate[0].commissionRate,
        totalEarnings: affiliate[0].totalEarnings,
        status: affiliate[0].status,
      };
    }),
});

// ============================================================================
// EXPORT ALL ROUTERS
// ============================================================================

export const featuresRouter = router({
  stories: storiesRouter,
  vault: vaultRouter,
  notifications: notificationsRouter,
  referrals: referralsRouter,
  moderation: moderationRouter,
  affiliates: affiliatesRouter,
});

