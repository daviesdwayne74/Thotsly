import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { liveStreams, streamViewers, streamTips, streamChat } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export const streamingRouter = router({
  // Create a new stream
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      isPrivate: z.boolean().optional(),
      isPaid: z.boolean().optional(),
      price: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const streamId = uuid();
      const streamKey = uuid();

      await db.insert(liveStreams).values({
        id: streamId,
        creatorId: ctx.user.id,
        title: input.title,
        description: input.description,
        streamKey,
        status: "scheduled",
        isPrivate: input.isPrivate || false,
        isPaid: input.isPaid || false,
        price: input.price ? Math.round(input.price * 100) : 0,
      });

      return { streamId, streamKey };
    }),

  // Get creator's streams
  getCreatorStreams: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const streams = await db
        .select()
        .from(liveStreams)
        .where(eq(liveStreams.creatorId, ctx.user.id))
        .orderBy(desc(liveStreams.createdAt))
        .limit(50);

      return streams;
    }),

  // Get live streams (public)
  getLive: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];

      const streams = await db
        .select()
        .from(liveStreams)
        .where(eq(liveStreams.status, "live"))
        .orderBy(desc(liveStreams.viewerCount))
        .limit(20);

      return streams;
    }),

  // Get stream by ID
  getStream: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const stream = await db
        .select()
        .from(liveStreams)
        .where(eq(liveStreams.id, input.id))
        .limit(1);

      return stream.length > 0 ? stream[0] : null;
    }),

  // Start streaming
  startStream: protectedProcedure
    .input(z.object({ streamId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(liveStreams)
        .set({
          status: "live",
          startedAt: new Date(),
        })
        .where(
          and(
            eq(liveStreams.id, input.streamId),
            eq(liveStreams.creatorId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // End streaming
  endStream: protectedProcedure
    .input(z.object({ streamId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();
      const stream = await db
        .select()
        .from(liveStreams)
        .where(eq(liveStreams.id, input.streamId))
        .limit(1);

      if (!stream.length) throw new Error("Stream not found");

      const startTime = stream[0].startedAt;
      const duration = startTime ? Math.floor((now.getTime() - startTime.getTime()) / 1000) : 0;

      await db
        .update(liveStreams)
        .set({
          status: "ended",
          endedAt: now,
          duration,
        })
        .where(
          and(
            eq(liveStreams.id, input.streamId),
            eq(liveStreams.creatorId, ctx.user.id)
          )
        );

      return { success: true, duration };
    }),

  // Send tip during stream
  sendTip: protectedProcedure
    .input(z.object({
      streamId: z.string(),
      amount: z.number().min(1),
      message: z.string().optional(),
      isAnonymous: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const tipId = uuid();

      await db.insert(streamTips).values({
        id: tipId,
        streamId: input.streamId,
        userId: ctx.user.id,
        amount: Math.round(input.amount * 100),
        message: input.message,
        isAnonymous: input.isAnonymous || false,
      });

      return { tipId, success: true };
    }),

  // Get stream tips
  getStreamTips: publicProcedure
    .input(z.object({ streamId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const tips = await db
        .select()
        .from(streamTips)
        .where(eq(streamTips.streamId, input.streamId))
        .orderBy(desc(streamTips.createdAt))
        .limit(100);

      return tips;
    }),

  // Send chat message
  sendChatMessage: protectedProcedure
    .input(z.object({
      streamId: z.string(),
      message: z.string().min(1).max(500),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const messageId = uuid();

      await db.insert(streamChat).values({
        id: messageId,
        streamId: input.streamId,
        userId: ctx.user.id,
        message: input.message,
      });

      return { messageId, success: true };
    }),

  // Get stream chat
  getStreamChat: publicProcedure
    .input(z.object({ streamId: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const messages = await db
        .select()
        .from(streamChat)
        .where(eq(streamChat.streamId, input.streamId))
        .orderBy(desc(streamChat.createdAt))
        .limit(input.limit || 50);

      return messages.reverse();
    }),

  // Join stream (track viewer)
  joinStream: protectedProcedure
    .input(z.object({ streamId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const viewerId = uuid();

      await db.insert(streamViewers).values({
        id: viewerId,
        streamId: input.streamId,
        userId: ctx.user.id,
      });

      return { viewerId };
    }),

  // Leave stream
  leaveStream: protectedProcedure
    .input(z.object({ viewerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(streamViewers)
        .set({ leftAt: new Date() })
        .where(eq(streamViewers.id, input.viewerId));

      return { success: true };
    }),

  // Get stream stats
  getStreamStats: publicProcedure
    .input(z.object({ streamId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const stream = await db
        .select()
        .from(liveStreams)
        .where(eq(liveStreams.id, input.streamId))
        .limit(1);

      if (!stream.length) return null;

      const tips = await db
        .select()
        .from(streamTips)
        .where(eq(streamTips.streamId, input.streamId));

      const totalTips = tips.reduce((sum, tip) => sum + tip.amount, 0);

      return {
        stream: stream[0],
        totalTips,
        tipCount: tips.length,
      };
    }),
});

