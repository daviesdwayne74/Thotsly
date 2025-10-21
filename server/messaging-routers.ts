import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { v4 as uuidv4 } from "uuid";
import { messages } from "../drizzle/schema";
import { getDb, getUser } from "./db";
import { eq } from "drizzle-orm";

export const messagingRouter = router({
  // Send direct message
  sendMessage: protectedProcedure
    .input(
      z.object({
        recipientId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const recipient = await getUser(input.recipientId);
      if (!recipient) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Recipient not found" });
      }

      const db_inst = await getDb();
      if (!db_inst) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
      }

      const message = {
        id: uuidv4(),
        senderId: ctx.user.id,
        recipientId: input.recipientId,
        content: input.content,
        isRead: false,
      };

      await db_inst.insert(messages).values(message);
      return message;
    }),

  // Get conversation with user
  getConversation: protectedProcedure
    .input(z.object({ userId: z.string(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const db_inst = await getDb();
      if (!db_inst) return [];

      const allMessages = await db_inst.select().from(messages);
      return allMessages
        .filter(
          (m) =>
            (m.senderId === ctx.user.id && m.recipientId === input.userId) ||
            (m.senderId === input.userId && m.recipientId === ctx.user.id)
        )
        .slice(-input.limit);
    }),

  // Get all conversations
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const db_inst = await getDb();
    if (!db_inst) return [];

    const allMessages = await db_inst.select().from(messages);
    const conversations = new Map();

    for (const msg of allMessages) {
      if (msg.senderId === ctx.user.id || msg.recipientId === ctx.user.id) {
        const otherUserId = msg.senderId === ctx.user.id ? msg.recipientId : msg.senderId;
        if (!conversations.has(otherUserId)) {
          conversations.set(otherUserId, msg);
        }
      }
    }

    return Array.from(conversations.values());
  }),

  // Mark message as read
  markAsRead: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db_inst = await getDb();
      if (!db_inst) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
      }

      await db_inst
        .update(messages)
        .set({ isRead: true })
        .where(eq(messages.id, input.messageId));

      return { success: true };
    }),

  // Send mass DM to subscribers
  sendMassDM: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Must be a creator" });
      }

      const subscribers = await db.getCreatorSubscribers(profile.id);
      const db_inst = await getDb();
      if (!db_inst) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
      }

      for (const subscriber of subscribers) {
        await db_inst.insert(messages).values({
          id: uuidv4(),
          senderId: ctx.user.id,
          recipientId: subscriber.userId,
          content: input.content,
          isRead: false,
        });
      }

      return { sentCount: subscribers.length };
    }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db_inst = await getDb();
    if (!db_inst) return 0;

    const allMessages = await db_inst.select().from(messages);
    return allMessages.filter((m) => m.recipientId === ctx.user.id && !m.isRead).length;
  }),
});

