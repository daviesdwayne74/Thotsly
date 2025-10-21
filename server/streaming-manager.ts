/**
 * Streaming Manager - Handles hundreds of concurrent live streams
 * Uses sharding, connection pooling, and message queuing for scalability
 */

import { EventEmitter } from "events";

// ============================================================================
// STREAM SHARD MANAGER
// ============================================================================

class StreamShard {
  id: string;
  streams: Map<string, StreamState> = new Map();
  viewers: Map<string, Set<string>> = new Map(); // streamId -> userIds
  capacity: number = 10000; // viewers per shard
  currentLoad: number = 0;

  constructor(id: string) {
    this.id = id;
  }

  canAccept(viewers: number): boolean {
    return this.currentLoad + viewers <= this.capacity;
  }

  addViewer(streamId: string, userId: string): boolean {
    if (!this.canAccept(1)) return false;

    if (!this.viewers.has(streamId)) {
      this.viewers.set(streamId, new Set());
    }
    this.viewers.get(streamId)!.add(userId);
    this.currentLoad++;
    return true;
  }

  removeViewer(streamId: string, userId: string): void {
    const viewers = this.viewers.get(streamId);
    if (viewers) {
      viewers.delete(userId);
      this.currentLoad--;
    }
  }

  getLoad(): number {
    return this.currentLoad;
  }
}

interface StreamState {
  id: string;
  creatorId: string;
  title: string;
  status: "scheduled" | "live" | "ended";
  startedAt?: Date;
  viewerCount: number;
  totalViewers: number;
  bitrate: number;
  fps: number;
}

// ============================================================================
// STREAMING MANAGER
// ============================================================================

class StreamingManager extends EventEmitter {
  private shards: Map<string, StreamShard> = new Map();
  private streamToShard: Map<string, string> = new Map(); // streamId -> shardId
  private maxShardsPerServer: number = 10;
  private currentShardCount: number = 0;

  constructor() {
    super();
    this.initializeShards();
  }

  private initializeShards(): void {
    // Start with 3 shards
    for (let i = 0; i < 3; i++) {
      this.createShard();
    }
  }

  private createShard(): void {
    const shardId = `shard-${Date.now()}-${Math.random()}`;
    this.shards.set(shardId, new StreamShard(shardId));
    this.currentShardCount++;
    console.log(`[Streaming] Created shard ${shardId} (total: ${this.currentShardCount})`);
  }

  // Register a new stream
  registerStream(stream: StreamState): string {
    // Find best shard (least loaded)
    let bestShard: StreamShard | null = null;
    let bestShardId: string | null = null;
    let minLoad = Infinity;

    const shardEntries = Array.from(this.shards.entries());
    for (let i = 0; i < shardEntries.length; i++) {
      const [shardId, shard] = shardEntries[i];
      if (shard.canAccept(1) && shard.getLoad() < minLoad) {
        bestShard = shard;
        bestShardId = shardId;
        minLoad = shard.getLoad();
      }
    }

    // Create new shard if needed
    if (!bestShard && this.currentShardCount < this.maxShardsPerServer) {
      this.createShard();
      const shardIds = Array.from(this.shards.keys());
      bestShardId = shardIds[shardIds.length - 1];
      bestShard = this.shards.get(bestShardId)!;
    }

    if (!bestShard || !bestShardId) {
      throw new Error("No available shards - system at capacity");
    }

    this.streamToShard.set(stream.id, bestShardId);
    bestShard.streams.set(stream.id, stream);

    this.emit("stream:registered", { streamId: stream.id, shardId: bestShardId });
    return bestShardId as string;
  }

  // Add viewer to stream
  addViewer(streamId: string, userId: string): boolean {
    const shardId = this.streamToShard.get(streamId);
    if (!shardId) return false;

    const shard = this.shards.get(shardId);
    if (!shard) return false;

    const added = shard.addViewer(streamId, userId);
    if (added) {
      const stream = shard.streams.get(streamId);
      if (stream) {
        stream.viewerCount++;
        stream.totalViewers++;
      }
      this.emit("viewer:joined", { streamId, userId, shardId });
    }
    return added;
  }

  // Remove viewer from stream
  removeViewer(streamId: string, userId: string): void {
    const shardId = this.streamToShard.get(streamId);
    if (!shardId) return;

    const shard = this.shards.get(shardId);
    if (!shard) return;

    shard.removeViewer(streamId, userId);
    const stream = shard.streams.get(streamId);
    if (stream) {
      stream.viewerCount--;
    }
    this.emit("viewer:left", { streamId, userId, shardId });
  }

