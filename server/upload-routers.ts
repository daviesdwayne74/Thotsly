import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { v4 as uuidv4 } from "uuid";
import { storagePut } from "./storage";

export const uploadRouter = router({
  // Upload media and return URL
  uploadMedia: protectedProcedure
    .input(
      z.object({
        file: z.string(), // base64 encoded file
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 to buffer
        const buffer = Buffer.from(input.file, "base64");

        // Upload to S3
        const { url, key } = await storagePut(
          `uploads/${ctx.user.id}/${Date.now()}-${input.filename}`,
          buffer,
          input.mimeType
        );

        return { url, key };
      } catch (error) {
        console.error("Upload error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Upload failed" });
      }
    }),

  // Create post with media
  createPostWithMedia: protectedProcedure
    .input(
      z.object({
        content: z.string().optional(),
        mediaUrls: z.array(z.string()).optional(),
        mediaType: z.enum(["text", "image", "video", "mixed"]).default("text"),
        isPaid: z.boolean().default(false),
        price: z.number().default(0),
        scheduledFor: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Must be a creator" });
      }

      const post = await db.createPost({
        id: uuidv4(),
        creatorId: profile.id,
        content: input.content,
        mediaUrls: input.mediaUrls ? JSON.stringify(input.mediaUrls) : null,
        mediaType: input.mediaType,
        isPaid: input.isPaid,
        price: Math.round(input.price * 100),
      });

      return post;
    }),

  // Get creator's draft posts
  getDrafts: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Must be a creator" });
    }

    // Return draft posts (would need isDraft field in schema)
    return [];
  }),

  // Schedule post for later
  schedulePost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        scheduledFor: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Must be a creator" });
      }

      // Update post with scheduled time
      // Would need isScheduled and scheduledAt fields
      return { success: true };
    }),

  // Get upload progress (for large files)
  getUploadProgress: protectedProcedure
    .input(z.object({ uploadId: z.string() }))
    .query(async ({ input }) => {
      // Would track upload progress in cache/db
      return { progress: 100, status: "complete" };
    }),
});

