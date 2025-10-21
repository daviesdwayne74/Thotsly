import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, decimal, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "creator"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Creator profiles - extended information for content creators
 */
export const creatorProfiles = mysqlTable("creator_profiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  bannerUrl: text("bannerUrl"),
  subscriptionPrice: int("subscriptionPrice").default(0).notNull(), // in cents
  isVerified: boolean("isVerified").default(false).notNull(),
  isEliteFounding: boolean("isEliteFounding").default(false).notNull(),
  totalSubscribers: int("totalSubscribers").default(0).notNull(),
  totalEarnings: int("totalEarnings").default(0).notNull(), // in cents
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type InsertCreatorProfile = typeof creatorProfiles.$inferInsert;

/**
 * Posts - content created by creators
 */
export const posts = mysqlTable("posts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
  content: text("content"),
  mediaUrls: text("mediaUrls"), // JSON array of media URLs
  mediaType: mysqlEnum("mediaType", ["text", "image", "video", "mixed"]).default("text").notNull(),
  isPaid: boolean("isPaid").default(false).notNull(), // PPV content
  price: int("price").default(0).notNull(), // in cents, for PPV
  likesCount: int("likesCount").default(0).notNull(),
  commentsCount: int("commentsCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  creatorIdIdx: index("creatorId_idx").on(table.creatorId),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Subscriptions - fan subscriptions to creators
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow(),
  endDate: timestamp("endDate"),
  renewalDate: timestamp("renewalDate"),
  amountPaid: int("amountPaid").notNull(), // in cents
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  creatorIdIdx: index("creatorId_idx").on(table.creatorId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Messages - direct messages between users and creators
 */
export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  senderId: varchar("senderId", { length: 64 }).notNull().references(() => users.id),
  recipientId: varchar("recipientId", { length: 64 }).notNull().references(() => users.id),
  content: text("content").notNull(),
  mediaUrl: text("mediaUrl"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  senderIdIdx: index("senderId_idx").on(table.senderId),
  recipientIdIdx: index("recipientId_idx").on(table.recipientId),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Likes - user likes on posts
 */
export const likes = mysqlTable("likes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  postId: varchar("postId", { length: 64 }).notNull().references(() => posts.id),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  postIdIdx: index("postId_idx").on(table.postId),
}));

export type Like = typeof likes.$inferSelect;
export type InsertLike = typeof likes.$inferInsert;

/**
 * Transactions - payment history
 */
export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  creatorId: varchar("creatorId", { length: 64 }).references(() => creatorProfiles.id),
  type: mysqlEnum("type", ["subscription", "ppv", "tip", "payout"]).notNull(),
  amount: int("amount").notNull(), // in cents
  platformFee: int("platformFee").notNull(), // in cents
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  creatorIdIdx: index("creatorId_idx").on(table.creatorId),
  typeIdx: index("type_idx").on(table.type),
  statusIdx: index("status_idx").on(table.status),
}));

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;




/**
 * Merch products - creator merchandise
 */
export const merchProducts = mysqlTable("merch_products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  price: int("price").notNull(), // in cents
  inventory: int("inventory").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  creatorIdIdx: index("creatorId_idx").on(table.creatorId),
}));

export type MerchProduct = typeof merchProducts.$inferSelect;
export type InsertMerchProduct = typeof merchProducts.$inferInsert;

/**
 * Stripe customers - mapping users to Stripe customer IDs
 */