  // Get stream info
  getStream(streamId: string): StreamState | null {
    const shardId = this.streamToShard.get(streamId);
    if (!shardId) return null;

    const shard = this.shards.get(shardId);
    return shard?.streams.get(streamId) || null;
  }

  // Get shard info
  getShard(shardId: string): StreamShard | null {
    return this.shards.get(shardId) || null;
  }

  // Get all live streams
  getLiveStreams(): StreamState[] {
    const streams: StreamState[] = [];
    const shardArray = Array.from(this.shards.values());
    for (let i = 0; i < shardArray.length; i++) {
      const shard = shardArray[i];
      const streamArray = Array.from(shard.streams.values());
      for (let j = 0; j < streamArray.length; j++) {
        const stream = streamArray[j];
        if (stream.status === "live") {
          streams.push(stream);
        }
      }
    }
    return streams.sort((a, b) => b.viewerCount - a.viewerCount);
  }

  // Get system stats
  getStats() {
    let totalStreams = 0;
    let totalViewers = 0;
    let totalLiveStreams = 0;

    const shardArray = Array.from(this.shards.values());
    for (let i = 0; i < shardArray.length; i++) {
      const shard = shardArray[i];
      totalStreams += shard.streams.size;
      totalViewers += shard.currentLoad;
      const streamArray = Array.from(shard.streams.values());
      for (let j = 0; j < streamArray.length; j++) {
        if (streamArray[j].status === "live") {
          totalLiveStreams++;
        }
      }
    }

    return {
      shards: this.currentShardCount,
      totalStreams,
      totalLiveStreams,
      totalViewers,
      avgViewersPerShard: Math.round(totalViewers / this.currentShardCount),
      systemLoad: Math.round((totalViewers / (this.currentShardCount * 10000)) * 100),
    };
  }
}

// ============================================================================
// MESSAGE QUEUE FOR CHAT/TIPS
// ============================================================================

interface QueuedMessage {
  id: string;
  type: "chat" | "tip";
  streamId: string;
  userId: string;
  data: any;
  timestamp: number;
}

class MessageQueue {
  private queue: QueuedMessage[] = [];
  private processing: boolean = false;
  private batchSize: number = 100;
  private flushInterval: number = 1000; // 1 second

  constructor() {
    setInterval(() => this.flush(), this.flushInterval);
  }

  enqueue(message: QueuedMessage): void {
    this.queue.push(message);
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const batch = this.queue.splice(0, this.batchSize);

    try {
      // Process batch (save to DB, broadcast, etc.)
      // This would integrate with your database
      console.log(`[Queue] Processing ${batch.length} messages`);
    } catch (error) {
      console.error("[Queue] Error processing batch:", error);
      // Re-queue failed messages
      this.queue.unshift(...batch);
    } finally {
      this.processing = false;
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }
}

// ============================================================================
// CONNECTION POOL
// ============================================================================

class ConnectionPool {
  private maxConnections: number = 50000;
  private connections: Map<string, any> = new Map();
  private streamConnections: Map<string, Set<string>> = new Map();

  addConnection(userId: string, streamId: string, connection: any): boolean {
    if (this.connections.size >= this.maxConnections) {
      return false;
    }

    const connId = `${userId}-${streamId}`;
    this.connections.set(connId, connection);

    if (!this.streamConnections.has(streamId)) {
      this.streamConnections.set(streamId, new Set());
    }
    this.streamConnections.get(streamId)!.add(userId);

    return true;
  }

  removeConnection(userId: string, streamId: string): void {
    const connId = `${userId}-${streamId}`;
    this.connections.delete(connId);

    const streamConns = this.streamConnections.get(streamId);
    if (streamConns) {
      streamConns.delete(userId);
    }
  }

  getStreamConnections(streamId: string): Set<string> {
    return this.streamConnections.get(streamId) || new Set();
  }

  getStats() {
    return {
      totalConnections: this.connections.size,
      maxConnections: this.maxConnections,
      utilization: Math.round((this.connections.size / this.maxConnections) * 100),
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const streamingManager = new StreamingManager();
export const messageQueue = new MessageQueue();
export const connectionPool = new ConnectionPool();

export { StreamingManager, MessageQueue, ConnectionPool, StreamShard };

