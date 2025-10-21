import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { v4 as uuidv4 } from "uuid";
import { merchProducts } from "../drizzle/schema";
import { getDb } from "./db";
import { eq } from "drizzle-orm";

export const merchRouter = router({
  // List creator's merch products
  listByCreator: publicProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      const db_inst = await getDb();
      if (!db_inst) return [];

      return await db_inst
        .select()
        .from(merchProducts)
        .where(eq(merchProducts.creatorId, input.creatorId));
    }),

  // Get single product
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db_inst = await getDb();
      if (!db_inst) return null;

      const result = await db_inst
        .select()
        .from(merchProducts)
        .where(eq(merchProducts.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  // Create merch product (creator only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        price: z.number().positive(),
        inventory: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Must be a creator" });
      }

      const db_inst = await getDb();
      if (!db_inst) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
      }

      const product = {
        id: uuidv4(),
        creatorId: profile.id,
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        price: Math.round(input.price * 100), // Convert to cents
        inventory: input.inventory,
        isActive: true,
      };

      await db_inst.insert(merchProducts).values(product);
      return product;
    }),

  // Update merch product
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        inventory: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Must be a creator" });
      }

      const db_inst = await getDb();
      if (!db_inst) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
      }

      // Verify ownership
      const product = await db_inst
        .select()
        .from(merchProducts)
        .where(eq(merchProducts.id, input.id))
        .limit(1);

      if (!product[0] || product[0].creatorId !== profile.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot modify this product" });
      }

      const updates: any = {};
      if (input.name) updates.name = input.name;
      if (input.description) updates.description = input.description;
      if (input.price) updates.price = Math.round(input.price * 100);
      if (input.inventory !== undefined) updates.inventory = input.inventory;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await db_inst.update(merchProducts).set(updates).where(eq(merchProducts.id, input.id));

      return { success: true };
    }),

  // Delete product
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Must be a creator" });
      }

      const db_inst = await getDb();
      if (!db_inst) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
      }

      // Verify ownership
      const product = await db_inst
        .select()
        .from(merchProducts)
        .where(eq(merchProducts.id, input.id))
        .limit(1);

      if (!product[0] || product[0].creatorId !== profile.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete this product" });
      }

      await db_inst.delete(merchProducts).where(eq(merchProducts.id, input.id));
      return { success: true };
    }),
});

