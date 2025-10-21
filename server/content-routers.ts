import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { v4 as uuidv4 } from "uuid";

export const contentRouter = router({
  // Check if user can access a post
  canAccessPost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await db.getPost(input.postId);
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      // Free posts accessible to everyone
      if (!post.isPaid) {
        return { canAccess: true, reason: "free" };
      }

      // Check subscription for paid posts
      const subscription = await db.checkSubscription(ctx.user.id, post.creatorId);
      if (subscription) {
        return { canAccess: true, reason: "subscribed" };
      }

      return { canAccess: false, reason: "subscription_required", price: post.price };
    }),

  // Get posts user can access
  getAccessiblePosts: protectedProcedure
    .input(z.object({ creatorId: z.string(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const posts = await db.getCreatorPosts(input.creatorId, input.limit);
      
      // Check subscription once
      const subscription = await db.checkSubscription(ctx.user.id, input.creatorId);
      
      // Filter posts based on access
      return posts.filter(post => {
        if (!post.isPaid) return true; // Free posts always accessible
        return subscription !== null; // Paid posts only if subscribed
      });
    }),

  // Get creator's exclusive content (for subscribers)
  getExclusiveContent: protectedProcedure
    .input(z.object({ creatorId: z.string(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const subscription = await db.checkSubscription(ctx.user.id, input.creatorId);
      if (!subscription) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Must be subscribed to view exclusive content" });
      }

      const posts = await db.getCreatorPosts(input.creatorId, input.limit);
      return posts.filter(post => post.isPaid || !post.isPaid); // All posts for subscribers
    }),

  // Create a post with access control
  createPost: protectedProcedure
    .input(
      z.object({
        content: z.string().optional(),
        mediaUrls: z.string().optional(),
        mediaType: z.enum(["text", "image", "video", "mixed"]).default("text"),
        isPaid: z.boolean().default(false),
        price: z.number().default(0),
      })
    )
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

  // Get user's feed with access control
  getFeed: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const subscriptions = await db.getUserSubscriptions(ctx.user.id);
      const subscribedCreatorIds = subscriptions.map(sub => sub.creatorId);

      const allPosts = await db.getAllPosts(input.limit);
      
      // Filter posts: show free posts from everyone, paid posts only from subscriptions
      return allPosts.filter(post => {
        if (!post.isPaid) return true;
        return subscribedCreatorIds.includes(post.creatorId);
      });
    }),
});

