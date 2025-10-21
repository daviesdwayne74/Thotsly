import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { creatorApplications, portfolioItems } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export const applicationRouter = router({
  // Submit creator application
  submit: protectedProcedure
    .input(z.object({
      displayName: z.string().min(2),
      bio: z.string().min(10),
      category: z.string(),
      statement: z.string().min(50),
      socialLinks: z.record(z.string(), z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const appId = uuid();

      const values: any = {
        id: appId,
        userId: ctx.user.id,
        displayName: input.displayName,
        bio: input.bio,
        category: input.category,
        statement: input.statement,
      };
      if (input.socialLinks) {
        values.socialLinks = JSON.stringify(input.socialLinks);
      }
      await db.insert(creatorApplications).values(values);

      return { applicationId: appId };
    }),

  // Add portfolio item
  addPortfolioItem: protectedProcedure
    .input(z.object({
      applicationId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      mediaUrl: z.string(),
      mediaType: z.enum(["image", "video", "audio"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const itemId = uuid();

      await db.insert(portfolioItems).values({
        id: itemId,
        applicationId: input.applicationId,
        title: input.title,
        description: input.description,
        mediaUrl: input.mediaUrl,
        mediaType: input.mediaType,
      });

      return { itemId };
    }),

  // Get user's application
  getMyApplication: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const app = await db
        .select()
        .from(creatorApplications)
        .where(eq(creatorApplications.userId, ctx.user.id))
        .limit(1);

      if (!app.length) return null;

      const portfolio = await db
        .select()
        .from(portfolioItems)
        .where(eq(portfolioItems.applicationId, app[0].id));

      return {
        ...app[0],
        portfolio,
      };
    }),

  // Get application details (admin only)
  getApplication: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      if (ctx.user.role !== "admin") return null;

      const app = await db
        .select()
        .from(creatorApplications)
        .where(eq(creatorApplications.id, input.applicationId))
        .limit(1);

      if (!app.length) return null;

      const portfolio = await db
        .select()
        .from(portfolioItems)
        .where(eq(portfolioItems.applicationId, app[0].id));

      return {
        ...app[0],
        portfolio,
      };
    }),

  // Get pending applications (admin only)
  getPendingApplications: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      if (ctx.user.role !== "admin") return [];

      return await db
        .select()
        .from(creatorApplications)
        .where(eq(creatorApplications.status, "pending"))
        .orderBy(desc(creatorApplications.submittedAt))
        .limit(50);
    }),

  // Admin review and approval (FINAL DECISION)
  reviewApplication: protectedProcedure
    .input(z.object({
      applicationId: z.string(),
      approved: z.boolean(),
      rejectionReason: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // ONLY ADMINS CAN APPROVE/REJECT - FINAL SAY
      if (ctx.user.role !== "admin") {
        throw new Error("Only administrators can review creator applications");
      }

      // Verify application exists
      const app = await db
        .select()
        .from(creatorApplications)
        .where(eq(creatorApplications.id, input.applicationId))
        .limit(1);

      if (!app.length) {
        throw new Error("Application not found");
      }

      // Admin has FINAL SAY - update application status
      const newStatus = input.approved ? "approved" : "rejected";
      
      await db
        .update(creatorApplications)
        .set({
          status: newStatus,
          rejectionReason: input.rejectionReason,
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
        })
        .where(eq(creatorApplications.id, input.applicationId));

      return {
        success: true,
        status: newStatus,
        message: input.approved
          ? "Creator application APPROVED by admin"
          : "Creator application REJECTED by admin",
        adminDecision: {
          decidedBy: ctx.user.id,
          decidedAt: new Date(),
          reason: input.rejectionReason || "Approved",
        },
      };
    }),

  // Get application status
  getStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const app = await db
        .select()
        .from(creatorApplications)
        .where(eq(creatorApplications.userId, ctx.user.id))
        .limit(1);

      if (!app.length) return null;

      return {
        status: app[0].status,
        submittedAt: app[0].submittedAt,
        reviewedAt: app[0].reviewedAt,
        rejectionReason: app[0].rejectionReason,
        reviewedBy: app[0].reviewedBy,
      };
    }),

  // Get all applications (admin only - for dashboard)
  getAllApplications: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "approved", "rejected"]).optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      if (ctx.user.role !== "admin") return [];

      if (input.status) {
        return await db
          .select()
          .from(creatorApplications)
          .where(eq(creatorApplications.status, input.status))
          .orderBy(desc(creatorApplications.submittedAt))
          .limit(input.limit || 100);
      }

      return await db
        .select()
        .from(creatorApplications)
        .orderBy(desc(creatorApplications.submittedAt))
        .limit(input.limit || 100);
    }),
});

