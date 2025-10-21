/**
 * WebSocket Real-Time Chat Service
 * Handles live chat during streams with high concurrency
 */

import { EventEmitter } from "events";

interface ChatMessage {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  isCreator: boolean;
  isPinned?: boolean;
}

interface StreamChat {
  streamId: string;
  messages: ChatMessage[];
  activeUsers: Set<string>;
  maxMessages: number;
}

/**
 * In-memory chat manager
 * In production, use Redis for distributed chat across multiple servers
 */
export class ChatManager extends EventEmitter {
  private streams: Map<string, StreamChat> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds
  private readonly MAX_MESSAGES_PER_STREAM = 1000;

  /**
   * Create or get stream chat
   */
  getOrCreateStream(streamId: string): StreamChat {
    if (!this.streams.has(streamId)) {
      this.streams.set(streamId, {
        streamId,
        messages: [],
        activeUsers: new Set(),
        maxMessages: this.MAX_MESSAGES_PER_STREAM,
      });
    }
    return this.streams.get(streamId)!;
  }

  /**
   * Add message to stream chat
   */
  addMessage(
    streamId: string,
    userId: string,
    userName: string,
    message: string,
    isCreator: boolean
  ): ChatMessage {
    const stream = this.getOrCreateStream(streamId);

    const chatMessage: ChatMessage = {
      id: `${streamId}-${Date.now()}-${Math.random()}`,
      streamId,
      userId,
      userName,
      message,
      timestamp: new Date(),
      isCreator,
    };

    stream.messages.push(chatMessage);

    // Keep only last N messages
    if (stream.messages.length > stream.maxMessages) {
      stream.messages = stream.messages.slice(-stream.maxMessages);
    }

    // Emit message event
    this.emit("message", chatMessage);

    return chatMessage;
  }

  /**
   * Get chat history for stream
   */
  getMessages(streamId: string, limit: number = 50): ChatMessage[] {
    const stream = this.streams.get(streamId);
    if (!stream) return [];

    return stream.messages.slice(-limit);
  }

  /**
   * User joins stream chat
   */
  userJoin(streamId: string, userId: string, userName: string): void {
    const stream = this.getOrCreateStream(streamId);
    stream.activeUsers.add(userId);

    // Track user sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(`${streamId}-${userId}`);

    this.emit("user-join", { streamId, userId, userName });
  }

  /**
   * User leaves stream chat
   */
  userLeave(streamId: string, userId: string): void {
    const stream = this.streams.get(streamId);
    if (!stream) return;

    stream.activeUsers.delete(userId);

    // Clean up if no more users
    if (stream.activeUsers.size === 0) {
      this.streams.delete(streamId);
    }

    this.emit("user-leave", { streamId, userId });
  }

  /**
   * Get active user count for stream
   */
  getActiveUserCount(streamId: string): number {
    const stream = this.streams.get(streamId);
    return stream ? stream.activeUsers.size : 0;
  }

  /**
   * Pin message (creator only)
   */
  pinMessage(streamId: string, messageId: string, isCreator: boolean): boolean {
    if (!isCreator) return false;

    const stream = this.streams.get(streamId);
    if (!stream) return false;

    const message = stream.messages.find((m) => m.id === messageId);
    if (!message) return false;

    message.isPinned = true;
    this.emit("message-pinned", { streamId, messageId });

    return true;
  }

  /**
   * Delete message (creator or admin)
   */
  deleteMessage(streamId: string, messageId: string, isCreator: boolean): boolean {
    if (!isCreator) return false;

    const stream = this.streams.get(streamId);
    if (!stream) return false;

    const index = stream.messages.findIndex((m) => m.id === messageId);
    if (index === -1) return false;

    stream.messages.splice(index, 1);
    this.emit("message-deleted", { streamId, messageId });

    return true;
  }

  /**
   * Mute user in stream
   */
  muteUser(streamId: string, userId: string, isCreator: boolean): boolean {
    if (!isCreator) return false;
    // In production, store muted users in database
    this.emit("user-muted", { streamId, userId });
    return true;
  }

  /**
   * Ban user from stream
   */
  banUser(streamId: string, userId: string, isCreator: boolean): boolean {
    if (!isCreator) return false;

    this.userLeave(streamId, userId);
    this.emit("user-banned", { streamId, userId });

    return true;
  }

  /**
   * Get stream stats
   */
  getStreamStats(streamId: string) {
    const stream = this.streams.get(streamId);
    if (!stream) return null;

    return {
      streamId,
      activeUsers: stream.activeUsers.size,
      messageCount: stream.messages.length,
      createdAt: stream.messages[0]?.timestamp || new Date(),
    };
  }

  /**
   * Clear stream chat (admin)
   */
  clearStreamChat(streamId: string): boolean {
    const stream = this.streams.get(streamId);
    if (!stream) return false;

    stream.messages = [];
    this.emit("chat-cleared", { streamId });

    return true;
  }
}

// Global chat manager instance
export const chatManager = new ChatManager();

