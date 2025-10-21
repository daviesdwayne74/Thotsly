import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { paymentRouter } from "./payment-routers";
import { payoutRouter } from "./payout-routers";
import { contentRouter } from "./content-routers";
import { merchRouter } from "./merch-routers";
import { discoveryRouter } from "./discovery-routers";
import { adminRouter } from "./admin-routers";
import { adminPaymentRouter } from "./admin-payment-routers";
import { uploadRouter } from "./upload-routers";
import { messagingRouter } from "./messaging-routers";
import { streamingRouter } from "./streaming-routers";
import { featuresRouter } from "./features-routers";
import { applicationRouter } from "./application-routers";
import { verificationRouter } from "./verification-routers";
import { emailVodRouter } from "./email-vod-routers";
import { realtimeRouter } from "./realtime-routers";
import { analyticsRouter } from "./analytics-routers";
import { eliteRouter } from "./elite-routers";
import { badgeRouter } from "./badge-routers";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { wishlistRouter } from "./wishlist-routers";
import { recommendationRouter } from "./recommendation-routers";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { v4 as uuidv4 } from "uuid";

export const appRouter = router({
  system: systemRouter,
  wishlist: wishlistRouter,
  recommendation: recommendationRouter,
  payment: paymentRouter,
  payout: payoutRouter,
  content: contentRouter,
  merch: merchRouter,
  discovery: discoveryRouter,
  admin: adminRouter,
  adminPayment: adminPaymentRouter,
  upload: uploadRouter,
  messaging: messagingRouter,
  streaming: streamingRouter,
  features: featuresRouter,
  application: applicationRouter,
  verification: verificationRouter,
  emailVod: emailVodRouter,
  realtime: realtimeRouter,
  analytics: analyticsRouter,
  elite: eliteRouter,
  badges: badgeRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ CREATOR PROCEDURES ============
  creators: router({
    // Get creator profile
    getProfile: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await db.getCreatorProfile(input.id);
      }),

    // Get creator by user ID
    getByUserId: publicProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await db.getCreatorProfileByUserId(input.userId);
      }),

    // List all creators
    list: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await db.getAllCreators(input.limit);
      }),

    // Create creator profile (protected)
    create: protectedProcedure
      .input(z.object({
        displayName: z.string().min(1),
        bio: z.string().optional(),
        subscriptionPrice: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getCreatorProfileByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Creator profile already exists" });
        }

        const profile = await db.createCreatorProfile({
          id: uuidv4(),
          userId: ctx.user.id,
          displayName: input.displayName,
          bio: input.bio,
          subscriptionPrice: input.subscriptionPrice,
        });

        // Update user role to creator
        await db.upsertUser({ id: ctx.user.id, role: "creator" });

        return profile;
      }),

    // Update creator profile
    update: protectedProcedure
      .input(z.object({
        displayName: z.string().optional(),
        bio: z.string().optional(),
        subscriptionPrice: z.number().optional(),
        avatarUrl: z.string().optional(),
        bannerUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getCreatorProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found" });
        }

        await db.updateCreatorProfile(profile.id, input);
        return await db.getCreatorProfile(profile.id);
      }),
  }),

  // ============ POST PROCEDURES ============
  posts: router({
    // Get single post
    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await db.getPost(input.id);
      }),

    // Get creator's posts
    getByCreator: publicProcedure
      .input(z.object({ creatorId: z.string(), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await db.getCreatorPosts(input.creatorId, input.limit);
      }),

    // Get feed (all posts)
    feed: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await db.getAllPosts(input.limit);
      }),

    // Create post (protected)
    create: protectedProcedure
      .input(z.object({
        content: z.string().optional(),
        mediaUrls: z.string().optional(),
        mediaType: z.enum(["text", "image", "video", "mixed"]).default("text"),
        isPaid: z.boolean().default(false),
        price: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getCreatorProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Must be a creator to post" });
        }

        const post = await db.createPost({
          id: uuidv4(),
          creatorId: profile.id,
          content: input.content,
          mediaUrls: input.mediaUrls,
          mediaType: input.mediaType,
          isPaid: input.isPaid,
          price: input.price,
        });

        return post;
      }),

    // Delete post
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getPost(input.id);
        if (!post) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
        }

        const profile = await db.getCreatorProfileByUserId(ctx.user.id);
        if (!profile || profile.id !== post.creatorId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete this post" });
        }

        await db.deletePost(input.id);
        return { success: true };
      }),
  }),

  // ============ SUBSCRIPTION PROCEDURES ============
  subscriptions: router({
    // Check if user is subscribed to creator
    check: protectedProcedure
      .input(z.object({ creatorId: z.string() }))
      .query(async ({ ctx, input }) => {
        return await db.checkSubscription(ctx.user.id, input.creatorId);
      }),

    // Get user's subscriptions
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserSubscriptions(ctx.user.id);
      }),

    // Get creator's subscribers
    getSubscribers: protectedProcedure
      .input(z.object({ creatorId: z.string() }))
      .query(async ({ ctx, input }) => {
        const profile = await db.getCreatorProfile(input.creatorId);
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Creator not found" });
        }

        // Only creator can see their own subscribers
        const userProfile = await db.getCreatorProfileByUserId(ctx.user.id);
        if (!userProfile || userProfile.id !== input.creatorId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot view these subscribers" });
        }

        return await db.getCreatorSubscribers(input.creatorId);
      }),

    // Subscribe to creator
    subscribe: protectedProcedure
      .input(z.object({ creatorId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.checkSubscription(ctx.user.id, input.creatorId);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Already subscribed" });
        }

        const creator = await db.getCreatorProfile(input.creatorId);
        if (!creator) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Creator not found" });
        }

        const subscription = await db.createSubscription({
          id: uuidv4(),
          userId: ctx.user.id,
          creatorId: input.creatorId,
          amountPaid: creator.subscriptionPrice,
          status: "active",
        });

        // Update creator subscriber count
        await db.updateCreatorProfile(input.creatorId, {
          totalSubscribers: creator.totalSubscribers + 1,
          totalEarnings: creator.totalEarnings + creator.subscriptionPrice,
        });

        return subscription;
      }),

    // Cancel subscription
    cancel: protectedProcedure
      .input(z.object({ creatorId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const sub = await db.checkSubscription(ctx.user.id, input.creatorId);
        if (!sub) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
        }

        await db.updateSubscription(sub.id, { status: "cancelled" });
        return { success: true };
      }),
  }),

  // ============ MESSAGE PROCEDURES ============
  messages: router({
    // Get conversation
    getConversation: protectedProcedure
      .input(z.object({ userId: z.string(), limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return await db.getConversation(ctx.user.id, input.userId, input.limit);
      }),

    // Send message
    send: protectedProcedure
      .input(z.object({
        recipientId: z.string(),
        content: z.string().min(1),
        mediaUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const message = await db.createMessage({
          id: uuidv4(),
          senderId: ctx.user.id,
          recipientId: input.recipientId,
          content: input.content,
          mediaUrl: input.mediaUrl,
        });

        return message;
      }),

    // Mark as read
    markRead: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.markMessageAsRead(input.id);
        return { success: true };
      }),
  }),

  // ============ LIKE PROCEDURES ============
  likes: router({
    // Check if user liked post
    check: protectedProcedure
      .input(z.object({ postId: z.string() }))
      .query(async ({ ctx, input }) => {
        return await db.checkLike(ctx.user.id, input.postId);
      }),

    // Like post
    create: protectedProcedure
      .input(z.object({ postId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getPost(input.postId);
        if (!post) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
        }

        const existing = await db.checkLike(ctx.user.id, input.postId);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Already liked" });
        }

        await db.createLike({
          id: uuidv4(),
          userId: ctx.user.id,
          postId: input.postId,
        });

        return { success: true };
      }),

    // Unlike post
    delete: protectedProcedure
      .input(z.object({ postId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteLike(ctx.user.id, input.postId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

