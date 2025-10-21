import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { emailPreferences, emailLogs, streamRecordings, vodViews } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";

// ============================================================================
// EMAIL NOTIFICATIONS ROUTER
// ============================================================================

export const emailRouter = router({
  // Get email preferences
  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const prefs = await db
        .select()
        .from(emailPreferences)
        .where(eq(emailPreferences.userId, ctx.user.id))
        .limit(1);

      if (!prefs.length) {
        // Create default preferences
        const prefId = uuid();
        await db.insert(emailPreferences).values({
          id: prefId,
          userId: ctx.user.id,
        });
        return {
          id: prefId,
          userId: ctx.user.id,
          newSubscriber: true,
          newMessage: true,
          newTip: true,
          streamNotification: true,
          weeklyDigest: true,
          promotionalEmails: false,
        };
      }

      return prefs[0];
    }),

  // Update email preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      newSubscriber: z.boolean().optional(),
      newMessage: z.boolean().optional(),
      newTip: z.boolean().optional(),
      streamNotification: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
      promotionalEmails: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const prefs = await db
        .select()
        .from(emailPreferences)
        .where(eq(emailPreferences.userId, ctx.user.id))
        .limit(1);

      if (!prefs.length) {
        const prefId = uuid();
        await db.insert(emailPreferences).values({
          id: prefId,
          userId: ctx.user.id,
          ...input,
        });
      } else {
        await db
          .update(emailPreferences)
          .set(input)
          .where(eq(emailPreferences.userId, ctx.user.id));
      }

      return { success: true };
    }),

  // Get email logs
  getEmailLogs: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(emailLogs)
        .where(eq(emailLogs.userId, ctx.user.id))
        .orderBy(desc(emailLogs.sentAt))
        .limit(50);
    }),
});

// ============================================================================
// VOD (VIDEO ON DEMAND) ROUTER
// ============================================================================

export const vodRouter = router({
  // Create VOD from stream recording
  createVod: protectedProcedure
    .input(z.object({
      streamId: z.string(),
      recordingUrl: z.string(),
      thumbnailUrl: z.string().optional(),
      duration: z.number().optional(),
      fileSize: z.number().optional(),
      resolution: z.string().optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const vodId = uuid();

      await db.insert(streamRecordings).values({
        id: vodId,
        streamId: input.streamId,
        creatorId: ctx.user.id,
        recordingUrl: input.recordingUrl,
        thumbnailUrl: input.thumbnailUrl,
        duration: input.duration,
        fileSize: input.fileSize,
        resolution: input.resolution,
        isPublic: input.isPublic !== false,
      });

      return { vodId };
    }),

  // Get creator's VODs
  getCreatorVods: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(streamRecordings)
        .where(eq(streamRecordings.creatorId, ctx.user.id))
        .orderBy(desc(streamRecordings.createdAt));
    }),

  // Get public VODs (for viewers)
  getPublicVods: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(streamRecordings)
        .where(eq(streamRecordings.isPublic, true))
        .orderBy(desc(streamRecordings.viewCount))
        .limit(20);
    }),

  // Record VOD view
  recordView: protectedProcedure
    .input(z.object({
      recordingId: z.string(),
      watchedDuration: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const viewId = uuid();

      await db.insert(vodViews).values({
        id: viewId,
        recordingId: input.recordingId,
        userId: ctx.user.id,
        watchedDuration: input.watchedDuration,
      });

      // Increment view count
      const recording = await db
        .select()
        .from(streamRecordings)
        .where(eq(streamRecordings.id, input.recordingId))
        .limit(1);

      if (recording.length) {
        await db
          .update(streamRecordings)
          .set({ viewCount: (recording[0].viewCount || 0) + 1 })
          .where(eq(streamRecordings.id, input.recordingId));
      }

      return { success: true };
    }),

  // Get VOD details
  getVod: protectedProcedure
    .input(z.object({ vodId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const vod = await db
        .select()
        .from(streamRecordings)
        .where(eq(streamRecordings.id, input.vodId))
        .limit(1);

      if (!vod.length) return null;

      const views = await db
        .select()
        .from(vodViews)
        .where(eq(vodViews.recordingId, input.vodId));

      return {
        ...vod[0],
        totalViews: views.length,
      };
    }),

  // Delete VOD
  deleteVod: protectedProcedure
    .input(z.object({ vodId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const vod = await db
        .select()
        .from(streamRecordings)
        .where(eq(streamRecordings.id, input.vodId))
        .limit(1);

      if (!vod.length || vod[0].creatorId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Delete views first
      await db
        .delete(vodViews)
        .where(eq(vodViews.recordingId, input.vodId));

      // Delete recording
      await db
        .delete(streamRecordings)
        .where(eq(streamRecordings.id, input.vodId));

      return { success: true };
    }),
});

// ============================================================================
// EXPORT ROUTERS
// ============================================================================

export const emailVodRouter = router({
  email: emailRouter,
  vod: vodRouter,
});

