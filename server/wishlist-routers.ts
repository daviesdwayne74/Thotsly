import { z } from "zod";
import { protectedProcedure, router, publicProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { wishlists, wishlistItems, wishlistPurchases } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const wishlistRouter = router({
  // Create wishlist
  createWishlist: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const id = Math.random().toString(36).substring(7);
      await db.insert(wishlists).values({
        id,
        creatorId: ctx.user.id,
        title: input.title,
        description: input.description,
        isActive: true,
      });

      return { id, ...input };
    }),

  // Get creator's wishlists
  getCreatorWishlists: publicProcedure
    .input(z.object({
      creatorId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.select().from(wishlists).where(eq(wishlists.creatorId, input.creatorId));
      return result;
    }),

  // Add item to wishlist
  addWishlistItem: protectedProcedure
    .input(z.object({
      wishlistId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      price: z.number(),
      url: z.string().optional(),
      imageUrl: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const id = Math.random().toString(36).substring(7);
      await db.insert(wishlistItems).values({
        id,
        wishlistId: input.wishlistId,
        title: input.title,
        description: input.description,
        price: Math.round(input.price * 100),
        url: input.url,
        imageUrl: input.imageUrl,
        priority: input.priority || "medium",
      });

      return { id, ...input };
    }),

  // Get wishlist items
  getWishlistItems: publicProcedure
    .input(z.object({
      wishlistId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.select().from(wishlistItems).where(eq(wishlistItems.wishlistId, input.wishlistId));
      return result;
    }),

  // Purchase wishlist item
  purchaseWishlistItem: protectedProcedure
    .input(z.object({
      itemId: z.string(),
      creatorId: z.string(),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get item
      const item = await db.select().from(wishlistItems).where(eq(wishlistItems.id, input.itemId));
      if (!item.length) throw new Error("Item not found");

      const wishlistItem = item[0];
      const amount = wishlistItem.price;
      const platformFee = Math.round(amount * 0.05); // 5%
      const creatorEarnings = amount - platformFee;

      // Create purchase record
      const purchaseId = Math.random().toString(36).substring(7);
      await db.insert(wishlistPurchases).values({
        id: purchaseId,
        itemId: input.itemId,
        buyerId: ctx.user.id,
        creatorId: input.creatorId,
        amount,
        platformFee,
        creatorEarnings,
        status: "completed",
        message: input.message,
      });

      // Mark item as purchased
      await db.update(wishlistItems)
        .set({ isPurchased: true, purchasedBy: ctx.user.id, purchasedAt: new Date() })
        .where(eq(wishlistItems.id, input.itemId));

      return {
        id: purchaseId,
        amount,
        platformFee,
        creatorEarnings,
        status: "completed",
      };
    }),

  // Get creator's wishlist purchases
  getCreatorWishlistPurchases: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.select().from(wishlistPurchases).where(eq(wishlistPurchases.creatorId, input.creatorId));
      return result;
    }),
});