export const stripeCustomers = mysqlTable("stripe_customers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type StripeCustomer = typeof stripeCustomers.$inferSelect;
export type InsertStripeCustomer = typeof stripeCustomers.$inferInsert;



/**
 * Live streams - active and past streams
 */
export const liveStreams = mysqlTable("live_streams", {
  id: varchar("id", { length: 64 }).primaryKey(),
  creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnailUrl"),
  streamKey: varchar("streamKey", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["scheduled", "live", "ended"]).default("scheduled").notNull(),
  isPrivate: boolean("isPrivate").default(false).notNull(),
  isPaid: boolean("isPaid").default(false).notNull(), // PPV stream
  price: int("price").default(0).notNull(), // in cents, for PPV streams
  viewerCount: int("viewerCount").default(0).notNull(),
  totalViewers: int("totalViewers").default(0).notNull(),
  duration: int("duration").default(0).notNull(), // in seconds
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  recordingUrl: text("recordingUrl"), // VOD URL
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  creatorIdIdx: index("creatorId_idx").on(table.creatorId),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertLiveStream = typeof liveStreams.$inferInsert;

/**
 * Stream viewers - track who's watching each stream
 */
export const streamViewers = mysqlTable("stream_viewers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  streamId: varchar("streamId", { length: 64 }).notNull().references(() => liveStreams.id),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  joinedAt: timestamp("joinedAt").defaultNow(),
  leftAt: timestamp("leftAt"),
  watchDuration: int("watchDuration").default(0).notNull(), // in seconds
}, (table) => ({
  streamIdIdx: index("streamId_idx").on(table.streamId),
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type StreamViewer = typeof streamViewers.$inferSelect;
export type InsertStreamViewer = typeof streamViewers.$inferInsert;

/**
 * Stream tips - donations/tips during streams
 */
export const streamTips = mysqlTable("stream_tips", {
  id: varchar("id", { length: 64 }).primaryKey(),
  streamId: varchar("streamId", { length: 64 }).notNull().references(() => liveStreams.id),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  amount: int("amount").notNull(), // in cents
  message: text("message"),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  streamIdIdx: index("streamId_idx").on(table.streamId),
  userIdIdx: index("userId_idx").on(table.userId),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type StreamTip = typeof streamTips.$inferSelect;
export type InsertStreamTip = typeof streamTips.$inferInsert;

/**
 * Stream chat - messages during live streams
 */
export const streamChat = mysqlTable("stream_chat", {
  id: varchar("id", { length: 64 }).primaryKey(),
  streamId: varchar("streamId", { length: 64 }).notNull().references(() => liveStreams.id),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  message: text("message").notNull(),
  isModeratorMessage: boolean("isModeratorMessage").default(false).notNull(),
  isFlaggedAsSpam: boolean("isFlaggedAsSpam").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  streamIdIdx: index("streamId_idx").on(table.streamId),
  userIdIdx: index("userId_idx").on(table.userId),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type StreamChat = typeof streamChat.$inferSelect;
export type InsertStreamChat = typeof streamChat.$inferInsert;



/**
 * Stories - 24-hour ephemeral content
 */
export const stories = mysqlTable("stories", {
  id: varchar("id", { length: 64 }).primaryKey(),
  creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
  mediaUrl: text("mediaUrl").notNull(),
  mediaType: mysqlEnum("mediaType", ["image", "video"]).notNull(),
  caption: text("caption"),
  viewCount: int("viewCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  creatorIdIdx: index("creatorId_idx").on(table.creatorId),
  expiresAtIdx: index("expiresAt_idx").on(table.expiresAt),
}));

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

/**
 * Story views - track who viewed each story
 */
export const storyViews = mysqlTable("story_views", {
  id: varchar("id", { length: 64 }).primaryKey(),
  storyId: varchar("storyId", { length: 64 }).notNull().references(() => stories.id),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  viewedAt: timestamp("viewedAt").defaultNow(),
}, (table) => ({
  storyIdIdx: index("storyId_idx").on(table.storyId),
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type StoryView = typeof storyViews.$inferSelect;
export type InsertStoryView = typeof storyViews.$inferInsert;

/**
 * Vault - organized content library for creators
 */
export const vaultFolders = mysqlTable("vault_folders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPrivate: boolean("isPrivate").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  creatorIdIdx: index("creatorId_idx").on(table.creatorId),
}));

export type VaultFolder = typeof vaultFolders.$inferSelect;
export type InsertVaultFolder = typeof vaultFolders.$inferInsert;

/**
 * Vault items - content in folders
 */
export const vaultItems = mysqlTable("vault_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  folderId: varchar("folderId", { length: 64 }).notNull().references(() => vaultFolders.id),
  postId: varchar("postId", { length: 64 }).references(() => posts.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  mediaUrl: text("mediaUrl"),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  folderIdIdx: index("folderId_idx").on(table.folderId),
  postIdIdx: index("postId_idx").on(table.postId),
}));

export type VaultItem = typeof vaultItems.$inferSelect;
export type InsertVaultItem = typeof vaultItems.$inferInsert;

/**
 * Notifications - user notifications
 */
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  type: mysqlEnum("type", ["subscription", "message", "tip", "like", "comment", "stream"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  relatedUserId: varchar("relatedUserId", { length: 64 }).references(() => users.id),
  relatedId: varchar("relatedId", { length: 64 }),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  typeIdx: index("type_idx").on(table.type),
  isReadIdx: index("isRead_idx").on(table.isRead),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Referrals - creator referral program
 */
export const referrals = mysqlTable("referrals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  referrerId: varchar("referrerId", { length: 64 }).notNull().references(() => creatorProfiles.id),
  referredUserId: varchar("referredUserId", { length: 64 }).notNull().references(() => users.id),
  referralCode: varchar("referralCode", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "active", "expired"]).default("pending").notNull(),
  commissionRate: int("commissionRate").default(10).notNull(), // percentage
  totalEarnings: int("totalEarnings").default(0).notNull(), // in cents
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  referrerIdIdx: index("referrerId_idx").on(table.referrerId),
  referredUserIdIdx: index("referredUserId_idx").on(table.referredUserId),
  referralCodeIdx: index("referralCode_idx").on(table.referralCode),
}));

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Content moderation flags
 */
export const contentFlags = mysqlTable("content_flags", {
  id: varchar("id", { length: 64 }).primaryKey(),
  postId: varchar("postId", { length: 64 }).references(() => posts.id),
  streamId: varchar("streamId", { length: 64 }).references(() => liveStreams.id),
  reason: mysqlEnum("reason", ["spam", "harassment", "violence", "adult", "copyright", "other"]).notNull(),
  description: text("description"),
  flaggedBy: varchar("flaggedBy", { length: 64 }).notNull().references(() => users.id),
  status: mysqlEnum("status", ["pending", "reviewed", "approved", "rejected"]).default("pending").notNull(),
  reviewedBy: varchar("reviewedBy", { length: 64 }).references(() => users.id),
  action: mysqlEnum("action", ["none", "warning", "suspend", "ban"]),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  postIdIdx: index("postId_idx").on(table.postId),
  streamIdIdx: index("streamId_idx").on(table.streamId),
  statusIdx: index("status_idx").on(table.status),
}));

export type ContentFlag = typeof contentFlags.$inferSelect;
export type InsertContentFlag = typeof contentFlags.$inferInsert;

/**
 * Affiliates - creator partnership program
 */
export const affiliates = mysqlTable("affiliates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
  affiliateCode: varchar("affiliateCode", { length: 64 }).notNull().unique(),
  commissionRate: int("commissionRate").default(20).notNull(), // percentage
  totalEarnings: int("totalEarnings").default(0).notNull(), // in cents
  status: mysqlEnum("status", ["active", "suspended", "terminated"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  creatorIdIdx: index("creatorId_idx").on(table.creatorId),
  affiliateCodeIdx: index("affiliateCode_idx").on(table.affiliateCode),
}));

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;



/**
 * Creator applications - verification process
 */
export const creatorApplications = mysqlTable("creator_applications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  bio: text("bio"),
  category: varchar("category", { length: 64 }).notNull(), // music, fitness, art, etc.
  portfolioUrls: text("portfolioUrls"), // JSON array of portfolio URLs
  socialLinks: text("socialLinks"), // JSON object of social media links
  statement: text("statement"), // Creator's statement/pitch
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  rejectionReason: text("rejectionReason"),
  reviewedBy: varchar("reviewedBy", { length: 64 }).references(() => users.id),
  submittedAt: timestamp("submittedAt").defaultNow(),
  reviewedAt: timestamp("reviewedAt"),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
}));

export type CreatorApplication = typeof creatorApplications.$inferSelect;
export type InsertCreatorApplication = typeof creatorApplications.$inferInsert;

/**
 * Portfolio items - content samples for creator applications
 */
export const portfolioItems = mysqlTable("portfolio_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  applicationId: varchar("applicationId", { length: 64 }).notNull().references(() => creatorApplications.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  mediaUrl: text("mediaUrl").notNull(),
  mediaType: mysqlEnum("mediaType", ["image", "video", "audio"]).notNull(),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  applicationIdIdx: index("applicationId_idx").on(table.applicationId),
}));

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = typeof portfolioItems.$inferInsert;



/**
 * Government ID verification
 */
export const idVerifications = mysqlTable("id_verifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  idType: mysqlEnum("idType", ["passport", "driver_license", "national_id", "other"]).notNull(),
  idNumber: varchar("idNumber", { length: 255 }).notNull(), // Encrypted
  fullName: varchar("fullName", { length: 255 }).notNull(), // From ID
  dateOfBirth: varchar("dateOfBirth", { length: 10 }).notNull(), // YYYY-MM-DD
  expiryDate: varchar("expiryDate", { length: 10 }), // YYYY-MM-DD
  country: varchar("country", { length: 2 }).notNull(), // ISO country code
  idImageUrl: text("idImageUrl").notNull(), // Front of ID
  idImageBackUrl: text("idImageBackUrl"), // Back of ID (if applicable)
  status: mysqlEnum("status", ["pending", "verified", "rejected", "expired"]).default("pending").notNull(),
  verificationNotes: text("verificationNotes"),
  verifiedBy: varchar("verifiedBy", { length: 64 }).references(() => users.id),
  submittedAt: timestamp("submittedAt").defaultNow(),
  verifiedAt: timestamp("verifiedAt"),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
}));

export type IdVerification = typeof idVerifications.$inferSelect;
export type InsertIdVerification = typeof idVerifications.$inferInsert;

/**
 * Age verification records
 */
export const ageVerifications = mysqlTable("age_verifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  verificationId: varchar("verificationId", { length: 64 }).notNull().references(() => idVerifications.id),
  dateOfBirth: varchar("dateOfBirth", { length: 10 }).notNull(),
  age: int("age").notNull(),
  isOver18: boolean("isOver18").notNull(),
  isOver21: boolean("isOver21").notNull(),
  verifiedAt: timestamp("verifiedAt").defaultNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type AgeVerification = typeof ageVerifications.$inferSelect;
export type InsertAgeVerification = typeof ageVerifications.$inferInsert;



/**
 * Email notification preferences
 */
export const emailPreferences = mysqlTable("email_preferences", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  newSubscriber: boolean("newSubscriber").default(true).notNull(),
  newMessage: boolean("newMessage").default(true).notNull(),
  newTip: boolean("newTip").default(true).notNull(),
  streamNotification: boolean("streamNotification").default(true).notNull(),
  weeklyDigest: boolean("weeklyDigest").default(true).notNull(),
  promotionalEmails: boolean("promotionalEmails").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type EmailPreference = typeof emailPreferences.$inferSelect;
export type InsertEmailPreference = typeof emailPreferences.$inferInsert;

/**
 * Email logs - track sent emails
 */
export const emailLogs = mysqlTable("email_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  type: mysqlEnum("type", ["subscription", "message", "tip", "stream", "digest", "promotional"]).notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["sent", "failed", "bounced"]).default("sent").notNull(),
  sentAt: timestamp("sentAt").defaultNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  typeIdx: index("type_idx").on(table.type),
}));

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;

/**
 * Stream recordings/VOD
 */
export const streamRecordings = mysqlTable("stream_recordings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  streamId: varchar("streamId", { length: 64 }).notNull().references(() => liveStreams.id),
  creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
  recordingUrl: text("recordingUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  duration: int("duration"), // in seconds
  fileSize: int("fileSize"), // in bytes
  resolution: varchar("resolution", { length: 20 }), // 1080p, 720p, etc.
  isPublic: boolean("isPublic").default(true).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  streamIdIdx: index("streamId_idx").on(table.streamId),
  creatorIdIdx: index("creatorId_idx").on(table.creatorId),
}));

