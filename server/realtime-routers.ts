import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { chatManager } from "./websocket-chat";

/**
 * Real-time chat procedures
 * These work with WebSocket connections for live updates
 */
export const realtimeRouter = router({
  // Send message to stream chat
  sendMessage: protectedProcedure
    .input(z.object({
      streamId: z.string(),
      message: z.string().min(1).max(500),
    }))
    .mutation(({ ctx, input }) => {
      const chatMessage = chatManager.addMessage(
        input.streamId,
        ctx.user.id,
        ctx.user.name || "Anonymous",
        input.message,
        false // isCreator - would need to check actual creator status
      );

      return chatMessage;
    }),

  // Get chat history
  getChatHistory: protectedProcedure
    .input(z.object({
      streamId: z.string(),
      limit: z.number().min(1).max(100).optional(),
    }))
    .query(({ input }) => {
      return chatManager.getMessages(input.streamId, input.limit || 50);
    }),

  // Join stream chat
  joinStream: protectedProcedure
    .input(z.object({ streamId: z.string() }))
    .mutation(({ ctx, input }) => {
      chatManager.userJoin(input.streamId, ctx.user.id, ctx.user.name || "Anonymous");
      return { success: true };
    }),

  // Leave stream chat
  leaveStream: protectedProcedure
    .input(z.object({ streamId: z.string() }))
    .mutation(({ ctx, input }) => {
      chatManager.userLeave(input.streamId, ctx.user.id);
      return { success: true };
    }),

  // Get active user count
  getActiveUsers: protectedProcedure
    .input(z.object({ streamId: z.string() }))
    .query(({ input }) => {
      return {
        count: chatManager.getActiveUserCount(input.streamId),
      };
    }),

  // Pin message (creator only)
  pinMessage: protectedProcedure
    .input(z.object({
      streamId: z.string(),
      messageId: z.string(),
    }))
    .mutation(({ input }) => {
      const success = chatManager.pinMessage(input.streamId, input.messageId, true);
      return { success };
    }),

  // Delete message (creator only)
  deleteMessage: protectedProcedure
    .input(z.object({
      streamId: z.string(),
      messageId: z.string(),
    }))
    .mutation(({ input }) => {
      const success = chatManager.deleteMessage(input.streamId, input.messageId, true);
      return { success };
    }),

  // Mute user (creator only)
  muteUser: protectedProcedure
    .input(z.object({
      streamId: z.string(),
      userId: z.string(),
    }))
    .mutation(({ input }) => {
      const success = chatManager.muteUser(input.streamId, input.userId, true);
      return { success };
    }),

  // Ban user (creator only)
  banUser: protectedProcedure
    .input(z.object({
      streamId: z.string(),
      userId: z.string(),
    }))
    .mutation(({ input }) => {
      const success = chatManager.banUser(input.streamId, input.userId, true);
      return { success };
    }),

  // Get stream stats
  getStreamStats: protectedProcedure
    .input(z.object({ streamId: z.string() }))
    .query(({ input }) => {
      return chatManager.getStreamStats(input.streamId);
    }),

  // Clear chat (admin only)
  clearChat: protectedProcedure
    .input(z.object({ streamId: z.string() }))
    .mutation(({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const success = chatManager.clearStreamChat(input.streamId);
      return { success };
    }),
});

