import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { getDb } from "./db";
import { users, creatorProfiles, posts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Admin-only procedure wrapper
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Get platform statistics
  getStats: adminProcedure.query(async ({ ctx }) => {
    const db_inst = await getDb();
    if (!db_inst) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
    }

    const allUsers = await db_inst.select().from(users);
    const allCreators = await db_inst.select().from(creatorProfiles);
    const allPosts = await db_inst.select().from(posts);

    return {
      totalUsers: allUsers.length,
      totalCreators: allCreators.length,
      totalPosts: allPosts.length,
      totalEarnings: allCreators.reduce((sum, c) => sum + c.totalEarnings, 0),
    };
  }),

  // List all users
  listUsers: adminProcedure
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      const db_inst = await getDb();
      if (!db_inst) return [];

      return await db_inst.select().from(users).limit(input.limit).offset(input.offset);
    }),

  // List all creators
  listCreators: adminProcedure
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      const db_inst = await getDb();
      if (!db_inst) return [];

      return await db_inst.select().from(creatorProfiles).limit(input.limit).offset(input.offset);
    }),

  // Verify creator
  verifyCreator: adminProcedure
    .input(z.object({ creatorId: z.string() }))
    .mutation(async ({ input }) => {
      await db.updateCreatorProfile(input.creatorId, { isVerified: true });
      return { success: true };
    }),

  // Unverify creator
  unverifyCreator: adminProcedure
    .input(z.object({ creatorId: z.string() }))
    .mutation(async ({ input }) => {
      await db.updateCreatorProfile(input.creatorId, { isVerified: false });
      return { success: true };
    }),

  // Delete post (moderation)
  deletePost: adminProcedure
    .input(z.object({ postId: z.string(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      await db.deletePost(input.postId);
      // Could log moderation action here
      return { success: true };
    }),

  // Suspend user
  suspendUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      const db_inst = await getDb();
      if (!db_inst) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
      }

      // Add suspension logic - would need a suspended field in users table
      return { success: true };
    }),

  // Get platform earnings
  getPlatformEarnings: adminProcedure.query(async ({ ctx }) => {
    const db_inst = await getDb();
    if (!db_inst) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
    }

    const allCreators = await db_inst.select().from(creatorProfiles);
    const totalEarnings = allCreators.reduce((sum, c) => sum + c.totalEarnings, 0);
    
    // Calculate platform fees (assuming variable fee structure)
    const platformFees = Math.round(totalEarnings * 0.05); // 5% average

    return {
      totalEarnings,
      platformFees,
      creatorPayouts: totalEarnings - platformFees,
    };
  }),

  // Get recent transactions
  getRecentTransactions: adminProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      // Would need to implement transaction listing
      return [];
    }),
});