export type StreamRecording = typeof streamRecordings.$inferSelect;
export type InsertStreamRecording = typeof streamRecordings.$inferInsert;

/**
 * VOD views - track who watched recordings
 */
export const vodViews = mysqlTable("vod_views", {
  id: varchar("id", { length: 64 }).primaryKey(),
  recordingId: varchar("recordingId", { length: 64 }).notNull().references(() => streamRecordings.id),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  watchedDuration: int("watchedDuration"), // in seconds
  viewedAt: timestamp("viewedAt").defaultNow(),
}, (table) => ({
  recordingIdIdx: index("recordingId_idx").on(table.recordingId),
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type VodView = typeof vodViews.$inferSelect;
export type InsertVodView = typeof vodViews.$inferInsert;



/**
 * Wishlist system for creators
 * Subscribers can buy items from creator wishlists
 * THOTSLY takes 5%, creator gets 95%
 * Subscribers pay all credit card processing fees
 */
export const wishlists = mysqlTable("wishlists", {
  id: varchar("id", { length: 64 }).primaryKey(),
  creatorId: varchar("creatorId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const wishlistItems = mysqlTable("wishlistItems", {
  id: varchar("id", { length: 64 }).primaryKey(),
  wishlistId: varchar("wishlistId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(),
  url: text("url"),
  imageUrl: text("imageUrl"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  isPurchased: boolean("isPurchased").default(false).notNull(),
  purchasedBy: varchar("purchasedBy", { length: 64 }),
  purchasedAt: timestamp("purchasedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const wishlistPurchases = mysqlTable("wishlistPurchases", {
  id: varchar("id", { length: 64 }).primaryKey(),
  itemId: varchar("itemId", { length: 64 }).notNull(),
  buyerId: varchar("buyerId", { length: 64 }).notNull(),
  creatorId: varchar("creatorId", { length: 64 }).notNull(),
  amount: int("amount").notNull(),
  platformFee: int("platformFee").notNull(),
  creatorEarnings: int("creatorEarnings").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending"),
  transactionId: varchar("transactionId", { length: 255 }),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = typeof wishlistItems.$inferInsert;
export type WishlistPurchase = typeof wishlistPurchases.$inferSelect;
export type InsertWishlistPurchase = typeof wishlistPurchases.$inferInsert;



/**
 * Stripe Connect Accounts - creator payout accounts
 */
export const stripeConnectAccounts = mysqlTable("stripe_connect_accounts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
  stripeConnectAccountId: varchar("stripeConnectAccountId", { length: 255 }).notNull().unique(),
  type: mysqlEnum("type", ["express", "custom"]).default("express").notNull(),
  status: mysqlEnum("status", ["pending", "active", "inactive"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => ({
  creatorIdIdx: index("creatorId_idx").on(table.creatorId),
  statusIdx: index("status_idx").on(table.status),
}));

export type StripeConnectAccount = typeof stripeConnectAccounts.$inferSelect;
export type InsertStripeConnectAccount = typeof stripeConnectAccounts.$inferInsert;

/**
 * Creator Payouts - track payout history
 */
export const creatorPayouts = mysqlTable("creator_payouts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
  stripePayoutId: varchar("stripePayoutId", { length: 255 }).notNull().unique(),
  amount: int("amount").notNull(), // in cents
  status: mysqlEnum("status", ["pending", "in_transit", "paid", "failed", "cancelled"]).default("pending").notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  arrivalDate: timestamp("arrivalDate"),
  failureCode: varchar("failureCode", { length: 64 }),
  failureMessage: text("failureMessage"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  creatorIdIdx: index("creatorId_idx").on(table.creatorId),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type CreatorPayout = typeof creatorPayouts.$inferSelect;
export type InsertCreatorPayout = typeof creatorPayouts.$inferInsert;

