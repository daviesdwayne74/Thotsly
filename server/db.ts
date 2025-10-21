import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  creatorProfiles, InsertCreatorProfile, CreatorProfile,
  posts, InsertPost, Post,
  subscriptions, InsertSubscription, Subscription,
  messages, InsertMessage, Message,
  likes, InsertLike,
  transactions, InsertTransaction, Transaction
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ CREATOR PROFILE OPERATIONS ============

export async function createCreatorProfile(profile: InsertCreatorProfile): Promise<CreatorProfile | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(creatorProfiles).values(profile);
  const newProfile = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, profile.id)).limit(1);
  return newProfile[0] || null;
}

export async function getCreatorProfile(id: string): Promise<CreatorProfile | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, id)).limit(1);
  return result[0] || null;
}

export async function getCreatorProfileByUserId(userId: string): Promise<CreatorProfile | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId)).limit(1);
  return result[0] || null;
}

export async function getAllCreators(limit: number = 50): Promise<CreatorProfile[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(creatorProfiles).orderBy(desc(creatorProfiles.totalSubscribers)).limit(limit);
}

export async function updateCreatorProfile(id: string, updates: Partial<InsertCreatorProfile>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(creatorProfiles).set(updates).where(eq(creatorProfiles.id, id));
}

// ============ POST OPERATIONS ============

export async function createPost(post: InsertPost): Promise<Post | null> {
  const db = await getDb();
  if (!db) return null;

  await db.insert(posts).values(post);
  const newPost = await db.select().from(posts).where(eq(posts.id, post.id)).limit(1);
  return newPost[0] || null;
}

export async function getPost(id: string): Promise<Post | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result[0] || null;
}

export async function getCreatorPosts(creatorId: string, limit: number = 20): Promise<Post[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(posts)
    .where(eq(posts.creatorId, creatorId))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
}

export async function getAllPosts(limit: number = 50): Promise<Post[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit);
}

export async function deletePost(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(posts).where(eq(posts.id, id));
}

// ============ SUBSCRIPTION OPERATIONS ============

export async function createSubscription(subscription: InsertSubscription): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;

  await db.insert(subscriptions).values(subscription);
  const newSub = await db.select().from(subscriptions).where(eq(subscriptions.id, subscription.id)).limit(1);
  return newSub[0] || null;
}

export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .orderBy(desc(subscriptions.createdAt));
}

export async function getCreatorSubscribers(creatorId: string): Promise<Subscription[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(subscriptions)
    .where(and(eq(subscriptions.creatorId, creatorId), eq(subscriptions.status, "active")))
    .orderBy(desc(subscriptions.createdAt));
}

export async function checkSubscription(userId: string, creatorId: string): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.creatorId, creatorId),
      eq(subscriptions.status, "active")
    ))
    .limit(1);
  
  return result[0] || null;
}

export async function updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id));
}

// ============ MESSAGE OPERATIONS ============

export async function createMessage(message: InsertMessage): Promise<Message | null> {
  const db = await getDb();
  if (!db) return null;

  await db.insert(messages).values(message);
  const newMsg = await db.select().from(messages).where(eq(messages.id, message.id)).limit(1);
  return newMsg[0] || null;
}

export async function getConversation(userId1: string, userId2: string, limit: number = 50): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(messages)
    .where(
      sql`(${messages.senderId} = ${userId1} AND ${messages.recipientId} = ${userId2}) 
          OR (${messages.senderId} = ${userId2} AND ${messages.recipientId} = ${userId1})`
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function markMessageAsRead(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
}

// ============ LIKE OPERATIONS ============

export async function createLike(like: InsertLike): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(likes).values(like);
  
  // Increment like count on post
  await db.update(posts)
    .set({ likesCount: sql`${posts.likesCount} + 1` })
    .where(eq(posts.id, like.postId));
}

export async function deleteLike(userId: string, postId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  
  // Decrement like count on post
  await db.update(posts)
    .set({ likesCount: sql`${posts.likesCount} - 1` })
    .where(eq(posts.id, postId));
}

export async function checkLike(userId: string, postId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(likes)
    .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
    .limit(1);
  
  return result.length > 0;
}

// ============ TRANSACTION OPERATIONS ============

export async function createTransaction(transaction: InsertTransaction): Promise<Transaction | null> {
  const db = await getDb();
  if (!db) return null;

  await db.insert(transactions).values(transaction);
  const newTx = await db.select().from(transactions).where(eq(transactions.id, transaction.id)).limit(1);
  return newTx[0] || null;
}

export async function getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function getCreatorTransactions(creatorId: string, limit: number = 50): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(transactions)
    .where(eq(transactions.creatorId, creatorId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

