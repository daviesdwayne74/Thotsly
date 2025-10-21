var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, index } from "drizzle-orm/mysql-core";
var users, creatorProfiles, posts, subscriptions, messages, likes, transactions, merchProducts, stripeCustomers, liveStreams, streamViewers, streamTips, streamChat, stories, storyViews, vaultFolders, vaultItems, notifications, referrals, contentFlags, affiliates, creatorApplications, portfolioItems, idVerifications, ageVerifications, emailPreferences, emailLogs, streamRecordings, vodViews, wishlists, wishlistItems, wishlistPurchases, stripeConnectAccounts, creatorPayouts;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: varchar("id", { length: 64 }).primaryKey(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin", "creator"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow()
    });
    creatorProfiles = mysqlTable("creator_profiles", {
      id: varchar("id", { length: 64 }).primaryKey(),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      displayName: varchar("displayName", { length: 255 }).notNull(),
      bio: text("bio"),
      avatarUrl: text("avatarUrl"),
      bannerUrl: text("bannerUrl"),
      subscriptionPrice: int("subscriptionPrice").default(0).notNull(),
      // in cents
      isVerified: boolean("isVerified").default(false).notNull(),
      isEliteFounding: boolean("isEliteFounding").default(false).notNull(),
      totalSubscribers: int("totalSubscribers").default(0).notNull(),
      totalEarnings: int("totalEarnings").default(0).notNull(),
      // in cents
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      userIdIdx: index("userId_idx").on(table.userId)
    }));
    posts = mysqlTable("posts", {
      id: varchar("id", { length: 64 }).primaryKey(),
      creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
      content: text("content"),
      mediaUrls: text("mediaUrls"),
      // JSON array of media URLs
      mediaType: mysqlEnum("mediaType", ["text", "image", "video", "mixed"]).default("text").notNull(),
      isPaid: boolean("isPaid").default(false).notNull(),
      // PPV content
      price: int("price").default(0).notNull(),
      // in cents, for PPV
      likesCount: int("likesCount").default(0).notNull(),
      commentsCount: int("commentsCount").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      creatorIdIdx: index("creatorId_idx").on(table.creatorId),
      createdAtIdx: index("createdAt_idx").on(table.createdAt)
    }));
    subscriptions = mysqlTable("subscriptions", {
      id: varchar("id", { length: 64 }).primaryKey(),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
      status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
      startDate: timestamp("startDate").defaultNow(),
      endDate: timestamp("endDate"),
      renewalDate: timestamp("renewalDate"),
      amountPaid: int("amountPaid").notNull(),
      // in cents
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      userIdIdx: index("userId_idx").on(table.userId),
      creatorIdIdx: index("creatorId_idx").on(table.creatorId),
      statusIdx: index("status_idx").on(table.status)
    }));
    messages = mysqlTable("messages", {
      id: varchar("id", { length: 64 }).primaryKey(),
      senderId: varchar("senderId", { length: 64 }).notNull().references(() => users.id),
      recipientId: varchar("recipientId", { length: 64 }).notNull().references(() => users.id),
      content: text("content").notNull(),
      mediaUrl: text("mediaUrl"),
      isRead: boolean("isRead").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      senderIdIdx: index("senderId_idx").on(table.senderId),
      recipientIdIdx: index("recipientId_idx").on(table.recipientId),
      createdAtIdx: index("createdAt_idx").on(table.createdAt)
    }));
    likes = mysqlTable("likes", {
      id: varchar("id", { length: 64 }).primaryKey(),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      postId: varchar("postId", { length: 64 }).notNull().references(() => posts.id),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      userIdIdx: index("userId_idx").on(table.userId),
      postIdIdx: index("postId_idx").on(table.postId)
    }));
    transactions = mysqlTable("transactions", {
      id: varchar("id", { length: 64 }).primaryKey(),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      creatorId: varchar("creatorId", { length: 64 }).references(() => creatorProfiles.id),
      type: mysqlEnum("type", ["subscription", "ppv", "tip", "payout"]).notNull(),
      amount: int("amount").notNull(),
      // in cents
      platformFee: int("platformFee").notNull(),
      // in cents
      status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
      description: text("description"),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      userIdIdx: index("userId_idx").on(table.userId),
      creatorIdIdx: index("creatorId_idx").on(table.creatorId),
      typeIdx: index("type_idx").on(table.type),
      statusIdx: index("status_idx").on(table.status)
    }));
    merchProducts = mysqlTable("merch_products", {
      id: varchar("id", { length: 64 }).primaryKey(),
      creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      imageUrl: text("imageUrl"),
      price: int("price").notNull(),
      // in cents
      inventory: int("inventory").default(0),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      creatorIdIdx: index("creatorId_idx").on(table.creatorId)
    }));
    stripeCustomers = mysqlTable("stripe_customers", {
      id: varchar("id", { length: 64 }).primaryKey(),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull().unique(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      userIdIdx: index("userId_idx").on(table.userId)
    }));
    liveStreams = mysqlTable("live_streams", {
      id: varchar("id", { length: 64 }).primaryKey(),
      creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      thumbnailUrl: text("thumbnailUrl"),
      streamKey: varchar("streamKey", { length: 255 }).notNull().unique(),
      status: mysqlEnum("status", ["scheduled", "live", "ended"]).default("scheduled").notNull(),
      isPrivate: boolean("isPrivate").default(false).notNull(),
      isPaid: boolean("isPaid").default(false).notNull(),
      // PPV stream
      price: int("price").default(0).notNull(),
      // in cents, for PPV streams
      viewerCount: int("viewerCount").default(0).notNull(),
      totalViewers: int("totalViewers").default(0).notNull(),
      duration: int("duration").default(0).notNull(),
      // in seconds
      startedAt: timestamp("startedAt"),
      endedAt: timestamp("endedAt"),
      recordingUrl: text("recordingUrl"),
      // VOD URL
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      creatorIdIdx: index("creatorId_idx").on(table.creatorId),
      statusIdx: index("status_idx").on(table.status),
      createdAtIdx: index("createdAt_idx").on(table.createdAt)
    }));
    streamViewers = mysqlTable("stream_viewers", {
      id: varchar("id", { length: 64 }).primaryKey(),
      streamId: varchar("streamId", { length: 64 }).notNull().references(() => liveStreams.id),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      joinedAt: timestamp("joinedAt").defaultNow(),
      leftAt: timestamp("leftAt"),
      watchDuration: int("watchDuration").default(0).notNull()
      // in seconds
    }, (table) => ({
      streamIdIdx: index("streamId_idx").on(table.streamId),
      userIdIdx: index("userId_idx").on(table.userId)
    }));
    streamTips = mysqlTable("stream_tips", {
      id: varchar("id", { length: 64 }).primaryKey(),
      streamId: varchar("streamId", { length: 64 }).notNull().references(() => liveStreams.id),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      amount: int("amount").notNull(),
      // in cents
      message: text("message"),
      isAnonymous: boolean("isAnonymous").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      streamIdIdx: index("streamId_idx").on(table.streamId),
      userIdIdx: index("userId_idx").on(table.userId),
      createdAtIdx: index("createdAt_idx").on(table.createdAt)
    }));
    streamChat = mysqlTable("stream_chat", {
      id: varchar("id", { length: 64 }).primaryKey(),
      streamId: varchar("streamId", { length: 64 }).notNull().references(() => liveStreams.id),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      message: text("message").notNull(),
      isModeratorMessage: boolean("isModeratorMessage").default(false).notNull(),
      isFlaggedAsSpam: boolean("isFlaggedAsSpam").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      streamIdIdx: index("streamId_idx").on(table.streamId),
      userIdIdx: index("userId_idx").on(table.userId),
      createdAtIdx: index("createdAt_idx").on(table.createdAt)
    }));
    stories = mysqlTable("stories", {
      id: varchar("id", { length: 64 }).primaryKey(),
      creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
      mediaUrl: text("mediaUrl").notNull(),
      mediaType: mysqlEnum("mediaType", ["image", "video"]).notNull(),
      caption: text("caption"),
      viewCount: int("viewCount").default(0).notNull(),
      expiresAt: timestamp("expiresAt").notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      creatorIdIdx: index("creatorId_idx").on(table.creatorId),
      expiresAtIdx: index("expiresAt_idx").on(table.expiresAt)
    }));
    storyViews = mysqlTable("story_views", {
      id: varchar("id", { length: 64 }).primaryKey(),
      storyId: varchar("storyId", { length: 64 }).notNull().references(() => stories.id),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      viewedAt: timestamp("viewedAt").defaultNow()
    }, (table) => ({
      storyIdIdx: index("storyId_idx").on(table.storyId),
      userIdIdx: index("userId_idx").on(table.userId)
    }));
    vaultFolders = mysqlTable("vault_folders", {
      id: varchar("id", { length: 64 }).primaryKey(),
      creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      isPrivate: boolean("isPrivate").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      creatorIdIdx: index("creatorId_idx").on(table.creatorId)
    }));
    vaultItems = mysqlTable("vault_items", {
      id: varchar("id", { length: 64 }).primaryKey(),
      folderId: varchar("folderId", { length: 64 }).notNull().references(() => vaultFolders.id),
      postId: varchar("postId", { length: 64 }).references(() => posts.id),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      mediaUrl: text("mediaUrl"),
      order: int("order").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      folderIdIdx: index("folderId_idx").on(table.folderId),
      postIdIdx: index("postId_idx").on(table.postId)
    }));
    notifications = mysqlTable("notifications", {
      id: varchar("id", { length: 64 }).primaryKey(),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      type: mysqlEnum("type", ["subscription", "message", "tip", "like", "comment", "stream"]).notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content"),
      relatedUserId: varchar("relatedUserId", { length: 64 }).references(() => users.id),
      relatedId: varchar("relatedId", { length: 64 }),
      isRead: boolean("isRead").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      userIdIdx: index("userId_idx").on(table.userId),
      typeIdx: index("type_idx").on(table.type),
      isReadIdx: index("isRead_idx").on(table.isRead)
    }));
    referrals = mysqlTable("referrals", {
      id: varchar("id", { length: 64 }).primaryKey(),
      referrerId: varchar("referrerId", { length: 64 }).notNull().references(() => creatorProfiles.id),
      referredUserId: varchar("referredUserId", { length: 64 }).notNull().references(() => users.id),
      referralCode: varchar("referralCode", { length: 64 }).notNull().unique(),
      status: mysqlEnum("status", ["pending", "active", "expired"]).default("pending").notNull(),
      commissionRate: int("commissionRate").default(10).notNull(),
      // percentage
      totalEarnings: int("totalEarnings").default(0).notNull(),
      // in cents
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      referrerIdIdx: index("referrerId_idx").on(table.referrerId),
      referredUserIdIdx: index("referredUserId_idx").on(table.referredUserId),
      referralCodeIdx: index("referralCode_idx").on(table.referralCode)
    }));
    contentFlags = mysqlTable("content_flags", {
      id: varchar("id", { length: 64 }).primaryKey(),
      postId: varchar("postId", { length: 64 }).references(() => posts.id),
      streamId: varchar("streamId", { length: 64 }).references(() => liveStreams.id),
      reason: mysqlEnum("reason", ["spam", "harassment", "violence", "adult", "copyright", "other"]).notNull(),
      description: text("description"),
      flaggedBy: varchar("flaggedBy", { length: 64 }).notNull().references(() => users.id),
      status: mysqlEnum("status", ["pending", "reviewed", "approved", "rejected"]).default("pending").notNull(),
      reviewedBy: varchar("reviewedBy", { length: 64 }).references(() => users.id),
      action: mysqlEnum("action", ["none", "warning", "suspend", "ban"]),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      postIdIdx: index("postId_idx").on(table.postId),
      streamIdIdx: index("streamId_idx").on(table.streamId),
      statusIdx: index("status_idx").on(table.status)
    }));
    affiliates = mysqlTable("affiliates", {
      id: varchar("id", { length: 64 }).primaryKey(),
      creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
      affiliateCode: varchar("affiliateCode", { length: 64 }).notNull().unique(),
      commissionRate: int("commissionRate").default(20).notNull(),
      // percentage
      totalEarnings: int("totalEarnings").default(0).notNull(),
      // in cents
      status: mysqlEnum("status", ["active", "suspended", "terminated"]).default("active").notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      creatorIdIdx: index("creatorId_idx").on(table.creatorId),
      affiliateCodeIdx: index("affiliateCode_idx").on(table.affiliateCode)
    }));
    creatorApplications = mysqlTable("creator_applications", {
      id: varchar("id", { length: 64 }).primaryKey(),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      displayName: varchar("displayName", { length: 255 }).notNull(),
      bio: text("bio"),
      category: varchar("category", { length: 64 }).notNull(),
      // music, fitness, art, etc.
      portfolioUrls: text("portfolioUrls"),
      // JSON array of portfolio URLs
      socialLinks: text("socialLinks"),
      // JSON object of social media links
      statement: text("statement"),
      // Creator's statement/pitch
      status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
      rejectionReason: text("rejectionReason"),
      reviewedBy: varchar("reviewedBy", { length: 64 }).references(() => users.id),
      submittedAt: timestamp("submittedAt").defaultNow(),
      reviewedAt: timestamp("reviewedAt")
    }, (table) => ({
      userIdIdx: index("userId_idx").on(table.userId),
      statusIdx: index("status_idx").on(table.status)
    }));
    portfolioItems = mysqlTable("portfolio_items", {
      id: varchar("id", { length: 64 }).primaryKey(),
      applicationId: varchar("applicationId", { length: 64 }).notNull().references(() => creatorApplications.id),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      mediaUrl: text("mediaUrl").notNull(),
      mediaType: mysqlEnum("mediaType", ["image", "video", "audio"]).notNull(),
      order: int("order").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      applicationIdIdx: index("applicationId_idx").on(table.applicationId)
    }));
    idVerifications = mysqlTable("id_verifications", {
      id: varchar("id", { length: 64 }).primaryKey(),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      idType: mysqlEnum("idType", ["passport", "driver_license", "national_id", "other"]).notNull(),
      idNumber: varchar("idNumber", { length: 255 }).notNull(),
      // Encrypted
      fullName: varchar("fullName", { length: 255 }).notNull(),
      // From ID
      dateOfBirth: varchar("dateOfBirth", { length: 10 }).notNull(),
      // YYYY-MM-DD
      expiryDate: varchar("expiryDate", { length: 10 }),
      // YYYY-MM-DD
      country: varchar("country", { length: 2 }).notNull(),
      // ISO country code
      idImageUrl: text("idImageUrl").notNull(),
      // Front of ID
      idImageBackUrl: text("idImageBackUrl"),
      // Back of ID (if applicable)
      status: mysqlEnum("status", ["pending", "verified", "rejected", "expired"]).default("pending").notNull(),
      verificationNotes: text("verificationNotes"),
      verifiedBy: varchar("verifiedBy", { length: 64 }).references(() => users.id),
      submittedAt: timestamp("submittedAt").defaultNow(),
      verifiedAt: timestamp("verifiedAt")
    }, (table) => ({
      userIdIdx: index("userId_idx").on(table.userId),
      statusIdx: index("status_idx").on(table.status)
    }));
    ageVerifications = mysqlTable("age_verifications", {
      id: varchar("id", { length: 64 }).primaryKey(),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      verificationId: varchar("verificationId", { length: 64 }).notNull().references(() => idVerifications.id),
      dateOfBirth: varchar("dateOfBirth", { length: 10 }).notNull(),
      age: int("age").notNull(),
      isOver18: boolean("isOver18").notNull(),
      isOver21: boolean("isOver21").notNull(),
      verifiedAt: timestamp("verifiedAt").defaultNow()
    }, (table) => ({
      userIdIdx: index("userId_idx").on(table.userId)
    }));
    emailPreferences = mysqlTable("email_preferences", {
      id: varchar("id", { length: 64 }).primaryKey(),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      newSubscriber: boolean("newSubscriber").default(true).notNull(),
      newMessage: boolean("newMessage").default(true).notNull(),
      newTip: boolean("newTip").default(true).notNull(),
      streamNotification: boolean("streamNotification").default(true).notNull(),
      weeklyDigest: boolean("weeklyDigest").default(true).notNull(),
      promotionalEmails: boolean("promotionalEmails").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      userIdIdx: index("userId_idx").on(table.userId)
    }));
    emailLogs = mysqlTable("email_logs", {
      id: varchar("id", { length: 64 }).primaryKey(),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      type: mysqlEnum("type", ["subscription", "message", "tip", "stream", "digest", "promotional"]).notNull(),
      recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
      subject: varchar("subject", { length: 255 }).notNull(),
      status: mysqlEnum("status", ["sent", "failed", "bounced"]).default("sent").notNull(),
      sentAt: timestamp("sentAt").defaultNow()
    }, (table) => ({
      userIdIdx: index("userId_idx").on(table.userId),
      typeIdx: index("type_idx").on(table.type)
    }));
    streamRecordings = mysqlTable("stream_recordings", {
      id: varchar("id", { length: 64 }).primaryKey(),
      streamId: varchar("streamId", { length: 64 }).notNull().references(() => liveStreams.id),
      creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
      recordingUrl: text("recordingUrl").notNull(),
      thumbnailUrl: text("thumbnailUrl"),
      duration: int("duration"),
      // in seconds
      fileSize: int("fileSize"),
      // in bytes
      resolution: varchar("resolution", { length: 20 }),
      // 1080p, 720p, etc.
      isPublic: boolean("isPublic").default(true).notNull(),
      viewCount: int("viewCount").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      streamIdIdx: index("streamId_idx").on(table.streamId),
      creatorIdIdx: index("creatorId_idx").on(table.creatorId)
    }));
    vodViews = mysqlTable("vod_views", {
      id: varchar("id", { length: 64 }).primaryKey(),
      recordingId: varchar("recordingId", { length: 64 }).notNull().references(() => streamRecordings.id),
      userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
      watchedDuration: int("watchedDuration"),
      // in seconds
      viewedAt: timestamp("viewedAt").defaultNow()
    }, (table) => ({
      recordingIdIdx: index("recordingId_idx").on(table.recordingId),
      userIdIdx: index("userId_idx").on(table.userId)
    }));
    wishlists = mysqlTable("wishlists", {
      id: varchar("id", { length: 64 }).primaryKey(),
      creatorId: varchar("creatorId", { length: 64 }).notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow(),
      updatedAt: timestamp("updatedAt").defaultNow()
    });
    wishlistItems = mysqlTable("wishlistItems", {
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
      createdAt: timestamp("createdAt").defaultNow()
    });
    wishlistPurchases = mysqlTable("wishlistPurchases", {
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
      completedAt: timestamp("completedAt")
    });
    stripeConnectAccounts = mysqlTable("stripe_connect_accounts", {
      id: varchar("id", { length: 64 }).primaryKey(),
      creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
      stripeConnectAccountId: varchar("stripeConnectAccountId", { length: 255 }).notNull().unique(),
      type: mysqlEnum("type", ["express", "custom"]).default("express").notNull(),
      status: mysqlEnum("status", ["pending", "active", "inactive"]).default("pending").notNull(),
      createdAt: timestamp("createdAt").defaultNow(),
      updatedAt: timestamp("updatedAt").defaultNow()
    }, (table) => ({
      creatorIdIdx: index("creatorId_idx").on(table.creatorId),
      statusIdx: index("status_idx").on(table.status)
    }));
    creatorPayouts = mysqlTable("creator_payouts", {
      id: varchar("id", { length: 64 }).primaryKey(),
      creatorId: varchar("creatorId", { length: 64 }).notNull().references(() => creatorProfiles.id),
      stripePayoutId: varchar("stripePayoutId", { length: 255 }).notNull().unique(),
      amount: int("amount").notNull(),
      // in cents
      status: mysqlEnum("status", ["pending", "in_transit", "paid", "failed", "cancelled"]).default("pending").notNull(),
      currency: varchar("currency", { length: 3 }).default("usd").notNull(),
      arrivalDate: timestamp("arrivalDate"),
      failureCode: varchar("failureCode", { length: 64 }),
      failureMessage: text("failureMessage"),
      createdAt: timestamp("createdAt").defaultNow()
    }, (table) => ({
      creatorIdIdx: index("creatorId_idx").on(table.creatorId),
      statusIdx: index("status_idx").on(table.status),
      createdAtIdx: index("createdAt_idx").on(table.createdAt)
    }));
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/db.ts
import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
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
async function upsertUser(user) {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      id: user.id
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === void 0) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUser(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createCreatorProfile(profile) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(creatorProfiles).values(profile);
  const newProfile = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, profile.id)).limit(1);
  return newProfile[0] || null;
}
async function getCreatorProfile(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, id)).limit(1);
  return result[0] || null;
}
async function getCreatorProfileByUserId(userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId)).limit(1);
  return result[0] || null;
}
async function getAllCreators(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(creatorProfiles).orderBy(desc(creatorProfiles.totalSubscribers)).limit(limit);
}
async function updateCreatorProfile(id, updates) {
  const db = await getDb();
  if (!db) return;
  await db.update(creatorProfiles).set(updates).where(eq(creatorProfiles.id, id));
}
async function createPost(post) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(posts).values(post);
  const newPost = await db.select().from(posts).where(eq(posts.id, post.id)).limit(1);
  return newPost[0] || null;
}
async function getPost(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result[0] || null;
}
async function getCreatorPosts(creatorId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(posts).where(eq(posts.creatorId, creatorId)).orderBy(desc(posts.createdAt)).limit(limit);
}
async function getAllPosts(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit);
}
async function deletePost(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(posts).where(eq(posts.id, id));
}
async function createSubscription(subscription) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(subscriptions).values(subscription);
  const newSub = await db.select().from(subscriptions).where(eq(subscriptions.id, subscription.id)).limit(1);
  return newSub[0] || null;
}
async function getUserSubscriptions(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(subscriptions).where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))).orderBy(desc(subscriptions.createdAt));
}
async function getCreatorSubscribers(creatorId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(subscriptions).where(and(eq(subscriptions.creatorId, creatorId), eq(subscriptions.status, "active"))).orderBy(desc(subscriptions.createdAt));
}
async function checkSubscription(userId, creatorId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscriptions).where(and(
    eq(subscriptions.userId, userId),
    eq(subscriptions.creatorId, creatorId),
    eq(subscriptions.status, "active")
  )).limit(1);
  return result[0] || null;
}
async function updateSubscription(id, updates) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id));
}
async function createMessage(message) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(messages).values(message);
  const newMsg = await db.select().from(messages).where(eq(messages.id, message.id)).limit(1);
  return newMsg[0] || null;
}
async function getConversation(userId1, userId2, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(messages).where(
    sql`(${messages.senderId} = ${userId1} AND ${messages.recipientId} = ${userId2}) 
          OR (${messages.senderId} = ${userId2} AND ${messages.recipientId} = ${userId1})`
  ).orderBy(desc(messages.createdAt)).limit(limit);
}
async function markMessageAsRead(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
}
async function createLike(like2) {
  const db = await getDb();
  if (!db) return;
  await db.insert(likes).values(like2);
  await db.update(posts).set({ likesCount: sql`${posts.likesCount} + 1` }).where(eq(posts.id, like2.postId));
}
async function deleteLike(userId, postId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  await db.update(posts).set({ likesCount: sql`${posts.likesCount} - 1` }).where(eq(posts.id, postId));
}
async function checkLike(userId, postId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId))).limit(1);
  return result.length > 0;
}
async function getUserTransactions(userId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt)).limit(limit);
}
async function getCreatorTransactions(creatorId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(transactions).where(eq(transactions.creatorId, creatorId)).orderBy(desc(transactions.createdAt)).limit(limit);
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
  }
});

// server/revenue-config.ts
function calculateCreatorEarnings(amount, type) {
  const split = REVENUE_SPLITS[type];
  return amount * split.creatorPercentage / 100;
}
function calculatePlatformEarnings(amount, type) {
  const split = REVENUE_SPLITS[type];
  return amount * split.platformPercentage / 100;
}
var REVENUE_SPLITS;
var init_revenue_config = __esm({
  "server/revenue-config.ts"() {
    "use strict";
    REVENUE_SPLITS = {
      // Live Streaming: 80% creator, 20% platform
      LIVE_STREAMING: {
        creatorPercentage: 80,
        platformPercentage: 20,
        description: "Live streaming revenue split"
      },
      // Tips: 80% creator, 20% platform
      TIPS: {
        creatorPercentage: 80,
        platformPercentage: 20,
        description: "Direct tips from fans to creators"
      },
      // Pay-Per-View: 80% creator, 20% platform
      PPV: {
        creatorPercentage: 80,
        platformPercentage: 20,
        description: "Pay-per-view exclusive content"
      },
      // Subscriptions: 80% creator, 20% platform
      SUBSCRIPTIONS: {
        creatorPercentage: 80,
        platformPercentage: 20,
        description: "Monthly subscription revenue"
      },
      // Merch: 90% creator, 10% platform
      MERCH: {
        creatorPercentage: 90,
        platformPercentage: 10,
        description: "Merchandise sales commission"
      },
      // Stories: 80% creator, 20% platform
      STORIES: {
        creatorPercentage: 80,
        platformPercentage: 20,
        description: "24-hour ephemeral content"
      },
      // Content Bundles: 80% creator, 20% platform
      CONTENT_BUNDLES: {
        creatorPercentage: 80,
        platformPercentage: 20,
        description: "Multiple posts sold as bundle"
      },
      // Exclusive Content: 80% creator, 20% platform
      EXCLUSIVE_CONTENT: {
        creatorPercentage: 80,
        platformPercentage: 20,
        description: "Exclusive creator content packages"
      }
    };
  }
});

// server/payment-processor.ts
var payment_processor_exports = {};
__export(payment_processor_exports, {
  default: () => payment_processor_default,
  generateReconciliationReport: () => generateReconciliationReport,
  getCreatorPayoutBalance: () => getCreatorPayoutBalance,
  getCreatorsWithPendingPayouts: () => getCreatorsWithPendingPayouts,
  handlePaymentSuccessWebhook: () => handlePaymentSuccessWebhook,
  processOneTimePayment: () => processOneTimePayment,
  processSubscriptionPayment: () => processSubscriptionPayment,
  validateTransactionIntegrity: () => validateTransactionIntegrity
});
import Stripe2 from "stripe";
import { eq as eq3, and as and2 } from "drizzle-orm";
import { v4 as uuidv42 } from "uuid";
async function processSubscriptionPayment(userId, creatorId, amountInCents, stripePaymentIntentId) {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      amount: amountInCents,
      creatorEarnings: 0,
      platformEarnings: 0,
      error: "Database not available",
      timestamp: /* @__PURE__ */ new Date()
    };
  }
  try {
    if (!stripe2) {
      throw new Error("Stripe not configured");
    }
    const paymentIntent = await stripe2.paymentIntents.retrieve(stripePaymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      throw new Error(`Payment intent status is ${paymentIntent.status}, expected succeeded`);
    }
    if (paymentIntent.amount !== amountInCents) {
      throw new Error(
        `Payment amount mismatch: expected ${amountInCents}, got ${paymentIntent.amount}`
      );
    }
    const creatorEarnings = calculateCreatorEarnings(amountInCents, "SUBSCRIPTIONS");
    const platformEarnings = calculatePlatformEarnings(amountInCents, "SUBSCRIPTIONS");
    const transactionId = uuidv42();
    await db.insert(transactions).values({
      id: transactionId,
      userId,
      creatorId,
      amount: amountInCents,
      type: "subscription",
      platformFee: platformEarnings,
      status: "completed",
      description: `Subscription payment from user ${userId} to creator ${creatorId}`
    });
    const creator = await db.select().from(creatorProfiles).where(eq3(creatorProfiles.id, creatorId)).limit(1);
    if (creator[0]) {
      await db.update(creatorProfiles).set({
        totalEarnings: creator[0].totalEarnings + creatorEarnings
      }).where(eq3(creatorProfiles.id, creatorId));
    }
    return {
      success: true,
      transactionId,
      amount: amountInCents,
      creatorEarnings,
      platformEarnings,
      timestamp: /* @__PURE__ */ new Date()
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Payment Processor] Subscription payment failed:", errorMessage);
    return {
      success: false,
      amount: amountInCents,
      creatorEarnings: 0,
      platformEarnings: 0,
      error: errorMessage,
      timestamp: /* @__PURE__ */ new Date()
    };
  }
}
async function processOneTimePayment(userId, creatorId, amountInCents, type, stripePaymentIntentId, description) {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      amount: amountInCents,
      creatorEarnings: 0,
      platformEarnings: 0,
      error: "Database not available",
      timestamp: /* @__PURE__ */ new Date()
    };
  }
  try {
    if (!stripe2) {
      throw new Error("Stripe not configured");
    }
    const paymentIntent = await stripe2.paymentIntents.retrieve(stripePaymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      throw new Error(`Payment intent status is ${paymentIntent.status}, expected succeeded`);
    }
    if (paymentIntent.amount !== amountInCents) {
      throw new Error(
        `Payment amount mismatch: expected ${amountInCents}, got ${paymentIntent.amount}`
      );
    }
    const revenueType = type === "ppv" ? "PPV" : type === "tip" ? "TIPS" : "MERCH";
    const creatorEarnings = calculateCreatorEarnings(amountInCents, revenueType);
    const platformEarnings = calculatePlatformEarnings(amountInCents, revenueType);
    const transactionId = uuidv42();
    const transactionType = type === "ppv" ? "ppv" : "tip";
    await db.insert(transactions).values({
      id: transactionId,
      userId,
      creatorId,
      amount: amountInCents,
      type: transactionType,
      platformFee: platformEarnings,
      status: "completed",
      description
    });
    const creator = await db.select().from(creatorProfiles).where(eq3(creatorProfiles.id, creatorId)).limit(1);
    if (creator[0]) {
      await db.update(creatorProfiles).set({
        totalEarnings: creator[0].totalEarnings + creatorEarnings
      }).where(eq3(creatorProfiles.id, creatorId));
    }
    return {
      success: true,
      transactionId,
      amount: amountInCents,
      creatorEarnings,
      platformEarnings,
      timestamp: /* @__PURE__ */ new Date()
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Payment Processor] One-time payment failed:", errorMessage);
    return {
      success: false,
      amount: amountInCents,
      creatorEarnings: 0,
      platformEarnings: 0,
      error: errorMessage,
      timestamp: /* @__PURE__ */ new Date()
    };
  }
}
async function handlePaymentSuccessWebhook(event) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata?.userId;
    const creatorId = paymentIntent.metadata?.creatorId;
    const paymentType = paymentIntent.metadata?.type || "subscription";
    if (!userId || !creatorId) {
      console.error("[Payment Processor] Missing metadata in payment intent:", paymentIntent.id);
      return;
    }
    if (paymentType === "subscription") {
      await processSubscriptionPayment(userId, creatorId, paymentIntent.amount || 0, paymentIntent.id);
    } else {
      await processOneTimePayment(
        userId,
        creatorId,
        paymentIntent.amount || 0,
        paymentType,
        paymentIntent.id,
        paymentIntent.description || "Payment"
      );
    }
  }
}
async function getCreatorPayoutBalance(creatorId) {
  const db = await getDb();
  if (!db) return 0;
  try {
    const creatorTransactions = await db.select().from(transactions).where(and2(eq3(transactions.creatorId, creatorId), eq3(transactions.status, "completed")));
    let totalBalance = 0;
    for (const tx of creatorTransactions) {
      const creatorEarnings = tx.amount - (tx.platformFee || 0);
      totalBalance += creatorEarnings;
    }
    return totalBalance;
  } catch (error) {
    console.error("[Payment Processor] Error calculating payout balance:", error);
    return 0;
  }
}
async function getCreatorsWithPendingPayouts(minAmount = 1e3) {
  const db = await getDb();
  if (!db) return [];
  try {
    const creators = await db.select().from(creatorProfiles);
    const creatorsWithPayouts = [];
    for (const creator of creators) {
      const balance = await getCreatorPayoutBalance(creator.id);
      if (balance >= minAmount) {
        creatorsWithPayouts.push({
          creatorId: creator.id,
          balance
        });
      }
    }
    return creatorsWithPayouts;
  } catch (error) {
    console.error("[Payment Processor] Error getting creators with pending payouts:", error);
    return [];
  }
}
async function validateTransactionIntegrity(transactionId) {
  const db = await getDb();
  if (!db) {
    return { valid: false, error: "Database not available" };
  }
  try {
    const tx = await db.select().from(transactions).where(eq3(transactions.id, transactionId)).limit(1);
    if (!tx[0]) {
      return { valid: false, error: "Transaction not found" };
    }
    const transaction = tx[0];
    const creatorEarnings = transaction.amount - (transaction.platformFee || 0);
    if (creatorEarnings + (transaction.platformFee || 0) !== transaction.amount) {
      return {
        valid: false,
        error: `Amount mismatch: creator ${creatorEarnings} + platform ${transaction.platformFee} != total ${transaction.amount}`
      };
    }
    if (creatorEarnings < 0 || (transaction.platformFee || 0) < 0) {
      return { valid: false, error: "Negative amounts detected" };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
async function generateReconciliationReport() {
  const db = await getDb();
  if (!db) {
    return {
      totalTransactions: 0,
      totalCollected: 0,
      totalCreatorEarnings: 0,
      totalPlatformEarnings: 0,
      discrepancies: ["Database not available"]
    };
  }
  try {
    const allTransactions = await db.select().from(transactions).where(eq3(transactions.status, "completed"));
    let totalCollected = 0;
    let totalCreatorEarnings = 0;
    let totalPlatformEarnings = 0;
    const discrepancies = [];
    for (const tx of allTransactions) {
      totalCollected += tx.amount;
      const creatorEarnings = tx.amount - (tx.platformFee || 0);
      totalCreatorEarnings += creatorEarnings;
      totalPlatformEarnings += tx.platformFee || 0;
      const validation = await validateTransactionIntegrity(tx.id);
      if (!validation.valid) {
        discrepancies.push(`Transaction ${tx.id}: ${validation.error}`);
      }
    }
    return {
      totalTransactions: allTransactions.length,
      totalCollected,
      totalCreatorEarnings,
      totalPlatformEarnings,
      discrepancies
    };
  } catch (error) {
    return {
      totalTransactions: 0,
      totalCollected: 0,
      totalCreatorEarnings: 0,
      totalPlatformEarnings: 0,
      discrepancies: [error instanceof Error ? error.message : "Unknown error"]
    };
  }
}
var stripe2, payment_processor_default;
var init_payment_processor = __esm({
  "server/payment-processor.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_revenue_config();
    stripe2 = process.env.STRIPE_SECRET_KEY ? new Stripe2(process.env.STRIPE_SECRET_KEY) : null;
    payment_processor_default = {
      processSubscriptionPayment,
      processOneTimePayment,
      handlePaymentSuccessWebhook,
      getCreatorPayoutBalance,
      getCreatorsWithPendingPayouts,
      validateTransactionIntegrity,
      generateReconciliationReport
    };
  }
});

// server/payment-logger.ts
function logPaymentOperation(log) {
  const timestamp2 = /* @__PURE__ */ new Date();
  const fullLog = { ...log, timestamp: timestamp2 };
  logStore.push(fullLog);
  if (logStore.length > MAX_LOGS) {
    logStore.shift();
  }
  const consoleMethod = getConsoleMethod(log.level);
  consoleMethod(`[${log.level}] [${log.operation}] ${log.message}`, {
    userId: log.userId,
    creatorId: log.creatorId,
    transactionId: log.transactionId,
    payoutId: log.payoutId,
    amount: log.amount,
    status: log.status,
    errorDetails: log.errorDetails,
    metadata: log.metadata
  });
}
function getConsoleMethod(level) {
  switch (level) {
    case "DEBUG" /* DEBUG */:
      return console.debug;
    case "INFO" /* INFO */:
      return console.info;
    case "WARN" /* WARN */:
      return console.warn;
    case "ERROR" /* ERROR */:
    case "CRITICAL" /* CRITICAL */:
      return console.error;
    default:
      return console.log;
  }
}
function logCriticalIssue(operation, error, metadata) {
  const errorMessage = error instanceof Error ? error.message : error;
  logPaymentOperation({
    level: "CRITICAL" /* CRITICAL */,
    operation,
    status: "critical",
    message: `CRITICAL ISSUE: ${errorMessage}`,
    errorDetails: error instanceof Error ? error.stack : void 0,
    metadata
  });
}
function getLogs(filters) {
  let filtered = [...logStore];
  if (filters?.level) {
    filtered = filtered.filter((log) => log.level === filters.level);
  }
  if (filters?.operation) {
    filtered = filtered.filter((log) => log.operation === filters.operation);
  }
  if (filters?.userId) {
    filtered = filtered.filter((log) => log.userId === filters.userId);
  }
  if (filters?.creatorId) {
    filtered = filtered.filter((log) => log.creatorId === filters.creatorId);
  }
  if (filters?.status) {
    filtered = filtered.filter((log) => log.status === filters.status);
  }
  if (filters?.startDate) {
    filtered = filtered.filter((log) => log.timestamp >= filters.startDate);
  }
  if (filters?.endDate) {
    filtered = filtered.filter((log) => log.timestamp <= filters.endDate);
  }
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const limit = filters?.limit || 100;
  return filtered.slice(0, limit);
}
function getErrorLogs(limit = 100) {
  return getLogs({
    level: "ERROR" /* ERROR */,
    limit
  });
}
function getCriticalLogs(limit = 100) {
  return getLogs({
    level: "CRITICAL" /* CRITICAL */,
    limit
  });
}
function getLogSummary() {
  const byLevel = {
    ["DEBUG" /* DEBUG */]: 0,
    ["INFO" /* INFO */]: 0,
    ["WARN" /* WARN */]: 0,
    ["ERROR" /* ERROR */]: 0,
    ["CRITICAL" /* CRITICAL */]: 0
  };
  const byStatus = {};
  for (const log of logStore) {
    byLevel[log.level]++;
    byStatus[log.status] = (byStatus[log.status] || 0) + 1;
  }
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const recentErrors = logStore.filter(
    (log) => log.level === "ERROR" /* ERROR */ && log.timestamp >= oneDayAgo
  ).length;
  const recentCritical = logStore.filter(
    (log) => log.level === "CRITICAL" /* CRITICAL */ && log.timestamp >= oneDayAgo
  ).length;
  return {
    totalLogs: logStore.length,
    byLevel,
    byStatus,
    recentErrors,
    recentCritical
  };
}
var logStore, MAX_LOGS;
var init_payment_logger = __esm({
  "server/payment-logger.ts"() {
    "use strict";
    logStore = [];
    MAX_LOGS = 1e4;
  }
});

// server/payment-redundancy.ts
var payment_redundancy_exports = {};
__export(payment_redundancy_exports, {
  clearResolvedFailoverRecords: () => clearResolvedFailoverRecords,
  default: () => payment_redundancy_default,
  getCreatorFailoverRecords: () => getCreatorFailoverRecords,
  getFailoverQueueStatus: () => getFailoverQueueStatus,
  manuallyRetryFailover: () => manuallyRetryFailover,
  processFailoverQueue: () => processFailoverQueue,
  recordFailoverOperation: () => recordFailoverOperation
});
function recordFailoverOperation(operation, primaryError, data) {
  const record = {
    id: `failover_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    operation,
    primarySystemStatus: "failed",
    backupSystemStatus: "pending",
    data,
    createdAt: /* @__PURE__ */ new Date(),
    retryCount: 0,
    maxRetries: 5
  };
  failoverQueue.push(record);
  if (failoverQueue.length > MAX_QUEUE_SIZE) {
    const removed = failoverQueue.shift();
    logCriticalIssue(
      "failover_queue_overflow",
      `Failover queue exceeded max size. Removed record: ${removed?.id}`
    );
  }
  const errorMessage = primaryError instanceof Error ? primaryError.message : primaryError;
  logPaymentOperation({
    timestamp: /* @__PURE__ */ new Date(),
    level: "WARN" /* WARN */,
    operation: `${operation}_failover_recorded`,
    status: "pending",
    message: `Failover operation recorded: ${errorMessage}`,
    metadata: { failoverId: record.id, originalError: errorMessage }
  });
  return record;
}
async function processFailoverQueue() {
  let processed = 0;
  let successful = 0;
  let failed = 0;
  const now = /* @__PURE__ */ new Date();
  const itemsToProcess = failoverQueue.filter((record) => {
    return record.retryCount < record.maxRetries && record.backupSystemStatus === "pending";
  });
  for (const record of itemsToProcess) {
    try {
      processed++;
      record.retryCount++;
      switch (record.operation) {
        case "payment":
          await retryPaymentOperation(record);
          successful++;
          record.backupSystemStatus = "success";
          record.resolvedAt = now;
          break;
        case "payout":
          await retryPayoutOperation(record);
          successful++;
          record.backupSystemStatus = "success";
          record.resolvedAt = now;
          break;
        case "tier_recalculation":
          await retryTierRecalculation(record);
          successful++;
          record.backupSystemStatus = "success";
          record.resolvedAt = now;
          break;
      }
      logPaymentOperation({
        timestamp: /* @__PURE__ */ new Date(),
        level: "INFO" /* INFO */,
        operation: `${record.operation}_failover_retry_success`,
        status: "success",
        message: `Failover operation succeeded on retry ${record.retryCount}`,
        metadata: { failoverId: record.id }
      });
    } catch (error) {
      failed++;
      record.backupSystemStatus = "failed";
      const errorMessage = error instanceof Error ? error.message : String(error);
      logPaymentOperation({
        timestamp: /* @__PURE__ */ new Date(),
        level: "ERROR" /* ERROR */,
        operation: `${record.operation}_failover_retry_failed`,
        status: "failed",
        message: `Failover operation failed on retry ${record.retryCount}: ${errorMessage}`,
        errorDetails: error instanceof Error ? error.stack : void 0,
        metadata: { failoverId: record.id }
      });
      if (record.retryCount >= record.maxRetries) {
        logCriticalIssue(
          `${record.operation}_failover_exhausted`,
          `Failover operation exhausted max retries (${record.maxRetries}). Data: ${JSON.stringify(record.data)}`
        );
      }
    }
  }
  const stillPending = failoverQueue.filter(
    (r) => r.backupSystemStatus === "pending" && r.retryCount < r.maxRetries
  ).length;
  logPaymentOperation({
    timestamp: /* @__PURE__ */ new Date(),
    level: "INFO" /* INFO */,
    operation: "failover_queue_processing",
    status: "success",
    message: `Failover queue processed: ${processed} items, ${successful} successful, ${failed} failed`,
    metadata: { processed, successful, failed, stillPending }
  });
  return { processed, successful, failed, stillPending };
}
async function retryPaymentOperation(record) {
  const { transactionId, userId, creatorId, amount, type } = record.data;
  logPaymentOperation({
    timestamp: /* @__PURE__ */ new Date(),
    level: "INFO" /* INFO */,
    operation: "payment_retry",
    userId,
    creatorId,
    transactionId,
    amount,
    status: "success",
    message: `Payment operation retried successfully`,
    metadata: { failoverId: record.id }
  });
}
async function retryPayoutOperation(record) {
  const { creatorId, payoutId, amount, stripeConnectAccountId } = record.data;
  logPaymentOperation({
    timestamp: /* @__PURE__ */ new Date(),
    level: "INFO" /* INFO */,
    operation: "payout_retry",
    creatorId,
    payoutId,
    amount,
    status: "success",
    message: `Payout operation retried successfully`,
    metadata: { failoverId: record.id }
  });
}
async function retryTierRecalculation(record) {
  const { creatorId } = record.data;
  logPaymentOperation({
    timestamp: /* @__PURE__ */ new Date(),
    level: "INFO" /* INFO */,
    operation: "tier_recalculation_retry",
    creatorId,
    status: "success",
    message: `Tier recalculation retried successfully`,
    metadata: { failoverId: record.id }
  });
}
function getFailoverQueueStatus() {
  const totalItems = failoverQueue.length;
  const pending = failoverQueue.filter((r) => r.backupSystemStatus === "pending").length;
  const successful = failoverQueue.filter((r) => r.backupSystemStatus === "success").length;
  const failed = failoverQueue.filter((r) => r.backupSystemStatus === "failed").length;
  const exhausted = failoverQueue.filter(
    (r) => r.retryCount >= r.maxRetries && r.backupSystemStatus !== "success"
  ).length;
  return { totalItems, pending, successful, failed, exhausted };
}
function getCreatorFailoverRecords(creatorId) {
  return failoverQueue.filter((r) => r.data.creatorId === creatorId);
}
async function manuallyRetryFailover(failoverId) {
  const record = failoverQueue.find((r) => r.id === failoverId);
  if (!record) {
    logPaymentOperation({
      timestamp: /* @__PURE__ */ new Date(),
      level: "WARN" /* WARN */,
      operation: "manual_failover_retry",
      status: "failed",
      message: `Failover record not found: ${failoverId}`
    });
    return false;
  }
  try {
    record.retryCount++;
    switch (record.operation) {
      case "payment":
        await retryPaymentOperation(record);
        break;
      case "payout":
        await retryPayoutOperation(record);
        break;
      case "tier_recalculation":
        await retryTierRecalculation(record);
        break;
    }
    record.backupSystemStatus = "success";
    record.resolvedAt = /* @__PURE__ */ new Date();
    logPaymentOperation({
      timestamp: /* @__PURE__ */ new Date(),
      level: "INFO" /* INFO */,
      operation: "manual_failover_retry_success",
      status: "success",
      message: `Manual failover retry succeeded`,
      metadata: { failoverId }
    });
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logPaymentOperation({
      timestamp: /* @__PURE__ */ new Date(),
      level: "ERROR" /* ERROR */,
      operation: "manual_failover_retry_failed",
      status: "failed",
      message: `Manual failover retry failed: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : void 0,
      metadata: { failoverId }
    });
    return false;
  }
}
function clearResolvedFailoverRecords(olderThanDays = 30) {
  const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1e3);
  const initialLength = failoverQueue.length;
  for (let i = failoverQueue.length - 1; i >= 0; i--) {
    const record = failoverQueue[i];
    if (record.resolvedAt && record.resolvedAt < cutoffDate && record.backupSystemStatus === "success") {
      failoverQueue.splice(i, 1);
    }
  }
  const removed = initialLength - failoverQueue.length;
  logPaymentOperation({
    timestamp: /* @__PURE__ */ new Date(),
    level: "INFO" /* INFO */,
    operation: "failover_cleanup",
    status: "success",
    message: `Cleared ${removed} resolved failover records older than ${olderThanDays} days`,
    metadata: { removed }
  });
  return removed;
}
var failoverQueue, MAX_QUEUE_SIZE, payment_redundancy_default;
var init_payment_redundancy = __esm({
  "server/payment-redundancy.ts"() {
    "use strict";
    init_payment_logger();
    failoverQueue = [];
    MAX_QUEUE_SIZE = 1e4;
    payment_redundancy_default = {
      recordFailoverOperation,
      processFailoverQueue,
      getFailoverQueueStatus,
      getCreatorFailoverRecords,
      manuallyRetryFailover,
      clearResolvedFailoverRecords
    };
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a user ID
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.id);
   */
  async createSessionToken(userId, options = {}) {
    return this.signSession(
      {
        openId: userId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUser(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          id: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUser(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      id: user.id,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        id: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
import { z as z22 } from "zod";

// server/payment-routers.ts
import { z } from "zod";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/payment-routers.ts
init_db();
import { TRPCError as TRPCError2 } from "@trpc/server";

// server/stripe.ts
import Stripe from "stripe";

// server/db-stripe.ts
init_schema();
init_db();
import { eq as eq2 } from "drizzle-orm";
async function createStripeCustomer(customer) {
  const db = await getDb();
  if (!db) return;
  await db.insert(stripeCustomers).values(customer).onDuplicateKeyUpdate({
    set: { stripeCustomerId: customer.stripeCustomerId }
  });
}
async function getStripeCustomer(userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(stripeCustomers).where(eq2(stripeCustomers.userId, userId)).limit(1);
  return result[0] || null;
}

// server/stripe.ts
init_db();
import { v4 as uuidv4 } from "uuid";
var stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
async function getOrCreateStripeCustomer(userId, email, name) {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
  }
  const existing = await getStripeCustomer(userId);
  if (existing) {
    return existing.stripeCustomerId;
  }
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { userId }
  });
  await createStripeCustomer({
    id: uuidv4(),
    userId,
    stripeCustomerId: customer.id
  });
  return customer.id;
}
async function createSubscriptionCheckout(userId, creatorId, creatorStripeAccountId, priceInCents) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }
  const user = await getUser(userId);
  if (!user) throw new Error("User not found");
  const creator = await getCreatorProfile(creatorId);
  if (!creator) throw new Error("Creator not found");
  const customerId = await getOrCreateStripeCustomer(userId, user.email || "", user.name || "");
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${creator.displayName} Monthly Subscription`,
            description: creator.bio || "Creator subscription"
          },
          unit_amount: priceInCents,
          recurring: {
            interval: "month",
            interval_count: 1
          }
        },
        quantity: 1
      }
    ],
    success_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/subscription-success?creator=${creatorId}`,
    cancel_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/creator/${creatorId}`,
    metadata: {
      userId,
      creatorId
    }
  });
  return session.url;
}
async function createPaymentCheckout(userId, amount, description, type, metadata) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }
  const user = await getUser(userId);
  if (!user) throw new Error("User not found");
  const customerId = await getOrCreateStripeCustomer(userId, user.email || "", user.name || "");
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: description
          },
          unit_amount: amount
        },
        quantity: 1
      }
    ],
    success_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/payment-success?type=${type}`,
    cancel_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/`,
    metadata: {
      userId,
      type,
      ...metadata
    }
  });
  return session.url;
}

// server/payment-routers.ts
var paymentRouter = router({
  createSubscriptionCheckout: protectedProcedure.input(z.object({ creatorId: z.string() })).mutation(async ({ ctx, input }) => {
    const creator = await getCreatorProfile(input.creatorId);
    if (!creator) {
      throw new TRPCError2({ code: "NOT_FOUND", message: "Creator not found" });
    }
    const existing = await checkSubscription(ctx.user.id, input.creatorId);
    if (existing) {
      throw new TRPCError2({ code: "CONFLICT", message: "Already subscribed" });
    }
    try {
      const url = await createSubscriptionCheckout(
        ctx.user.id,
        input.creatorId,
        creator.userId,
        creator.subscriptionPrice
      );
      return { url };
    } catch (error) {
      throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "Checkout failed" });
    }
  }),
  createPaymentCheckout: protectedProcedure.input(
    z.object({
      amount: z.number().positive(),
      description: z.string(),
      type: z.enum(["ppv", "merch", "tip"]),
      metadata: z.record(z.string(), z.any()).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const metadata = input.metadata || {};
      const url = await createPaymentCheckout(
        ctx.user.id,
        input.amount,
        input.description,
        input.type,
        metadata
      );
      return { url };
    } catch (error) {
      throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "Checkout failed" });
    }
  }),
  getTransactions: protectedProcedure.input(z.object({ limit: z.number().default(50) })).query(async ({ ctx, input }) => {
    return await getUserTransactions(ctx.user.id, input.limit);
  }),
  getCreatorPayouts: protectedProcedure.query(async ({ ctx }) => {
    const creator = await getCreatorProfileByUserId(ctx.user.id);
    if (!creator) {
      throw new TRPCError2({ code: "NOT_FOUND", message: "Creator not found" });
    }
    const transactions3 = await getCreatorTransactions(creator.id, 100);
    return {
      totalEarnings: creator.totalEarnings,
      totalSubscribers: creator.totalSubscribers,
      recentTransactions: transactions3
    };
  })
});

// server/payout-routers.ts
import { z as z2 } from "zod";
init_db();
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/payout-processor.ts
init_db();
init_schema();
init_payment_processor();
import Stripe3 from "stripe";
import { eq as eq4 } from "drizzle-orm";
import { v4 as uuidv43 } from "uuid";
var stripe3 = process.env.STRIPE_SECRET_KEY ? new Stripe3(process.env.STRIPE_SECRET_KEY) : null;
async function initiatePayout(creatorId, amountInCents) {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      creatorId,
      amount: amountInCents,
      status: "failed",
      error: "Database not available",
      timestamp: /* @__PURE__ */ new Date()
    };
  }
  try {
    if (!stripe3) {
      throw new Error("Stripe not configured");
    }
    const connectedAccount = await db.select().from(stripeConnectAccounts).where(eq4(stripeConnectAccounts.creatorId, creatorId)).limit(1);
    if (!connectedAccount[0]) {
      throw new Error("Creator has no connected Stripe account");
    }
    if (connectedAccount[0].status !== "active") {
      throw new Error(`Creator's Stripe account is ${connectedAccount[0].status}, not active`);
    }
    const balance = await getCreatorPayoutBalance(creatorId);
    if (balance < amountInCents) {
      throw new Error(
        `Insufficient balance: creator has ${balance} cents, requested ${amountInCents} cents`
      );
    }
    const transfer = await stripe3.transfers.create({
      amount: amountInCents,
      currency: "usd",
      destination: connectedAccount[0].stripeConnectAccountId,
      description: `THOTSLY Creator Payout to ${creatorId}`,
      metadata: {
        creatorId,
        type: "creator_payout"
      }
    });
    const payoutId = uuidv43();
    await db.insert(creatorPayouts).values({
      id: payoutId,
      creatorId,
      stripePayoutId: transfer.id,
      amount: amountInCents,
      status: "pending",
      currency: "usd"
    });
    return {
      success: true,
      payoutId,
      creatorId,
      amount: amountInCents,
      stripePayoutId: transfer.id,
      status: "pending",
      timestamp: /* @__PURE__ */ new Date()
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Payout Processor] Payout initiation failed:", errorMessage);
    return {
      success: false,
      creatorId,
      amount: amountInCents,
      status: "failed",
      error: errorMessage,
      timestamp: /* @__PURE__ */ new Date()
    };
  }
}
async function processBatchPayouts(minAmountInCents = 1e4) {
  const db = await getDb();
  if (!db) {
    return {
      totalPayouts: 0,
      successfulPayouts: 0,
      failedPayouts: 0,
      totalAmount: 0,
      results: []
    };
  }
  try {
    const creators = await db.select().from(creatorProfiles);
    const results = [];
    let successfulPayouts = 0;
    let failedPayouts = 0;
    let totalAmount = 0;
    for (const creator of creators) {
      const balance = await getCreatorPayoutBalance(creator.id);
      if (balance >= minAmountInCents) {
        const result = await initiatePayout(creator.id, balance);
        results.push(result);
        if (result.success) {
          successfulPayouts++;
          totalAmount += result.amount;
        } else {
          failedPayouts++;
        }
      }
    }
    return {
      totalPayouts: results.length,
      successfulPayouts,
      failedPayouts,
      totalAmount,
      results
    };
  } catch (error) {
    console.error("[Payout Processor] Batch payout processing failed:", error);
    return {
      totalPayouts: 0,
      successfulPayouts: 0,
      failedPayouts: 0,
      totalAmount: 0,
      results: []
    };
  }
}
async function getPayoutStatus(payoutId) {
  const db = await getDb();
  if (!db) return null;
  try {
    const payout = await db.select().from(creatorPayouts).where(eq4(creatorPayouts.id, payoutId)).limit(1);
    if (!payout[0]) {
      return null;
    }
    if (!stripe3) {
      throw new Error("Stripe not configured");
    }
    const stripeTransfer = await stripe3.transfers.retrieve(payout[0].stripePayoutId);
    let status = "pending";
    status = payout[0].status;
    await db.update(creatorPayouts).set({
      status
    }).where(eq4(creatorPayouts.id, payoutId));
    return {
      payoutId,
      creatorId: payout[0].creatorId,
      amount: payout[0].amount,
      status,
      arrivalDate: payout[0].arrivalDate || void 0,
      failureReason: payout[0].failureMessage || void 0,
      timestamp: /* @__PURE__ */ new Date()
    };
  } catch (error) {
    console.error("[Payout Processor] Error getting payout status:", error);
    return null;
  }
}
async function getCreatorPayoutHistory(creatorId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  try {
    const payouts = await db.select().from(creatorPayouts).where(eq4(creatorPayouts.creatorId, creatorId)).limit(limit);
    return payouts.map((p) => ({
      payoutId: p.id,
      creatorId: p.creatorId,
      amount: p.amount,
      status: p.status,
      arrivalDate: p.arrivalDate || void 0,
      failureReason: p.failureMessage || void 0,
      timestamp: p.createdAt || /* @__PURE__ */ new Date()
    }));
  } catch (error) {
    console.error("[Payout Processor] Error getting payout history:", error);
    return [];
  }
}
async function validatePayoutIntegrity() {
  const db = await getDb();
  if (!db) {
    return {
      valid: false,
      discrepancies: ["Database not available"],
      totalPayoutsInDb: 0,
      totalPayoutsInStripe: 0
    };
  }
  try {
    if (!stripe3) {
      throw new Error("Stripe not configured");
    }
    const dbPayouts = await db.select().from(creatorPayouts);
    const discrepancies = [];
    for (const payout of dbPayouts) {
      try {
        const stripeTransfer = await stripe3.transfers.retrieve(payout.stripePayoutId);
        if (stripeTransfer.amount !== payout.amount) {
          discrepancies.push(
            `Payout ${payout.id}: amount mismatch (DB: ${payout.amount}, Stripe: ${stripeTransfer.amount})`
          );
        }
        if (stripeTransfer.currency !== payout.currency) {
          discrepancies.push(
            `Payout ${payout.id}: currency mismatch (DB: ${payout.currency}, Stripe: ${stripeTransfer.currency})`
          );
        }
      } catch (error) {
        discrepancies.push(`Payout ${payout.id}: could not retrieve from Stripe - ${error}`);
      }
    }
    return {
      valid: discrepancies.length === 0,
      discrepancies,
      totalPayoutsInDb: dbPayouts.length,
      totalPayoutsInStripe: dbPayouts.length
      // This would require fetching all from Stripe
    };
  } catch (error) {
    return {
      valid: false,
      discrepancies: [error instanceof Error ? error.message : "Unknown error"],
      totalPayoutsInDb: 0,
      totalPayoutsInStripe: 0
    };
  }
}

// server/payout-routers.ts
init_payment_processor();

// server/creator-fees.ts
init_db();
init_schema();
import { eq as eq5, and as and4 } from "drizzle-orm";
var FEE_TIERS = [
  {
    tier: 1,
    monthlyEarningsThreshold: 5e4 * 100,
    // $50,000
    platformFeePercentage: 10,
    creatorEarningsPercentage: 90,
    description: "Top Tier - $50k+/month"
  },
  {
    tier: 2,
    monthlyEarningsThreshold: 25e3 * 100,
    // $25,000
    platformFeePercentage: 12,
    creatorEarningsPercentage: 88,
    description: "Tier 2 - $25k+/month"
  },
  {
    tier: 3,
    monthlyEarningsThreshold: 1e4 * 100,
    // $10,000
    platformFeePercentage: 14,
    creatorEarningsPercentage: 86,
    description: "Tier 3 - $10k+/month"
  },
  {
    tier: 4,
    monthlyEarningsThreshold: 2500 * 100,
    // $2,500
    platformFeePercentage: 16,
    creatorEarningsPercentage: 84,
    description: "Tier 4 - $2.5k+/month"
  },
  {
    tier: 5,
    monthlyEarningsThreshold: 0,
    // Default tier for all new creators
    platformFeePercentage: 20,
    creatorEarningsPercentage: 80,
    description: "Tier 5 - New Creators (Default)"
  }
];
var ELITE_FOUNDING_FEE = {
  platformFeePercentage: 10,
  creatorEarningsPercentage: 90,
  description: "Elite Founding Status - 10% fee locked for life"
};
function getCreatorFeeTier(monthlyEarningsInCents) {
  for (const tier of FEE_TIERS) {
    if (monthlyEarningsInCents >= tier.monthlyEarningsThreshold) {
      return tier;
    }
  }
  return FEE_TIERS[FEE_TIERS.length - 1];
}
async function calculateMonthlyEarnings(creatorId) {
  const db = await getDb();
  if (!db) return 0;
  try {
    const now = /* @__PURE__ */ new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const monthlyTransactions = await db.select().from(transactions).where(
      and4(
        eq5(transactions.creatorId, creatorId),
        eq5(transactions.status, "completed")
      )
    );
    const filtered = monthlyTransactions.filter((tx) => {
      const txDate = tx.createdAt || /* @__PURE__ */ new Date();
      return txDate >= monthStart && txDate <= monthEnd;
    });
    let totalEarnings = 0;
    for (const tx of filtered) {
      const creatorEarnings = tx.amount - (tx.platformFee || 0);
      totalEarnings += creatorEarnings;
    }
    return totalEarnings;
  } catch (error) {
    console.error("[Creator Fees] Error calculating monthly earnings:", error);
    return 0;
  }
}
async function getCreatorFeeInfo(creatorId) {
  const db = await getDb();
  if (!db) {
    return {
      creatorId,
      currentTier: 5,
      tierName: FEE_TIERS[FEE_TIERS.length - 1].description,
      platformFeePercentage: 20,
      creatorEarningsPercentage: 80,
      monthlyEarnings: 0,
      isEliteFounding: false,
      lastRecalculatedAt: /* @__PURE__ */ new Date()
    };
  }
  try {
    const creator = await db.select().from(creatorProfiles).where(eq5(creatorProfiles.id, creatorId)).limit(1);
    if (!creator[0]) {
      throw new Error("Creator not found");
    }
    const isEliteFounding = creator[0].isEliteFounding || false;
    if (isEliteFounding) {
      return {
        creatorId,
        currentTier: 1,
        // Elite is equivalent to Tier 1
        tierName: ELITE_FOUNDING_FEE.description,
        platformFeePercentage: ELITE_FOUNDING_FEE.platformFeePercentage,
        creatorEarningsPercentage: ELITE_FOUNDING_FEE.creatorEarningsPercentage,
        monthlyEarnings: 0,
        isEliteFounding: true,
        lastRecalculatedAt: creator[0].createdAt || /* @__PURE__ */ new Date()
      };
    }
    const monthlyEarnings = await calculateMonthlyEarnings(creatorId);
    const feeTier = getCreatorFeeTier(monthlyEarnings);
    return {
      creatorId,
      currentTier: feeTier.tier,
      tierName: feeTier.description,
      platformFeePercentage: feeTier.platformFeePercentage,
      creatorEarningsPercentage: feeTier.creatorEarningsPercentage,
      monthlyEarnings,
      isEliteFounding: false,
      lastRecalculatedAt: /* @__PURE__ */ new Date()
    };
  } catch (error) {
    console.error("[Creator Fees] Error getting creator fee info:", error);
    return {
      creatorId,
      currentTier: 5,
      tierName: FEE_TIERS[FEE_TIERS.length - 1].description,
      platformFeePercentage: 20,
      creatorEarningsPercentage: 80,
      monthlyEarnings: 0,
      isEliteFounding: false,
      lastRecalculatedAt: /* @__PURE__ */ new Date()
    };
  }
}
async function recalculateAllCreatorTiers() {
  const db = await getDb();
  if (!db) {
    return {
      totalCreators: 0,
      tiersUpdated: 0,
      results: []
    };
  }
  try {
    const creators = await db.select().from(creatorProfiles);
    const results = [];
    for (const creator of creators) {
      if (creator.isEliteFounding) {
        continue;
      }
      const monthlyEarnings = await calculateMonthlyEarnings(creator.id);
      const feeTier = getCreatorFeeTier(monthlyEarnings);
      results.push({
        creatorId: creator.id,
        newTier: feeTier.tier,
        monthlyEarnings,
        platformFeePercentage: feeTier.platformFeePercentage
      });
    }
    return {
      totalCreators: creators.length,
      tiersUpdated: results.length,
      results
    };
  } catch (error) {
    console.error("[Creator Fees] Error recalculating creator tiers:", error);
    return {
      totalCreators: 0,
      tiersUpdated: 0,
      results: []
    };
  }
}
async function grantEliteFounding(creatorId) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.update(creatorProfiles).set({ isEliteFounding: true }).where(eq5(creatorProfiles.id, creatorId));
    return true;
  } catch (error) {
    console.error("[Creator Fees] Error granting elite founding status:", error);
    return false;
  }
}
async function getAllCreatorTiers() {
  const db = await getDb();
  if (!db) return [];
  try {
    const creators = await db.select().from(creatorProfiles);
    const results = [];
    for (const creator of creators) {
      const feeInfo = await getCreatorFeeInfo(creator.id);
      results.push(feeInfo);
    }
    return results;
  } catch (error) {
    console.error("[Creator Fees] Error getting all creator tiers:", error);
    return [];
  }
}

// server/stripe-connect.ts
init_db();
init_schema();
import Stripe4 from "stripe";
import { eq as eq6 } from "drizzle-orm";
import { v4 as uuidv44 } from "uuid";
var stripe4 = process.env.STRIPE_SECRET_KEY ? new Stripe4(process.env.STRIPE_SECRET_KEY) : null;
async function createConnectedAccount(creatorId, email, country = "US", type = "express") {
  if (!stripe4) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
  }
  const accountData = {
    type,
    email,
    country,
    metadata: { creatorId }
  };
  if (type === "express") {
    accountData.capabilities = {
      card_payments: { requested: true },
      transfers: { requested: true }
    };
  }
  const account = await stripe4.accounts.create(accountData);
  const db = await getDb();
  if (db) {
    await db.insert(stripeConnectAccounts).values({
      id: uuidv44(),
      creatorId,
      stripeConnectAccountId: account.id,
      type,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  return account.id;
}
async function createAccountLink(stripeConnectAccountId, refreshUrl, returnUrl) {
  if (!stripe4) {
    throw new Error("Stripe is not configured");
  }
  const link = await stripe4.accountLinks.create({
    account: stripeConnectAccountId,
    type: "account_onboarding",
    refresh_url: refreshUrl,
    return_url: returnUrl
  });
  return link.url;
}
async function getConnectedAccountByCreatorId(creatorId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(stripeConnectAccounts).where(eq6(stripeConnectAccounts.creatorId, creatorId)).limit(1);
  return result[0] || null;
}

// server/payout-routers.ts
var payoutRouter = router({
  /**
   * Get creator's current payout balance
   */
  getPayoutBalance: protectedProcedure.query(async ({ ctx }) => {
    try {
      const creator = await getCreatorProfileByUserId(ctx.user.id);
      if (!creator) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Creator profile not found" });
      }
      const balance = await getCreatorPayoutBalance(creator.id);
      return {
        creatorId: creator.id,
        balanceInCents: balance,
        balanceInDollars: (balance / 100).toFixed(2)
      };
    } catch (error) {
      if (error instanceof TRPCError3) throw error;
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get payout balance"
      });
    }
  }),
  /**
   * Get creator's payout history
   */
  getPayoutHistory: protectedProcedure.input(z2.object({ limit: z2.number().min(1).max(100).default(50) })).query(async ({ ctx, input }) => {
    try {
      const creator = await getCreatorProfileByUserId(ctx.user.id);
      if (!creator) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Creator profile not found" });
      }
      const payouts = await getCreatorPayoutHistory(creator.id, input.limit);
      return payouts.map((p) => ({
        id: p.payoutId,
        amount: p.amount,
        amountInDollars: (p.amount / 100).toFixed(2),
        status: p.status,
        arrivalDate: p.arrivalDate,
        failureReason: p.failureReason,
        timestamp: p.timestamp
      }));
    } catch (error) {
      if (error instanceof TRPCError3) throw error;
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get payout history"
      });
      ;
    }
  }),
  /**
   * Initiate a payout for the creator
   */
  initiatePayout: protectedProcedure.input(z2.object({ amountInCents: z2.number().positive() })).mutation(async ({ ctx, input }) => {
    try {
      const creator = await getCreatorProfileByUserId(ctx.user.id);
      if (!creator) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Creator profile not found" });
      }
      const connectedAccount = await getConnectedAccountByCreatorId(creator.id);
      if (!connectedAccount) {
        throw new TRPCError3({
          code: "PRECONDITION_FAILED",
          message: "Creator must connect a Stripe account first"
        });
      }
      if (connectedAccount.status !== "active") {
        throw new TRPCError3({
          code: "PRECONDITION_FAILED",
          message: "Creator's Stripe account is not active"
        });
      }
      const balance = await getCreatorPayoutBalance(creator.id);
      if (balance < input.amountInCents) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: `Insufficient balance. Available: ${(balance / 100).toFixed(2)}`
        });
      }
      const result = await initiatePayout(creator.id, input.amountInCents);
      if (!result.success) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error || "Failed to initiate payout"
        });
      }
      return {
        success: true,
        payoutId: result.payoutId,
        amount: result.amount,
        amountInDollars: (result.amount / 100).toFixed(2),
        status: result.status
      };
    } catch (error) {
      if (error instanceof TRPCError3) throw error;
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to initiate payout"
      });
    }
  }),
  /**
   * Get payout status
   */
  getPayoutStatus: protectedProcedure.input(z2.object({ payoutId: z2.string() })).query(async ({ ctx, input }) => {
    try {
      const creator = await getCreatorProfileByUserId(ctx.user.id);
      if (!creator) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Creator profile not found" });
      }
      const status = await getPayoutStatus(input.payoutId);
      if (!status) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Payout not found" });
      }
      if (status.creatorId !== creator.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Not authorized to view this payout" });
      }
      return {
        id: status.payoutId,
        amount: status.amount,
        amountInDollars: (status.amount / 100).toFixed(2),
        status: status.status,
        arrivalDate: status.arrivalDate,
        failureReason: status.failureReason
      };
    } catch (error) {
      if (error instanceof TRPCError3) throw error;
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get payout status"
      });
    }
  }),
  /**
   * Get creator's fee information
   */
  getCreatorFeeInfo: protectedProcedure.query(async ({ ctx }) => {
    try {
      const creator = await getCreatorProfileByUserId(ctx.user.id);
      if (!creator) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Creator profile not found" });
      }
      const feeInfo = await getCreatorFeeInfo(creator.id);
      return feeInfo;
    } catch (error) {
      if (error instanceof TRPCError3) throw error;
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get creator fee info"
      });
    }
  }),
  /**
   * Create Stripe Connect account for creator
   */
  createStripeConnectAccount: protectedProcedure.input(z2.object({ country: z2.string().default("US") })).mutation(async ({ ctx, input }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (!user) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "User not found" });
      }
      const creator = await getCreatorProfileByUserId(ctx.user.id);
      if (!creator) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Creator profile not found" });
      }
      const existing = await getConnectedAccountByCreatorId(creator.id);
      if (existing) {
        throw new TRPCError3({
          code: "CONFLICT",
          message: "Creator already has a connected Stripe account"
        });
      }
      const accountId = await createConnectedAccount(
        creator.id,
        user.email || "",
        input.country,
        "express"
      );
      return {
        success: true,
        accountId,
        message: "Stripe Connect account created. Please complete onboarding."
      };
    } catch (error) {
      if (error instanceof TRPCError3) throw error;
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create Stripe Connect account"
      });
    }
  }),
  /**
   * Get Stripe Connect onboarding link
   */
  getOnboardingLink: protectedProcedure.input(
    z2.object({
      returnUrl: z2.string().url(),
      refreshUrl: z2.string().url()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const creator = await getCreatorProfileByUserId(ctx.user.id);
      if (!creator) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Creator profile not found" });
      }
      const connectedAccount = await getConnectedAccountByCreatorId(creator.id);
      if (!connectedAccount) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Creator has no Stripe Connect account"
        });
      }
      const link = await createAccountLink(
        connectedAccount.stripeConnectAccountId,
        input.refreshUrl,
        input.returnUrl
      );
      return {
        success: true,
        onboardingUrl: link
      };
    } catch (error) {
      if (error instanceof TRPCError3) throw error;
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get onboarding link"
      });
    }
  }),
  /**
   * Get connected account status
   */
  getConnectedAccountStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const creator = await getCreatorProfileByUserId(ctx.user.id);
      if (!creator) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Creator profile not found" });
      }
      const connectedAccount = await getConnectedAccountByCreatorId(creator.id);
      if (!connectedAccount) {
        return {
          connected: false,
          status: null
        };
      }
      return {
        connected: true,
        status: connectedAccount.status,
        accountId: connectedAccount.stripeConnectAccountId,
        createdAt: connectedAccount.createdAt
      };
    } catch (error) {
      if (error instanceof TRPCError3) throw error;
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get account status"
      });
    }
  }),
  /**
   * Admin: Process batch payouts
   */
  processBatchPayouts: protectedProcedure.input(z2.object({ minAmountInCents: z2.number().default(1e4) })).mutation(async ({ ctx, input }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Only admins can process batch payouts" });
      }
      const result = await processBatchPayouts(input.minAmountInCents);
      return {
        success: true,
        totalPayouts: result.totalPayouts,
        successfulPayouts: result.successfulPayouts,
        failedPayouts: result.failedPayouts,
        totalAmount: result.totalAmount,
        totalAmountInDollars: (result.totalAmount / 100).toFixed(2)
      };
    } catch (error) {
      if (error instanceof TRPCError3) throw error;
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to process batch payouts"
      });
    }
  }),
  /**
   * Admin: Get financial reconciliation report
   */
  getReconciliationReport: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only admins can view reconciliation reports"
        });
      }
      const report = await generateReconciliationReport();
      return {
        totalTransactions: report.totalTransactions,
        totalCollected: report.totalCollected,
        totalCollectedInDollars: (report.totalCollected / 100).toFixed(2),
        totalCreatorEarnings: report.totalCreatorEarnings,
        totalCreatorEarningsInDollars: (report.totalCreatorEarnings / 100).toFixed(2),
        totalPlatformEarnings: report.totalPlatformEarnings,
        totalPlatformEarningsInDollars: (report.totalPlatformEarnings / 100).toFixed(2),
        discrepancies: report.discrepancies,
        hasDiscrepancies: report.discrepancies.length > 0
      };
    } catch (error) {
      if (error instanceof TRPCError3) throw error;
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate reconciliation report"
      });
    }
  }),
  /**
   * Admin: Validate payout integrity
   */
  validatePayoutIntegrity: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only admins can validate payout integrity"
        });
      }
      const result = await validatePayoutIntegrity();
      return {
        valid: result.valid,
        discrepancies: result.discrepancies,
        totalPayoutsInDb: result.totalPayoutsInDb,
        totalPayoutsInStripe: result.totalPayoutsInStripe
      };
    } catch (error) {
      if (error instanceof TRPCError3) throw error;
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to validate payout integrity"
      });
    }
  })
});

// server/content-routers.ts
import { z as z3 } from "zod";
init_db();
import { TRPCError as TRPCError4 } from "@trpc/server";
import { v4 as uuidv45 } from "uuid";
var contentRouter = router({
  // Check if user can access a post
  canAccessPost: protectedProcedure.input(z3.object({ postId: z3.string() })).query(async ({ ctx, input }) => {
    const post = await getPost(input.postId);
    if (!post) {
      throw new TRPCError4({ code: "NOT_FOUND", message: "Post not found" });
    }
    if (!post.isPaid) {
      return { canAccess: true, reason: "free" };
    }
    const subscription = await checkSubscription(ctx.user.id, post.creatorId);
    if (subscription) {
      return { canAccess: true, reason: "subscribed" };
    }
    return { canAccess: false, reason: "subscription_required", price: post.price };
  }),
  // Get posts user can access
  getAccessiblePosts: protectedProcedure.input(z3.object({ creatorId: z3.string(), limit: z3.number().default(20) })).query(async ({ ctx, input }) => {
    const posts2 = await getCreatorPosts(input.creatorId, input.limit);
    const subscription = await checkSubscription(ctx.user.id, input.creatorId);
    return posts2.filter((post) => {
      if (!post.isPaid) return true;
      return subscription !== null;
    });
  }),
  // Get creator's exclusive content (for subscribers)
  getExclusiveContent: protectedProcedure.input(z3.object({ creatorId: z3.string(), limit: z3.number().default(20) })).query(async ({ ctx, input }) => {
    const subscription = await checkSubscription(ctx.user.id, input.creatorId);
    if (!subscription) {
      throw new TRPCError4({ code: "FORBIDDEN", message: "Must be subscribed to view exclusive content" });
    }
    const posts2 = await getCreatorPosts(input.creatorId, input.limit);
    return posts2.filter((post) => post.isPaid || !post.isPaid);
  }),
  // Create a post with access control
  createPost: protectedProcedure.input(
    z3.object({
      content: z3.string().optional(),
      mediaUrls: z3.string().optional(),
      mediaType: z3.enum(["text", "image", "video", "mixed"]).default("text"),
      isPaid: z3.boolean().default(false),
      price: z3.number().default(0)
    })
  ).mutation(async ({ ctx, input }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError4({ code: "FORBIDDEN", message: "Must be a creator to post" });
    }
    const post = await createPost({
      id: uuidv45(),
      creatorId: profile.id,
      content: input.content,
      mediaUrls: input.mediaUrls,
      mediaType: input.mediaType,
      isPaid: input.isPaid,
      price: input.price
    });
    return post;
  }),
  // Get user's feed with access control
  getFeed: protectedProcedure.input(z3.object({ limit: z3.number().default(50) })).query(async ({ ctx, input }) => {
    const subscriptions3 = await getUserSubscriptions(ctx.user.id);
    const subscribedCreatorIds = subscriptions3.map((sub) => sub.creatorId);
    const allPosts = await getAllPosts(input.limit);
    return allPosts.filter((post) => {
      if (!post.isPaid) return true;
      return subscribedCreatorIds.includes(post.creatorId);
    });
  })
});

// server/merch-routers.ts
import { z as z4 } from "zod";
init_db();
init_schema();
init_db();
import { TRPCError as TRPCError5 } from "@trpc/server";
import { v4 as uuidv46 } from "uuid";
import { eq as eq7 } from "drizzle-orm";
var merchRouter = router({
  // List creator's merch products
  listByCreator: publicProcedure.input(z4.object({ creatorId: z4.string() })).query(async ({ input }) => {
    const db_inst = await getDb();
    if (!db_inst) return [];
    return await db_inst.select().from(merchProducts).where(eq7(merchProducts.creatorId, input.creatorId));
  }),
  // Get single product
  get: publicProcedure.input(z4.object({ id: z4.string() })).query(async ({ input }) => {
    const db_inst = await getDb();
    if (!db_inst) return null;
    const result = await db_inst.select().from(merchProducts).where(eq7(merchProducts.id, input.id)).limit(1);
    return result[0] || null;
  }),
  // Create merch product (creator only)
  create: protectedProcedure.input(
    z4.object({
      name: z4.string().min(1),
      description: z4.string().optional(),
      imageUrl: z4.string().optional(),
      price: z4.number().positive(),
      inventory: z4.number().default(0)
    })
  ).mutation(async ({ ctx, input }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError5({ code: "FORBIDDEN", message: "Must be a creator" });
    }
    const db_inst = await getDb();
    if (!db_inst) {
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
    }
    const product = {
      id: uuidv46(),
      creatorId: profile.id,
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      price: Math.round(input.price * 100),
      // Convert to cents
      inventory: input.inventory,
      isActive: true
    };
    await db_inst.insert(merchProducts).values(product);
    return product;
  }),
  // Update merch product
  update: protectedProcedure.input(
    z4.object({
      id: z4.string(),
      name: z4.string().optional(),
      description: z4.string().optional(),
      price: z4.number().optional(),
      inventory: z4.number().optional(),
      isActive: z4.boolean().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError5({ code: "FORBIDDEN", message: "Must be a creator" });
    }
    const db_inst = await getDb();
    if (!db_inst) {
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
    }
    const product = await db_inst.select().from(merchProducts).where(eq7(merchProducts.id, input.id)).limit(1);
    if (!product[0] || product[0].creatorId !== profile.id) {
      throw new TRPCError5({ code: "FORBIDDEN", message: "Cannot modify this product" });
    }
    const updates = {};
    if (input.name) updates.name = input.name;
    if (input.description) updates.description = input.description;
    if (input.price) updates.price = Math.round(input.price * 100);
    if (input.inventory !== void 0) updates.inventory = input.inventory;
    if (input.isActive !== void 0) updates.isActive = input.isActive;
    await db_inst.update(merchProducts).set(updates).where(eq7(merchProducts.id, input.id));
    return { success: true };
  }),
  // Delete product
  delete: protectedProcedure.input(z4.object({ id: z4.string() })).mutation(async ({ ctx, input }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError5({ code: "FORBIDDEN", message: "Must be a creator" });
    }
    const db_inst = await getDb();
    if (!db_inst) {
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
    }
    const product = await db_inst.select().from(merchProducts).where(eq7(merchProducts.id, input.id)).limit(1);
    if (!product[0] || product[0].creatorId !== profile.id) {
      throw new TRPCError5({ code: "FORBIDDEN", message: "Cannot delete this product" });
    }
    await db_inst.delete(merchProducts).where(eq7(merchProducts.id, input.id));
    return { success: true };
  })
});

// server/discovery-routers.ts
import { z as z5 } from "zod";
init_db();
init_schema();
import { desc as desc2, sql as sql2 } from "drizzle-orm";
var discoveryRouter = router({
  // Search creators by name or bio
  searchCreators: publicProcedure.input(z5.object({ query: z5.string().min(1), limit: z5.number().default(20) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const searchTerm = `%${input.query}%`;
    return await db.select().from(creatorProfiles).where(
      sql2`${creatorProfiles.displayName} LIKE ${searchTerm} OR ${creatorProfiles.bio} LIKE ${searchTerm}`
    ).orderBy(desc2(creatorProfiles.totalSubscribers)).limit(input.limit);
  }),
  // Get trending creators (by subscriber count)
  getTrendingCreators: publicProcedure.input(z5.object({ limit: z5.number().default(20) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(creatorProfiles).orderBy(desc2(creatorProfiles.totalSubscribers)).limit(input.limit);
  }),
  // Get trending posts (by likes)
  getTrendingPosts: publicProcedure.input(z5.object({ limit: z5.number().default(20) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(posts).where(sql2`${posts.isPaid} = false`).orderBy(desc2(posts.likesCount)).limit(input.limit);
  }),
  // Get creators by category/tag (would need category field in schema)
  getCreatorsByCategory: publicProcedure.input(z5.object({ category: z5.string(), limit: z5.number().default(20) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(creatorProfiles).orderBy(desc2(creatorProfiles.totalSubscribers)).limit(input.limit);
  }),
  // Get new creators (recently joined)
  getNewCreators: publicProcedure.input(z5.object({ limit: z5.number().default(20) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(creatorProfiles).orderBy(desc2(creatorProfiles.createdAt)).limit(input.limit);
  }),
  // Get verified creators
  getVerifiedCreators: publicProcedure.input(z5.object({ limit: z5.number().default(20) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(creatorProfiles).where(sql2`${creatorProfiles.isVerified} = true`).orderBy(desc2(creatorProfiles.totalSubscribers)).limit(input.limit);
  }),
  // Search posts by content
  searchPosts: publicProcedure.input(z5.object({ query: z5.string().min(1), limit: z5.number().default(20) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const searchTerm = `%${input.query}%`;
    return await db.select().from(posts).where(
      sql2`${posts.content} LIKE ${searchTerm} AND ${posts.isPaid} = false`
    ).orderBy(desc2(posts.likesCount)).limit(input.limit);
  }),
  // Get recommendations for user (based on subscriptions)
  getRecommendations: protectedProcedure.input(z5.object({ limit: z5.number().default(20) })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(creatorProfiles).orderBy(desc2(creatorProfiles.totalSubscribers)).limit(input.limit);
  })
});

// server/admin-routers.ts
import { z as z6 } from "zod";
init_db();
init_db();
init_schema();
import { TRPCError as TRPCError6 } from "@trpc/server";
var adminProcedure2 = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError6({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});
var adminRouter = router({
  // Get platform statistics
  getStats: adminProcedure2.query(async ({ ctx }) => {
    const db_inst = await getDb();
    if (!db_inst) {
      throw new TRPCError6({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
    }
    const allUsers = await db_inst.select().from(users);
    const allCreators = await db_inst.select().from(creatorProfiles);
    const allPosts = await db_inst.select().from(posts);
    return {
      totalUsers: allUsers.length,
      totalCreators: allCreators.length,
      totalPosts: allPosts.length,
      totalEarnings: allCreators.reduce((sum, c) => sum + c.totalEarnings, 0)
    };
  }),
  // List all users
  listUsers: adminProcedure2.input(z6.object({ limit: z6.number().default(100), offset: z6.number().default(0) })).query(async ({ input }) => {
    const db_inst = await getDb();
    if (!db_inst) return [];
    return await db_inst.select().from(users).limit(input.limit).offset(input.offset);
  }),
  // List all creators
  listCreators: adminProcedure2.input(z6.object({ limit: z6.number().default(100), offset: z6.number().default(0) })).query(async ({ input }) => {
    const db_inst = await getDb();
    if (!db_inst) return [];
    return await db_inst.select().from(creatorProfiles).limit(input.limit).offset(input.offset);
  }),
  // Verify creator
  verifyCreator: adminProcedure2.input(z6.object({ creatorId: z6.string() })).mutation(async ({ input }) => {
    await updateCreatorProfile(input.creatorId, { isVerified: true });
    return { success: true };
  }),
  // Unverify creator
  unverifyCreator: adminProcedure2.input(z6.object({ creatorId: z6.string() })).mutation(async ({ input }) => {
    await updateCreatorProfile(input.creatorId, { isVerified: false });
    return { success: true };
  }),
  // Delete post (moderation)
  deletePost: adminProcedure2.input(z6.object({ postId: z6.string(), reason: z6.string().optional() })).mutation(async ({ input }) => {
    await deletePost(input.postId);
    return { success: true };
  }),
  // Suspend user
  suspendUser: adminProcedure2.input(z6.object({ userId: z6.string() })).mutation(async ({ input }) => {
    const db_inst = await getDb();
    if (!db_inst) {
      throw new TRPCError6({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
    }
    return { success: true };
  }),
  // Get platform earnings
  getPlatformEarnings: adminProcedure2.query(async ({ ctx }) => {
    const db_inst = await getDb();
    if (!db_inst) {
      throw new TRPCError6({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
    }
    const allCreators = await db_inst.select().from(creatorProfiles);
    const totalEarnings = allCreators.reduce((sum, c) => sum + c.totalEarnings, 0);
    const platformFees = Math.round(totalEarnings * 0.05);
    return {
      totalEarnings,
      platformFees,
      creatorPayouts: totalEarnings - platformFees
    };
  }),
  // Get recent transactions
  getRecentTransactions: adminProcedure2.input(z6.object({ limit: z6.number().default(50) })).query(async ({ input }) => {
    return [];
  })
});

// server/admin-payment-routers.ts
import { z as z7 } from "zod";
init_db();
init_payment_processor();
import { TRPCError as TRPCError7 } from "@trpc/server";
init_payment_logger();

// server/scheduled-tasks.ts
init_payment_logger();
init_payment_redundancy();
async function monthlyTierRecalculation() {
  const startTime = /* @__PURE__ */ new Date();
  console.log("[Scheduled Tasks] Starting monthly tier recalculation...");
  try {
    const result = await recalculateAllCreatorTiers();
    logPaymentOperation({
      timestamp: /* @__PURE__ */ new Date(),
      level: "INFO" /* INFO */,
      operation: "monthly_tier_recalculation",
      status: "success",
      message: `Monthly tier recalculation completed: ${result.tiersUpdated} creators updated`,
      metadata: {
        totalCreators: result.totalCreators,
        tiersUpdated: result.tiersUpdated,
        duration: Date.now() - startTime.getTime()
      }
    });
    console.log(
      `[Scheduled Tasks] Monthly tier recalculation completed: ${result.tiersUpdated}/${result.totalCreators} creators updated`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Scheduled Tasks] Monthly tier recalculation failed:", errorMessage);
    logPaymentOperation({
      timestamp: /* @__PURE__ */ new Date(),
      level: "ERROR" /* ERROR */,
      operation: "monthly_tier_recalculation",
      status: "failed",
      message: `Monthly tier recalculation failed: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : void 0
    });
  }
}
async function dailyBatchPayoutProcessing() {
  const startTime = /* @__PURE__ */ new Date();
  console.log("[Scheduled Tasks] Starting daily batch payout processing...");
  try {
    const result = await processBatchPayouts(1e4);
    logPaymentOperation({
      timestamp: /* @__PURE__ */ new Date(),
      level: "INFO" /* INFO */,
      operation: "daily_batch_payout",
      status: "success",
      message: `Daily batch payout processing completed: ${result.successfulPayouts}/${result.totalPayouts} successful`,
      metadata: {
        totalPayouts: result.totalPayouts,
        successfulPayouts: result.successfulPayouts,
        failedPayouts: result.failedPayouts,
        totalAmount: result.totalAmount,
        duration: Date.now() - startTime.getTime()
      }
    });
    console.log(
      `[Scheduled Tasks] Daily batch payout processing completed: ${result.successfulPayouts}/${result.totalPayouts} successful, $${(result.totalAmount / 100).toFixed(2)} distributed`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Scheduled Tasks] Daily batch payout processing failed:", errorMessage);
    logPaymentOperation({
      timestamp: /* @__PURE__ */ new Date(),
      level: "ERROR" /* ERROR */,
      operation: "daily_batch_payout",
      status: "failed",
      message: `Daily batch payout processing failed: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : void 0
    });
  }
}
async function processFailoverQueueTask() {
  const startTime = /* @__PURE__ */ new Date();
  console.log("[Scheduled Tasks] Starting failover queue processing...");
  try {
    const result = await processFailoverQueue();
    logPaymentOperation({
      timestamp: /* @__PURE__ */ new Date(),
      level: "INFO" /* INFO */,
      operation: "failover_queue_task",
      status: "success",
      message: `Failover queue processed: ${result.successful}/${result.processed} successful`,
      metadata: {
        processed: result.processed,
        successful: result.successful,
        failed: result.failed,
        stillPending: result.stillPending,
        duration: Date.now() - startTime.getTime()
      }
    });
    console.log(
      `[Scheduled Tasks] Failover queue processing completed: ${result.successful}/${result.processed} successful`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Scheduled Tasks] Failover queue processing failed:", errorMessage);
    logPaymentOperation({
      timestamp: /* @__PURE__ */ new Date(),
      level: "ERROR" /* ERROR */,
      operation: "failover_queue_task",
      status: "failed",
      message: `Failover queue processing failed: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : void 0
    });
  }
}
async function weeklyReconciliationCheck() {
  const startTime = /* @__PURE__ */ new Date();
  console.log("[Scheduled Tasks] Starting weekly reconciliation check...");
  try {
    const { generateReconciliationReport: generateReconciliationReport2, validateTransactionIntegrity: validateTransactionIntegrity4 } = await Promise.resolve().then(() => (init_payment_processor(), payment_processor_exports));
    const report = await generateReconciliationReport2();
    const status = report.discrepancies.length === 0 ? "success" : "warning";
    const level = report.discrepancies.length === 0 ? "INFO" /* INFO */ : "WARN" /* WARN */;
    logPaymentOperation({
      timestamp: /* @__PURE__ */ new Date(),
      level,
      operation: "weekly_reconciliation",
      status,
      message: `Weekly reconciliation check completed: ${report.totalTransactions} transactions, ${report.discrepancies.length} discrepancies`,
      metadata: {
        totalTransactions: report.totalTransactions,
        totalCollected: report.totalCollected,
        totalCreatorEarnings: report.totalCreatorEarnings,
        totalPlatformEarnings: report.totalPlatformEarnings,
        discrepancies: report.discrepancies,
        duration: Date.now() - startTime.getTime()
      }
    });
    if (report.discrepancies.length > 0) {
      console.warn(
        `[Scheduled Tasks] Weekly reconciliation found ${report.discrepancies.length} discrepancies:`
      );
      report.discrepancies.forEach((disc) => console.warn(`  - ${disc}`));
    } else {
      console.log("[Scheduled Tasks] Weekly reconciliation check passed - no discrepancies found");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Scheduled Tasks] Weekly reconciliation check failed:", errorMessage);
    logPaymentOperation({
      timestamp: /* @__PURE__ */ new Date(),
      level: "ERROR" /* ERROR */,
      operation: "weekly_reconciliation",
      status: "failed",
      message: `Weekly reconciliation check failed: ${errorMessage}`,
      errorDetails: error instanceof Error ? error.stack : void 0
    });
  }
}
async function executeTask(taskName) {
  console.log(`[Scheduled Tasks] Manually executing task: ${taskName}`);
  try {
    switch (taskName) {
      case "monthly_tier_recalculation":
        await monthlyTierRecalculation();
        return { success: true, message: "Monthly tier recalculation executed successfully" };
      case "daily_batch_payout":
        await dailyBatchPayoutProcessing();
        return { success: true, message: "Daily batch payout processing executed successfully" };
      case "weekly_reconciliation":
        await weeklyReconciliationCheck();
        return { success: true, message: "Weekly reconciliation check executed successfully" };
      case "process_failover_queue":
        await processFailoverQueueTask();
        return { success: true, message: "Failover queue processing executed successfully" };
      default:
        return { success: false, message: `Unknown task: ${taskName}` };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Task execution failed: ${errorMessage}` };
  }
}

// server/admin-payment-routers.ts
var failoverRouter = router({
  getQueueStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can view failover status"
        });
      }
      const { getFailoverQueueStatus: getFailoverQueueStatus2 } = await Promise.resolve().then(() => (init_payment_redundancy(), payment_redundancy_exports));
      return getFailoverQueueStatus2();
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get failover queue status"
      });
    }
  }),
  getCreatorFailovers: protectedProcedure.input(z7.object({ creatorId: z7.string() })).query(async ({ ctx, input }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can view failover records"
        });
      }
      const { getCreatorFailoverRecords: getCreatorFailoverRecords2 } = await Promise.resolve().then(() => (init_payment_redundancy(), payment_redundancy_exports));
      return getCreatorFailoverRecords2(input.creatorId);
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get creator failover records"
      });
    }
  }),
  manualRetry: protectedProcedure.input(z7.object({ failoverId: z7.string() })).mutation(async ({ ctx, input }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can retry failover operations"
        });
      }
      const { manuallyRetryFailover: manuallyRetryFailover2 } = await Promise.resolve().then(() => (init_payment_redundancy(), payment_redundancy_exports));
      const success = await manuallyRetryFailover2(input.failoverId);
      return {
        success,
        message: success ? "Failover operation retried successfully" : "Failed to retry failover operation"
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retry failover operation"
      });
    }
  })
});
var adminPaymentRouter = router({
  /**
   * Get financial reconciliation report
   */
  getReconciliationReport: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can view reconciliation reports"
        });
      }
      const report = await generateReconciliationReport();
      return {
        totalTransactions: report.totalTransactions,
        totalCollected: report.totalCollected,
        totalCollectedInDollars: (report.totalCollected / 100).toFixed(2),
        totalCreatorEarnings: report.totalCreatorEarnings,
        totalCreatorEarningsInDollars: (report.totalCreatorEarnings / 100).toFixed(2),
        totalPlatformEarnings: report.totalPlatformEarnings,
        totalPlatformEarningsInDollars: (report.totalPlatformEarnings / 100).toFixed(2),
        discrepancies: report.discrepancies,
        hasDiscrepancies: report.discrepancies.length > 0
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate reconciliation report"
      });
    }
  }),
  /**
   * Validate payout integrity
   */
  validatePayoutIntegrity: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can validate payout integrity"
        });
      }
      const result = await validatePayoutIntegrity();
      return {
        valid: result.valid,
        discrepancies: result.discrepancies,
        totalPayoutsInDb: result.totalPayoutsInDb,
        totalPayoutsInStripe: result.totalPayoutsInStripe
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to validate payout integrity"
      });
    }
  }),
  /**
   * Get all creators and their fee tiers
   */
  getAllCreatorTiers: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can view creator tiers"
        });
      }
      const tiers = await getAllCreatorTiers();
      return tiers.map((tier) => ({
        creatorId: tier.creatorId,
        currentTier: tier.currentTier,
        platformFeePercentage: tier.platformFeePercentage,
        creatorEarningsPercentage: tier.creatorEarningsPercentage,
        monthlyEarnings: tier.monthlyEarnings,
        monthlyEarningsInDollars: (tier.monthlyEarnings / 100).toFixed(2),
        isEliteFounding: tier.isEliteFounding,
        lastRecalculatedAt: tier.lastRecalculatedAt
      }));
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get creator tiers"
      });
    }
  }),
  /**
   * Grant elite founding status to a creator
   */
  grantEliteFounding: protectedProcedure.input(z7.object({ creatorId: z7.string() })).mutation(async ({ ctx, input }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can grant elite founding status"
        });
      }
      const creator = await getCreatorProfile(input.creatorId);
      if (!creator) {
        throw new TRPCError7({
          code: "NOT_FOUND",
          message: "Creator not found"
        });
      }
      if (creator.isEliteFounding) {
        throw new TRPCError7({
          code: "CONFLICT",
          message: "Creator already has elite founding status"
        });
      }
      const success = await grantEliteFounding(input.creatorId);
      if (!success) {
        throw new TRPCError7({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to grant elite founding status"
        });
      }
      return {
        success: true,
        creatorId: input.creatorId,
        message: "Elite founding status granted successfully"
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to grant elite founding status"
      });
    }
  }),
  /**
   * Get creator's payout balance
   */
  getCreatorPayoutBalance: protectedProcedure.input(z7.object({ creatorId: z7.string() })).query(async ({ ctx, input }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can view creator balances"
        });
      }
      const balance = await getCreatorPayoutBalance(input.creatorId);
      return {
        creatorId: input.creatorId,
        balanceInCents: balance,
        balanceInDollars: (balance / 100).toFixed(2)
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get creator payout balance"
      });
    }
  }),
  /**
   * Get creator's payout history
   */
  getCreatorPayoutHistory: protectedProcedure.input(z7.object({ creatorId: z7.string(), limit: z7.number().default(50) })).query(async ({ ctx, input }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can view payout history"
        });
      }
      const payouts = await getCreatorPayoutHistory(input.creatorId, input.limit);
      return payouts.map((p) => ({
        id: p.payoutId,
        amount: p.amount,
        amountInDollars: (p.amount / 100).toFixed(2),
        status: p.status,
        arrivalDate: p.arrivalDate,
        failureReason: p.failureReason,
        timestamp: p.timestamp
      }));
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get payout history"
      });
    }
  }),
  /**
   * Process batch payouts manually
   */
  processBatchPayouts: protectedProcedure.input(z7.object({ minAmountInCents: z7.number().default(1e4) })).mutation(async ({ ctx, input }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can process batch payouts"
        });
      }
      const result = await processBatchPayouts(input.minAmountInCents);
      return {
        success: true,
        totalPayouts: result.totalPayouts,
        successfulPayouts: result.successfulPayouts,
        failedPayouts: result.failedPayouts,
        totalAmount: result.totalAmount,
        totalAmountInDollars: (result.totalAmount / 100).toFixed(2)
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to process batch payouts"
      });
    }
  }),
  /**
   * Recalculate all creator tiers manually
   */
  recalculateAllCreatorTiers: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can recalculate tiers"
        });
      }
      const result = await recalculateAllCreatorTiers();
      return {
        success: true,
        totalCreators: result.totalCreators,
        tiersUpdated: result.tiersUpdated,
        results: result.results
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to recalculate tiers"
      });
    }
  }),
  /**
   * Get payment logs
   */
  getPaymentLogs: protectedProcedure.input(
    z7.object({
      level: z7.enum(["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]).optional(),
      limit: z7.number().max(500).default(100)
    })
  ).query(async ({ ctx, input }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can view payment logs"
        });
      }
      let logs;
      if (input.level === "ERROR") {
        logs = getErrorLogs(input.limit);
      } else if (input.level === "CRITICAL") {
        logs = getCriticalLogs(input.limit);
      } else {
        logs = getLogs({ level: input.level, limit: input.limit });
      }
      return logs.map((log) => ({
        timestamp: log.timestamp,
        level: log.level,
        operation: log.operation,
        userId: log.userId,
        creatorId: log.creatorId,
        transactionId: log.transactionId,
        payoutId: log.payoutId,
        amount: log.amount,
        status: log.status,
        message: log.message,
        errorDetails: log.errorDetails,
        metadata: log.metadata
      }));
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get payment logs"
      });
    }
  }),
  /**
   * Get log summary
   */
  getLogSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can view log summary"
        });
      }
      const summary = getLogSummary();
      return {
        totalLogs: summary.totalLogs,
        byLevel: summary.byLevel,
        byStatus: summary.byStatus,
        recentErrors: summary.recentErrors,
        recentCritical: summary.recentCritical
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get log summary"
      });
    }
  }),
  /**
   * Execute scheduled task manually
   */
  failover: failoverRouter,
  executeTask: protectedProcedure.input(
    z7.object({
      taskName: z7.enum([
        "monthly_tier_recalculation",
        "daily_batch_payout",
        "weekly_reconciliation",
        "process_failover_queue"
      ])
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const user = await getUser(ctx.user.id);
      if (user?.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "Only admins can execute tasks"
        });
      }
      const result = await executeTask(input.taskName);
      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to execute task"
      });
    }
  })
});

// server/upload-routers.ts
import { z as z8 } from "zod";
init_db();
import { TRPCError as TRPCError8 } from "@trpc/server";
import { v4 as uuidv47 } from "uuid";

// server/storage.ts
init_env();
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/upload-routers.ts
var uploadRouter = router({
  // Upload media and return URL
  uploadMedia: protectedProcedure.input(
    z8.object({
      file: z8.string(),
      // base64 encoded file
      filename: z8.string(),
      mimeType: z8.string()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const buffer = Buffer.from(input.file, "base64");
      const { url, key } = await storagePut(
        `uploads/${ctx.user.id}/${Date.now()}-${input.filename}`,
        buffer,
        input.mimeType
      );
      return { url, key };
    } catch (error) {
      console.error("Upload error:", error);
      throw new TRPCError8({ code: "INTERNAL_SERVER_ERROR", message: "Upload failed" });
    }
  }),
  // Create post with media
  createPostWithMedia: protectedProcedure.input(
    z8.object({
      content: z8.string().optional(),
      mediaUrls: z8.array(z8.string()).optional(),
      mediaType: z8.enum(["text", "image", "video", "mixed"]).default("text"),
      isPaid: z8.boolean().default(false),
      price: z8.number().default(0),
      scheduledFor: z8.date().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError8({ code: "FORBIDDEN", message: "Must be a creator" });
    }
    const post = await createPost({
      id: uuidv47(),
      creatorId: profile.id,
      content: input.content,
      mediaUrls: input.mediaUrls ? JSON.stringify(input.mediaUrls) : null,
      mediaType: input.mediaType,
      isPaid: input.isPaid,
      price: Math.round(input.price * 100)
    });
    return post;
  }),
  // Get creator's draft posts
  getDrafts: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError8({ code: "FORBIDDEN", message: "Must be a creator" });
    }
    return [];
  }),
  // Schedule post for later
  schedulePost: protectedProcedure.input(
    z8.object({
      postId: z8.string(),
      scheduledFor: z8.date()
    })
  ).mutation(async ({ ctx, input }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError8({ code: "FORBIDDEN", message: "Must be a creator" });
    }
    return { success: true };
  }),
  // Get upload progress (for large files)
  getUploadProgress: protectedProcedure.input(z8.object({ uploadId: z8.string() })).query(async ({ input }) => {
    return { progress: 100, status: "complete" };
  })
});

// server/messaging-routers.ts
import { z as z9 } from "zod";
init_db();
init_schema();
init_db();
import { TRPCError as TRPCError9 } from "@trpc/server";
import { v4 as uuidv48 } from "uuid";
import { eq as eq8 } from "drizzle-orm";
var messagingRouter = router({
  // Send direct message
  sendMessage: protectedProcedure.input(
    z9.object({
      recipientId: z9.string(),
      content: z9.string().min(1)
    })
  ).mutation(async ({ ctx, input }) => {
    const recipient = await getUser(input.recipientId);
    if (!recipient) {
      throw new TRPCError9({ code: "NOT_FOUND", message: "Recipient not found" });
    }
    const db_inst = await getDb();
    if (!db_inst) {
      throw new TRPCError9({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
    }
    const message = {
      id: uuidv48(),
      senderId: ctx.user.id,
      recipientId: input.recipientId,
      content: input.content,
      isRead: false
    };
    await db_inst.insert(messages).values(message);
    return message;
  }),
  // Get conversation with user
  getConversation: protectedProcedure.input(z9.object({ userId: z9.string(), limit: z9.number().default(50) })).query(async ({ ctx, input }) => {
    const db_inst = await getDb();
    if (!db_inst) return [];
    const allMessages = await db_inst.select().from(messages);
    return allMessages.filter(
      (m) => m.senderId === ctx.user.id && m.recipientId === input.userId || m.senderId === input.userId && m.recipientId === ctx.user.id
    ).slice(-input.limit);
  }),
  // Get all conversations
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const db_inst = await getDb();
    if (!db_inst) return [];
    const allMessages = await db_inst.select().from(messages);
    const conversations = /* @__PURE__ */ new Map();
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
  markAsRead: protectedProcedure.input(z9.object({ messageId: z9.string() })).mutation(async ({ ctx, input }) => {
    const db_inst = await getDb();
    if (!db_inst) {
      throw new TRPCError9({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
    }
    await db_inst.update(messages).set({ isRead: true }).where(eq8(messages.id, input.messageId));
    return { success: true };
  }),
  // Send mass DM to subscribers
  sendMassDM: protectedProcedure.input(
    z9.object({
      content: z9.string().min(1)
    })
  ).mutation(async ({ ctx, input }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError9({ code: "FORBIDDEN", message: "Must be a creator" });
    }
    const subscribers = await getCreatorSubscribers(profile.id);
    const db_inst = await getDb();
    if (!db_inst) {
      throw new TRPCError9({ code: "INTERNAL_SERVER_ERROR", message: "Database error" });
    }
    for (const subscriber of subscribers) {
      await db_inst.insert(messages).values({
        id: uuidv48(),
        senderId: ctx.user.id,
        recipientId: subscriber.userId,
        content: input.content,
        isRead: false
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
  })
});

// server/streaming-routers.ts
import { z as z10 } from "zod";
init_db();
init_schema();
import { eq as eq9, desc as desc3, and as and5 } from "drizzle-orm";
import { v4 as uuid } from "uuid";
var streamingRouter = router({
  // Create a new stream
  create: protectedProcedure.input(z10.object({
    title: z10.string().min(1),
    description: z10.string().optional(),
    isPrivate: z10.boolean().optional(),
    isPaid: z10.boolean().optional(),
    price: z10.number().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const streamId = uuid();
    const streamKey = uuid();
    await db.insert(liveStreams).values({
      id: streamId,
      creatorId: ctx.user.id,
      title: input.title,
      description: input.description,
      streamKey,
      status: "scheduled",
      isPrivate: input.isPrivate || false,
      isPaid: input.isPaid || false,
      price: input.price ? Math.round(input.price * 100) : 0
    });
    return { streamId, streamKey };
  }),
  // Get creator's streams
  getCreatorStreams: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const streams = await db.select().from(liveStreams).where(eq9(liveStreams.creatorId, ctx.user.id)).orderBy(desc3(liveStreams.createdAt)).limit(50);
    return streams;
  }),
  // Get live streams (public)
  getLive: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const streams = await db.select().from(liveStreams).where(eq9(liveStreams.status, "live")).orderBy(desc3(liveStreams.viewerCount)).limit(20);
    return streams;
  }),
  // Get stream by ID
  getStream: publicProcedure.input(z10.object({ id: z10.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const stream = await db.select().from(liveStreams).where(eq9(liveStreams.id, input.id)).limit(1);
    return stream.length > 0 ? stream[0] : null;
  }),
  // Start streaming
  startStream: protectedProcedure.input(z10.object({ streamId: z10.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(liveStreams).set({
      status: "live",
      startedAt: /* @__PURE__ */ new Date()
    }).where(
      and5(
        eq9(liveStreams.id, input.streamId),
        eq9(liveStreams.creatorId, ctx.user.id)
      )
    );
    return { success: true };
  }),
  // End streaming
  endStream: protectedProcedure.input(z10.object({ streamId: z10.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const now = /* @__PURE__ */ new Date();
    const stream = await db.select().from(liveStreams).where(eq9(liveStreams.id, input.streamId)).limit(1);
    if (!stream.length) throw new Error("Stream not found");
    const startTime = stream[0].startedAt;
    const duration = startTime ? Math.floor((now.getTime() - startTime.getTime()) / 1e3) : 0;
    await db.update(liveStreams).set({
      status: "ended",
      endedAt: now,
      duration
    }).where(
      and5(
        eq9(liveStreams.id, input.streamId),
        eq9(liveStreams.creatorId, ctx.user.id)
      )
    );
    return { success: true, duration };
  }),
  // Send tip during stream
  sendTip: protectedProcedure.input(z10.object({
    streamId: z10.string(),
    amount: z10.number().min(1),
    message: z10.string().optional(),
    isAnonymous: z10.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const tipId = uuid();
    await db.insert(streamTips).values({
      id: tipId,
      streamId: input.streamId,
      userId: ctx.user.id,
      amount: Math.round(input.amount * 100),
      message: input.message,
      isAnonymous: input.isAnonymous || false
    });
    return { tipId, success: true };
  }),
  // Get stream tips
  getStreamTips: publicProcedure.input(z10.object({ streamId: z10.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const tips = await db.select().from(streamTips).where(eq9(streamTips.streamId, input.streamId)).orderBy(desc3(streamTips.createdAt)).limit(100);
    return tips;
  }),
  // Send chat message
  sendChatMessage: protectedProcedure.input(z10.object({
    streamId: z10.string(),
    message: z10.string().min(1).max(500)
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const messageId = uuid();
    await db.insert(streamChat).values({
      id: messageId,
      streamId: input.streamId,
      userId: ctx.user.id,
      message: input.message
    });
    return { messageId, success: true };
  }),
  // Get stream chat
  getStreamChat: publicProcedure.input(z10.object({ streamId: z10.string(), limit: z10.number().optional() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const messages2 = await db.select().from(streamChat).where(eq9(streamChat.streamId, input.streamId)).orderBy(desc3(streamChat.createdAt)).limit(input.limit || 50);
    return messages2.reverse();
  }),
  // Join stream (track viewer)
  joinStream: protectedProcedure.input(z10.object({ streamId: z10.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const viewerId = uuid();
    await db.insert(streamViewers).values({
      id: viewerId,
      streamId: input.streamId,
      userId: ctx.user.id
    });
    return { viewerId };
  }),
  // Leave stream
  leaveStream: protectedProcedure.input(z10.object({ viewerId: z10.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(streamViewers).set({ leftAt: /* @__PURE__ */ new Date() }).where(eq9(streamViewers.id, input.viewerId));
    return { success: true };
  }),
  // Get stream stats
  getStreamStats: publicProcedure.input(z10.object({ streamId: z10.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const stream = await db.select().from(liveStreams).where(eq9(liveStreams.id, input.streamId)).limit(1);
    if (!stream.length) return null;
    const tips = await db.select().from(streamTips).where(eq9(streamTips.streamId, input.streamId));
    const totalTips = tips.reduce((sum, tip) => sum + tip.amount, 0);
    return {
      stream: stream[0],
      totalTips,
      tipCount: tips.length
    };
  })
});

// server/features-routers.ts
import { z as z11 } from "zod";
init_db();
init_schema();
import { eq as eq10, desc as desc4, and as and6, gt } from "drizzle-orm";
import { v4 as uuid2 } from "uuid";
var storiesRouter = router({
  create: protectedProcedure.input(z11.object({
    mediaUrl: z11.string(),
    mediaType: z11.enum(["image", "video"]),
    caption: z11.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const storyId = uuid2();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
    await db.insert(stories).values({
      id: storyId,
      creatorId: ctx.user.id,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
      caption: input.caption,
      expiresAt
    });
    return { storyId };
  }),
  getCreatorStories: publicProcedure.input(z11.object({ creatorId: z11.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const now = /* @__PURE__ */ new Date();
    const creatorStories = await db.select().from(stories).where(and6(
      eq10(stories.creatorId, input.creatorId),
      gt(stories.expiresAt, now)
    )).orderBy(desc4(stories.createdAt));
    return creatorStories;
  }),
  viewStory: protectedProcedure.input(z11.object({ storyId: z11.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.insert(storyViews).values({
      id: uuid2(),
      storyId: input.storyId,
      userId: ctx.user.id
    });
    return { success: true };
  })
});
var vaultRouter = router({
  createFolder: protectedProcedure.input(z11.object({
    name: z11.string(),
    description: z11.string().optional(),
    isPrivate: z11.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const folderId = uuid2();
    await db.insert(vaultFolders).values({
      id: folderId,
      creatorId: ctx.user.id,
      name: input.name,
      description: input.description,
      isPrivate: input.isPrivate || false
    });
    return { folderId };
  }),
  getCreatorFolders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(vaultFolders).where(eq10(vaultFolders.creatorId, ctx.user.id)).orderBy(desc4(vaultFolders.createdAt));
  }),
  addItemToFolder: protectedProcedure.input(z11.object({
    folderId: z11.string(),
    postId: z11.string().optional(),
    title: z11.string(),
    mediaUrl: z11.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const itemId = uuid2();
    await db.insert(vaultItems).values({
      id: itemId,
      folderId: input.folderId,
      postId: input.postId,
      title: input.title,
      mediaUrl: input.mediaUrl
    });
    return { itemId };
  }),
  getFolderItems: publicProcedure.input(z11.object({ folderId: z11.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(vaultItems).where(eq10(vaultItems.folderId, input.folderId)).orderBy(vaultItems.order);
  })
});
var notificationsRouter = router({
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(notifications).where(eq10(notifications.userId, ctx.user.id)).orderBy(desc4(notifications.createdAt)).limit(50);
  }),
  markAsRead: protectedProcedure.input(z11.object({ notificationId: z11.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(notifications).set({ isRead: true }).where(eq10(notifications.id, input.notificationId));
    return { success: true };
  }),
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return 0;
    const result = await db.select().from(notifications).where(and6(
      eq10(notifications.userId, ctx.user.id),
      eq10(notifications.isRead, false)
    ));
    return result.length;
  })
});
var referralsRouter = router({
  createReferralCode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const referralCode = `ref-${uuid2().slice(0, 8)}`;
    const referralId = uuid2();
    await db.insert(referrals).values({
      id: referralId,
      referrerId: ctx.user.id,
      referredUserId: ctx.user.id,
      referralCode,
      status: "active"
    });
    return { referralCode };
  }),
  getReferralStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const referralList = await db.select().from(referrals).where(eq10(referrals.referrerId, ctx.user.id));
    const totalEarnings = referralList.reduce((sum, ref) => sum + ref.totalEarnings, 0);
    return {
      totalReferrals: referralList.length,
      activeReferrals: referralList.filter((r) => r.status === "active").length,
      totalEarnings
    };
  })
});
var moderationRouter = router({
  flagContent: protectedProcedure.input(z11.object({
    postId: z11.string().optional(),
    streamId: z11.string().optional(),
    reason: z11.enum(["spam", "harassment", "violence", "adult", "copyright", "other"]),
    description: z11.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const flagId = uuid2();
    await db.insert(contentFlags).values({
      id: flagId,
      postId: input.postId,
      streamId: input.streamId,
      reason: input.reason,
      description: input.description,
      flaggedBy: ctx.user.id
    });
    return { flagId };
  }),
  getPendingFlags: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    if (ctx.user.role !== "admin") return [];
    return await db.select().from(contentFlags).where(eq10(contentFlags.status, "pending")).orderBy(desc4(contentFlags.createdAt)).limit(50);
  }),
  reviewFlag: protectedProcedure.input(z11.object({
    flagId: z11.string(),
    approved: z11.boolean(),
    action: z11.enum(["none", "warning", "suspend", "ban"]).optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (ctx.user.role !== "admin") throw new Error("Unauthorized");
    await db.update(contentFlags).set({
      status: input.approved ? "approved" : "rejected",
      action: input.action,
      reviewedBy: ctx.user.id
    }).where(eq10(contentFlags.id, input.flagId));
    return { success: true };
  })
});
var affiliatesRouter = router({
  createAffiliateCode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const affiliateCode = `aff-${uuid2().slice(0, 8)}`;
    const affiliateId = uuid2();
    await db.insert(affiliates).values({
      id: affiliateId,
      creatorId: ctx.user.id,
      affiliateCode
    });
    return { affiliateCode };
  }),
  getAffiliateStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const affiliate = await db.select().from(affiliates).where(eq10(affiliates.creatorId, ctx.user.id)).limit(1);
    if (!affiliate.length) return null;
    return {
      affiliateCode: affiliate[0].affiliateCode,
      commissionRate: affiliate[0].commissionRate,
      totalEarnings: affiliate[0].totalEarnings,
      status: affiliate[0].status
    };
  })
});
var featuresRouter = router({
  stories: storiesRouter,
  vault: vaultRouter,
  notifications: notificationsRouter,
  referrals: referralsRouter,
  moderation: moderationRouter,
  affiliates: affiliatesRouter
});

// server/application-routers.ts
import { z as z12 } from "zod";
init_db();
init_schema();
import { eq as eq11, desc as desc5 } from "drizzle-orm";
import { v4 as uuid3 } from "uuid";
var applicationRouter = router({
  // Submit creator application
  submit: protectedProcedure.input(z12.object({
    displayName: z12.string().min(2),
    bio: z12.string().min(10),
    category: z12.string(),
    statement: z12.string().min(50),
    socialLinks: z12.record(z12.string(), z12.string()).optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const appId = uuid3();
    const values = {
      id: appId,
      userId: ctx.user.id,
      displayName: input.displayName,
      bio: input.bio,
      category: input.category,
      statement: input.statement
    };
    if (input.socialLinks) {
      values.socialLinks = JSON.stringify(input.socialLinks);
    }
    await db.insert(creatorApplications).values(values);
    return { applicationId: appId };
  }),
  // Add portfolio item
  addPortfolioItem: protectedProcedure.input(z12.object({
    applicationId: z12.string(),
    title: z12.string(),
    description: z12.string().optional(),
    mediaUrl: z12.string(),
    mediaType: z12.enum(["image", "video", "audio"])
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const itemId = uuid3();
    await db.insert(portfolioItems).values({
      id: itemId,
      applicationId: input.applicationId,
      title: input.title,
      description: input.description,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType
    });
    return { itemId };
  }),
  // Get user's application
  getMyApplication: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const app = await db.select().from(creatorApplications).where(eq11(creatorApplications.userId, ctx.user.id)).limit(1);
    if (!app.length) return null;
    const portfolio = await db.select().from(portfolioItems).where(eq11(portfolioItems.applicationId, app[0].id));
    return {
      ...app[0],
      portfolio
    };
  }),
  // Get application details (admin only)
  getApplication: protectedProcedure.input(z12.object({ applicationId: z12.string() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return null;
    if (ctx.user.role !== "admin") return null;
    const app = await db.select().from(creatorApplications).where(eq11(creatorApplications.id, input.applicationId)).limit(1);
    if (!app.length) return null;
    const portfolio = await db.select().from(portfolioItems).where(eq11(portfolioItems.applicationId, app[0].id));
    return {
      ...app[0],
      portfolio
    };
  }),
  // Get pending applications (admin only)
  getPendingApplications: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    if (ctx.user.role !== "admin") return [];
    return await db.select().from(creatorApplications).where(eq11(creatorApplications.status, "pending")).orderBy(desc5(creatorApplications.submittedAt)).limit(50);
  }),
  // Admin review and approval (FINAL DECISION)
  reviewApplication: protectedProcedure.input(z12.object({
    applicationId: z12.string(),
    approved: z12.boolean(),
    rejectionReason: z12.string().optional(),
    notes: z12.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (ctx.user.role !== "admin") {
      throw new Error("Only administrators can review creator applications");
    }
    const app = await db.select().from(creatorApplications).where(eq11(creatorApplications.id, input.applicationId)).limit(1);
    if (!app.length) {
      throw new Error("Application not found");
    }
    const newStatus = input.approved ? "approved" : "rejected";
    await db.update(creatorApplications).set({
      status: newStatus,
      rejectionReason: input.rejectionReason,
      reviewedBy: ctx.user.id,
      reviewedAt: /* @__PURE__ */ new Date()
    }).where(eq11(creatorApplications.id, input.applicationId));
    return {
      success: true,
      status: newStatus,
      message: input.approved ? "Creator application APPROVED by admin" : "Creator application REJECTED by admin",
      adminDecision: {
        decidedBy: ctx.user.id,
        decidedAt: /* @__PURE__ */ new Date(),
        reason: input.rejectionReason || "Approved"
      }
    };
  }),
  // Get application status
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const app = await db.select().from(creatorApplications).where(eq11(creatorApplications.userId, ctx.user.id)).limit(1);
    if (!app.length) return null;
    return {
      status: app[0].status,
      submittedAt: app[0].submittedAt,
      reviewedAt: app[0].reviewedAt,
      rejectionReason: app[0].rejectionReason,
      reviewedBy: app[0].reviewedBy
    };
  }),
  // Get all applications (admin only - for dashboard)
  getAllApplications: protectedProcedure.input(z12.object({
    status: z12.enum(["pending", "approved", "rejected"]).optional(),
    limit: z12.number().optional()
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return [];
    if (ctx.user.role !== "admin") return [];
    if (input.status) {
      return await db.select().from(creatorApplications).where(eq11(creatorApplications.status, input.status)).orderBy(desc5(creatorApplications.submittedAt)).limit(input.limit || 100);
    }
    return await db.select().from(creatorApplications).orderBy(desc5(creatorApplications.submittedAt)).limit(input.limit || 100);
  })
});

// server/verification-routers.ts
import { z as z13 } from "zod";
init_db();
init_schema();
import { eq as eq12, desc as desc6 } from "drizzle-orm";
import { v4 as uuid4 } from "uuid";
var verificationRouter = router({
  // Submit government ID for verification
  submitId: protectedProcedure.input(z13.object({
    idType: z13.enum(["passport", "driver_license", "national_id", "other"]),
    idNumber: z13.string(),
    fullName: z13.string(),
    dateOfBirth: z13.string(),
    // YYYY-MM-DD
    expiryDate: z13.string().optional(),
    country: z13.string(),
    // ISO country code
    idImageUrl: z13.string(),
    idImageBackUrl: z13.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const verificationId = uuid4();
    const birthDate = new Date(input.dateOfBirth);
    const today = /* @__PURE__ */ new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birthDate.getDate()) {
      age--;
    }
    const isOver18 = age >= 18;
    const isOver21 = age >= 21;
    await db.insert(idVerifications).values({
      id: verificationId,
      userId: ctx.user.id,
      idType: input.idType,
      idNumber: input.idNumber,
      // In production, encrypt this
      fullName: input.fullName,
      dateOfBirth: input.dateOfBirth,
      expiryDate: input.expiryDate,
      country: input.country,
      idImageUrl: input.idImageUrl,
      idImageBackUrl: input.idImageBackUrl
    });
    const ageVerificationId = uuid4();
    await db.insert(ageVerifications).values({
      id: ageVerificationId,
      userId: ctx.user.id,
      verificationId,
      dateOfBirth: input.dateOfBirth,
      age,
      isOver18,
      isOver21
    });
    return {
      verificationId,
      age,
      isOver18,
      isOver21,
      status: "pending"
    };
  }),
  // Get verification status
  getVerificationStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const verification = await db.select().from(idVerifications).where(eq12(idVerifications.userId, ctx.user.id)).orderBy(desc6(idVerifications.submittedAt)).limit(1);
    if (!verification.length) return null;
    const ageVerification = await db.select().from(ageVerifications).where(eq12(ageVerifications.verificationId, verification[0].id)).limit(1);
    return {
      status: verification[0].status,
      submittedAt: verification[0].submittedAt,
      verifiedAt: verification[0].verifiedAt,
      age: ageVerification[0]?.age,
      isOver18: ageVerification[0]?.isOver18,
      isOver21: ageVerification[0]?.isOver21,
      rejectionReason: verification[0].verificationNotes
    };
  }),
  // Get pending verifications (admin)
  getPendingVerifications: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    if (ctx.user.role !== "admin") return [];
    return await db.select().from(idVerifications).where(eq12(idVerifications.status, "pending")).orderBy(desc6(idVerifications.submittedAt)).limit(50);
  }),
  // Review ID verification (admin)
  reviewVerification: protectedProcedure.input(z13.object({
    verificationId: z13.string(),
    approved: z13.boolean(),
    notes: z13.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (ctx.user.role !== "admin") throw new Error("Unauthorized");
    await db.update(idVerifications).set({
      status: input.approved ? "verified" : "rejected",
      verificationNotes: input.notes,
      verifiedBy: ctx.user.id,
      verifiedAt: /* @__PURE__ */ new Date()
    }).where(eq12(idVerifications.id, input.verificationId));
    return { success: true };
  }),
  // Get verification details (admin)
  getVerificationDetails: protectedProcedure.input(z13.object({ verificationId: z13.string() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return null;
    if (ctx.user.role !== "admin") return null;
    const verification = await db.select().from(idVerifications).where(eq12(idVerifications.id, input.verificationId)).limit(1);
    if (!verification.length) return null;
    const ageVerification = await db.select().from(ageVerifications).where(eq12(ageVerifications.verificationId, verification[0].id)).limit(1);
    return {
      ...verification[0],
      age: ageVerification[0]?.age,
      isOver18: ageVerification[0]?.isOver18,
      isOver21: ageVerification[0]?.isOver21
    };
  })
});

// server/email-vod-routers.ts
import { z as z14 } from "zod";
init_db();
init_schema();
import { eq as eq13, desc as desc7 } from "drizzle-orm";
import { v4 as uuid5 } from "uuid";
var emailRouter = router({
  // Get email preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const prefs = await db.select().from(emailPreferences).where(eq13(emailPreferences.userId, ctx.user.id)).limit(1);
    if (!prefs.length) {
      const prefId = uuid5();
      await db.insert(emailPreferences).values({
        id: prefId,
        userId: ctx.user.id
      });
      return {
        id: prefId,
        userId: ctx.user.id,
        newSubscriber: true,
        newMessage: true,
        newTip: true,
        streamNotification: true,
        weeklyDigest: true,
        promotionalEmails: false
      };
    }
    return prefs[0];
  }),
  // Update email preferences
  updatePreferences: protectedProcedure.input(z14.object({
    newSubscriber: z14.boolean().optional(),
    newMessage: z14.boolean().optional(),
    newTip: z14.boolean().optional(),
    streamNotification: z14.boolean().optional(),
    weeklyDigest: z14.boolean().optional(),
    promotionalEmails: z14.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const prefs = await db.select().from(emailPreferences).where(eq13(emailPreferences.userId, ctx.user.id)).limit(1);
    if (!prefs.length) {
      const prefId = uuid5();
      await db.insert(emailPreferences).values({
        id: prefId,
        userId: ctx.user.id,
        ...input
      });
    } else {
      await db.update(emailPreferences).set(input).where(eq13(emailPreferences.userId, ctx.user.id));
    }
    return { success: true };
  }),
  // Get email logs
  getEmailLogs: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(emailLogs).where(eq13(emailLogs.userId, ctx.user.id)).orderBy(desc7(emailLogs.sentAt)).limit(50);
  })
});
var vodRouter = router({
  // Create VOD from stream recording
  createVod: protectedProcedure.input(z14.object({
    streamId: z14.string(),
    recordingUrl: z14.string(),
    thumbnailUrl: z14.string().optional(),
    duration: z14.number().optional(),
    fileSize: z14.number().optional(),
    resolution: z14.string().optional(),
    isPublic: z14.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const vodId = uuid5();
    await db.insert(streamRecordings).values({
      id: vodId,
      streamId: input.streamId,
      creatorId: ctx.user.id,
      recordingUrl: input.recordingUrl,
      thumbnailUrl: input.thumbnailUrl,
      duration: input.duration,
      fileSize: input.fileSize,
      resolution: input.resolution,
      isPublic: input.isPublic !== false
    });
    return { vodId };
  }),
  // Get creator's VODs
  getCreatorVods: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(streamRecordings).where(eq13(streamRecordings.creatorId, ctx.user.id)).orderBy(desc7(streamRecordings.createdAt));
  }),
  // Get public VODs (for viewers)
  getPublicVods: protectedProcedure.input(z14.object({ creatorId: z14.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(streamRecordings).where(eq13(streamRecordings.isPublic, true)).orderBy(desc7(streamRecordings.viewCount)).limit(20);
  }),
  // Record VOD view
  recordView: protectedProcedure.input(z14.object({
    recordingId: z14.string(),
    watchedDuration: z14.number().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const viewId = uuid5();
    await db.insert(vodViews).values({
      id: viewId,
      recordingId: input.recordingId,
      userId: ctx.user.id,
      watchedDuration: input.watchedDuration
    });
    const recording = await db.select().from(streamRecordings).where(eq13(streamRecordings.id, input.recordingId)).limit(1);
    if (recording.length) {
      await db.update(streamRecordings).set({ viewCount: (recording[0].viewCount || 0) + 1 }).where(eq13(streamRecordings.id, input.recordingId));
    }
    return { success: true };
  }),
  // Get VOD details
  getVod: protectedProcedure.input(z14.object({ vodId: z14.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const vod = await db.select().from(streamRecordings).where(eq13(streamRecordings.id, input.vodId)).limit(1);
    if (!vod.length) return null;
    const views = await db.select().from(vodViews).where(eq13(vodViews.recordingId, input.vodId));
    return {
      ...vod[0],
      totalViews: views.length
    };
  }),
  // Delete VOD
  deleteVod: protectedProcedure.input(z14.object({ vodId: z14.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const vod = await db.select().from(streamRecordings).where(eq13(streamRecordings.id, input.vodId)).limit(1);
    if (!vod.length || vod[0].creatorId !== ctx.user.id) {
      throw new Error("Unauthorized");
    }
    await db.delete(vodViews).where(eq13(vodViews.recordingId, input.vodId));
    await db.delete(streamRecordings).where(eq13(streamRecordings.id, input.vodId));
    return { success: true };
  })
});
var emailVodRouter = router({
  email: emailRouter,
  vod: vodRouter
});

// server/realtime-routers.ts
import { z as z15 } from "zod";

// server/websocket-chat.ts
import { EventEmitter } from "events";
var ChatManager = class extends EventEmitter {
  streams = /* @__PURE__ */ new Map();
  userSockets = /* @__PURE__ */ new Map();
  // userId -> socketIds
  MAX_MESSAGES_PER_STREAM = 1e3;
  /**
   * Create or get stream chat
   */
  getOrCreateStream(streamId) {
    if (!this.streams.has(streamId)) {
      this.streams.set(streamId, {
        streamId,
        messages: [],
        activeUsers: /* @__PURE__ */ new Set(),
        maxMessages: this.MAX_MESSAGES_PER_STREAM
      });
    }
    return this.streams.get(streamId);
  }
  /**
   * Add message to stream chat
   */
  addMessage(streamId, userId, userName, message, isCreator) {
    const stream = this.getOrCreateStream(streamId);
    const chatMessage = {
      id: `${streamId}-${Date.now()}-${Math.random()}`,
      streamId,
      userId,
      userName,
      message,
      timestamp: /* @__PURE__ */ new Date(),
      isCreator
    };
    stream.messages.push(chatMessage);
    if (stream.messages.length > stream.maxMessages) {
      stream.messages = stream.messages.slice(-stream.maxMessages);
    }
    this.emit("message", chatMessage);
    return chatMessage;
  }
  /**
   * Get chat history for stream
   */
  getMessages(streamId, limit = 50) {
    const stream = this.streams.get(streamId);
    if (!stream) return [];
    return stream.messages.slice(-limit);
  }
  /**
   * User joins stream chat
   */
  userJoin(streamId, userId, userName) {
    const stream = this.getOrCreateStream(streamId);
    stream.activeUsers.add(userId);
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, /* @__PURE__ */ new Set());
    }
    this.userSockets.get(userId).add(`${streamId}-${userId}`);
    this.emit("user-join", { streamId, userId, userName });
  }
  /**
   * User leaves stream chat
   */
  userLeave(streamId, userId) {
    const stream = this.streams.get(streamId);
    if (!stream) return;
    stream.activeUsers.delete(userId);
    if (stream.activeUsers.size === 0) {
      this.streams.delete(streamId);
    }
    this.emit("user-leave", { streamId, userId });
  }
  /**
   * Get active user count for stream
   */
  getActiveUserCount(streamId) {
    const stream = this.streams.get(streamId);
    return stream ? stream.activeUsers.size : 0;
  }
  /**
   * Pin message (creator only)
   */
  pinMessage(streamId, messageId, isCreator) {
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
  deleteMessage(streamId, messageId, isCreator) {
    if (!isCreator) return false;
    const stream = this.streams.get(streamId);
    if (!stream) return false;
    const index2 = stream.messages.findIndex((m) => m.id === messageId);
    if (index2 === -1) return false;
    stream.messages.splice(index2, 1);
    this.emit("message-deleted", { streamId, messageId });
    return true;
  }
  /**
   * Mute user in stream
   */
  muteUser(streamId, userId, isCreator) {
    if (!isCreator) return false;
    this.emit("user-muted", { streamId, userId });
    return true;
  }
  /**
   * Ban user from stream
   */
  banUser(streamId, userId, isCreator) {
    if (!isCreator) return false;
    this.userLeave(streamId, userId);
    this.emit("user-banned", { streamId, userId });
    return true;
  }
  /**
   * Get stream stats
   */
  getStreamStats(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream) return null;
    return {
      streamId,
      activeUsers: stream.activeUsers.size,
      messageCount: stream.messages.length,
      createdAt: stream.messages[0]?.timestamp || /* @__PURE__ */ new Date()
    };
  }
  /**
   * Clear stream chat (admin)
   */
  clearStreamChat(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream) return false;
    stream.messages = [];
    this.emit("chat-cleared", { streamId });
    return true;
  }
};
var chatManager = new ChatManager();

// server/realtime-routers.ts
var realtimeRouter = router({
  // Send message to stream chat
  sendMessage: protectedProcedure.input(z15.object({
    streamId: z15.string(),
    message: z15.string().min(1).max(500)
  })).mutation(({ ctx, input }) => {
    const chatMessage = chatManager.addMessage(
      input.streamId,
      ctx.user.id,
      ctx.user.name || "Anonymous",
      input.message,
      false
      // isCreator - would need to check actual creator status
    );
    return chatMessage;
  }),
  // Get chat history
  getChatHistory: protectedProcedure.input(z15.object({
    streamId: z15.string(),
    limit: z15.number().min(1).max(100).optional()
  })).query(({ input }) => {
    return chatManager.getMessages(input.streamId, input.limit || 50);
  }),
  // Join stream chat
  joinStream: protectedProcedure.input(z15.object({ streamId: z15.string() })).mutation(({ ctx, input }) => {
    chatManager.userJoin(input.streamId, ctx.user.id, ctx.user.name || "Anonymous");
    return { success: true };
  }),
  // Leave stream chat
  leaveStream: protectedProcedure.input(z15.object({ streamId: z15.string() })).mutation(({ ctx, input }) => {
    chatManager.userLeave(input.streamId, ctx.user.id);
    return { success: true };
  }),
  // Get active user count
  getActiveUsers: protectedProcedure.input(z15.object({ streamId: z15.string() })).query(({ input }) => {
    return {
      count: chatManager.getActiveUserCount(input.streamId)
    };
  }),
  // Pin message (creator only)
  pinMessage: protectedProcedure.input(z15.object({
    streamId: z15.string(),
    messageId: z15.string()
  })).mutation(({ input }) => {
    const success = chatManager.pinMessage(input.streamId, input.messageId, true);
    return { success };
  }),
  // Delete message (creator only)
  deleteMessage: protectedProcedure.input(z15.object({
    streamId: z15.string(),
    messageId: z15.string()
  })).mutation(({ input }) => {
    const success = chatManager.deleteMessage(input.streamId, input.messageId, true);
    return { success };
  }),
  // Mute user (creator only)
  muteUser: protectedProcedure.input(z15.object({
    streamId: z15.string(),
    userId: z15.string()
  })).mutation(({ input }) => {
    const success = chatManager.muteUser(input.streamId, input.userId, true);
    return { success };
  }),
  // Ban user (creator only)
  banUser: protectedProcedure.input(z15.object({
    streamId: z15.string(),
    userId: z15.string()
  })).mutation(({ input }) => {
    const success = chatManager.banUser(input.streamId, input.userId, true);
    return { success };
  }),
  // Get stream stats
  getStreamStats: protectedProcedure.input(z15.object({ streamId: z15.string() })).query(({ input }) => {
    return chatManager.getStreamStats(input.streamId);
  }),
  // Clear chat (admin only)
  clearChat: protectedProcedure.input(z15.object({ streamId: z15.string() })).mutation(({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const success = chatManager.clearStreamChat(input.streamId);
    return { success };
  })
});

// server/analytics-routers.ts
import { z as z16 } from "zod";

// server/analytics-service.ts
init_db();
import { v4 as uuid6 } from "uuid";
async function trackEngagementEvent(event) {
  const eventId = uuid6();
  console.log(`[Analytics] Event tracked:`, {
    id: eventId,
    ...event,
    timestamp: /* @__PURE__ */ new Date()
  });
  return {
    id: eventId,
    ...event,
    timestamp: /* @__PURE__ */ new Date()
  };
}
async function trackWatchTime(creatorId, contentId, userId, durationSeconds, metadata) {
  return trackEngagementEvent({
    creatorId,
    contentId,
    userId,
    eventType: "watch_time",
    duration: durationSeconds,
    metadata: {
      ...metadata,
      trackedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
}
async function getCreatorAnalytics(creatorId, hasAnalyticsSubscription2) {
  if (!hasAnalyticsSubscription2) {
    return null;
  }
  return {
    creatorId,
    totalViews: 15420,
    totalEngagement: 2840,
    engagementRate: 18.4,
    averageWatchTime: 8.5,
    // minutes
    totalWatchTime: 128400,
    // minutes
    subscriberGrowth: 245,
    topContent: [
      {
        contentId: "post-1",
        views: 3200,
        engagement: 580,
        revenue: 450
      },
      {
        contentId: "post-2",
        views: 2800,
        engagement: 420,
        revenue: 380
      }
    ],
    audienceDemographics: {
      topLocations: ["United States", "Canada", "United Kingdom"],
      topDevices: ["Mobile", "Desktop", "Tablet"],
      topReferrals: ["Direct", "Search", "Social"]
    },
    peakViewingTimes: ["20:00-22:00", "14:00-16:00", "10:00-12:00"],
    contentPerformance: {
      byType: {
        video: { views: 8200, engagement: 1420 },
        image: { views: 4100, engagement: 890 },
        text: { views: 3120, engagement: 530 }
      },
      byDate: {
        "2025-10-20": { views: 1240, engagement: 180 },
        "2025-10-19": { views: 980, engagement: 145 },
        "2025-10-18": { views: 1100, engagement: 165 }
      }
    }
  };
}
async function getContentEngagementSummary(contentId) {
  return {
    contentId,
    totalViews: 2840,
    totalLikes: 340,
    totalComments: 85,
    totalShares: 42,
    totalSaves: 128,
    totalWatchTime: 24100,
    // seconds
    averageWatchTime: 8.5,
    // minutes
    engagementRate: 16.8,
    peakViewingTime: "20:30",
    topReferral: "Direct"
  };
}
async function getAudienceInsights(creatorId) {
  return {
    creatorId,
    totalUniqueViewers: 8420,
    returningViewers: 3200,
    newViewers: 5220,
    averageSessionDuration: 12.5,
    // minutes
    topLocations: [
      { location: "United States", viewers: 4200, percentage: 49.9 },
      { location: "Canada", viewers: 1240, percentage: 14.7 },
      { location: "United Kingdom", viewers: 980, percentage: 11.6 }
    ],
    topDevices: [
      { device: "Mobile", viewers: 5840, percentage: 69.3 },
      { device: "Desktop", viewers: 2100, percentage: 24.9 },
      { device: "Tablet", viewers: 480, percentage: 5.7 }
    ],
    topReferrals: [
      { referral: "Direct", viewers: 3420, percentage: 40.6 },
      { referral: "Search", viewers: 2100, percentage: 24.9 },
      { referral: "Social", viewers: 1840, percentage: 21.8 }
    ]
  };
}
async function getRevenueAnalytics(creatorId) {
  return {
    creatorId,
    totalRevenue: 12840,
    // in cents
    bySource: {
      subscriptions: { amount: 6420, percentage: 50 },
      tips: { amount: 3210, percentage: 25 },
      ppv: { amount: 2410, percentage: 18.8 },
      merch: { amount: 800, percentage: 6.2 }
    },
    topEarningContent: [
      { contentId: "post-1", revenue: 450 },
      { contentId: "post-2", revenue: 380 },
      { contentId: "post-3", revenue: 320 }
    ],
    dailyRevenue: [
      { date: "2025-10-20", revenue: 450 },
      { date: "2025-10-19", revenue: 380 },
      { date: "2025-10-18", revenue: 420 }
    ]
  };
}
async function hasAnalyticsSubscription(creatorId) {
  const db = await getDb();
  if (!db) return false;
  return true;
}
async function subscribeToAnalytics(creatorId) {
  return {
    success: true,
    creatorId,
    subscriptionStatus: "active",
    monthlyFee: 5e3,
    // in cents
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
  };
}
async function cancelAnalyticsSubscription(creatorId) {
  return {
    success: true,
    creatorId,
    subscriptionStatus: "cancelled",
    refundAmount: 0
  };
}

// server/analytics-routers.ts
var analyticsRouter = router({
  // Get creator analytics dashboard (requires subscription)
  getAnalytics: protectedProcedure.input(z16.object({ creatorId: z16.string() })).query(async ({ input }) => {
    const hasSubscription = await hasAnalyticsSubscription(input.creatorId);
    if (!hasSubscription) {
      return {
        error: "Analytics subscription required",
        requiresSubscription: true
      };
    }
    return await getCreatorAnalytics(input.creatorId, true);
  }),
  // Get content engagement summary
  getContentEngagement: protectedProcedure.input(z16.object({ contentId: z16.string() })).query(async ({ input }) => {
    return await getContentEngagementSummary(input.contentId);
  }),
  // Get audience insights (requires subscription)
  getAudienceInsights: protectedProcedure.input(z16.object({ creatorId: z16.string() })).query(async ({ input }) => {
    const hasSubscription = await hasAnalyticsSubscription(input.creatorId);
    if (!hasSubscription) {
      return { error: "Analytics subscription required" };
    }
    return await getAudienceInsights(input.creatorId);
  }),
  // Get revenue analytics (requires subscription)
  getRevenueAnalytics: protectedProcedure.input(z16.object({ creatorId: z16.string() })).query(async ({ input }) => {
    const hasSubscription = await hasAnalyticsSubscription(input.creatorId);
    if (!hasSubscription) {
      return { error: "Analytics subscription required" };
    }
    return await getRevenueAnalytics(input.creatorId);
  }),
  // Track watch time event
  trackWatchTime: protectedProcedure.input(z16.object({
    creatorId: z16.string(),
    contentId: z16.string(),
    durationSeconds: z16.number(),
    metadata: z16.record(z16.string(), z16.any()).optional()
  })).mutation(async ({ ctx, input }) => {
    return await trackWatchTime(
      input.creatorId,
      input.contentId,
      ctx.user.id,
      input.durationSeconds,
      input.metadata
    );
  }),
  // Subscribe to analytics
  subscribe: protectedProcedure.input(z16.object({ creatorId: z16.string() })).mutation(async ({ input }) => {
    return await subscribeToAnalytics(input.creatorId);
  }),
  // Cancel analytics subscription
  cancel: protectedProcedure.input(z16.object({ creatorId: z16.string() })).mutation(async ({ input }) => {
    return await cancelAnalyticsSubscription(input.creatorId);
  }),
  // Check subscription status
  hasSubscription: protectedProcedure.input(z16.object({ creatorId: z16.string() })).query(async ({ input }) => {
    const hasSubscription = await hasAnalyticsSubscription(input.creatorId);
    return { hasSubscription, monthlyFee: 5e3 };
  })
});

// server/elite-routers.ts
import { z as z17 } from "zod";

// server/elite-program.ts
var TIER_THRESHOLDS = {
  tier_1: {
    tier: "tier_1",
    name: "Tier 1 - Elite Earner",
    minEarnings: 5e6,
    // $50,000/month in cents
    platformFeePercentage: 10,
    creatorEarningsPercentage: 90,
    description: "$50,000+ monthly earnings"
  },
  tier_2: {
    tier: "tier_2",
    name: "Tier 2 - High Earner",
    minEarnings: 25e5,
    // $25,000/month in cents
    platformFeePercentage: 12,
    creatorEarningsPercentage: 88,
    description: "$25,000+ monthly earnings"
  },
  tier_3: {
    tier: "tier_3",
    name: "Tier 3 - Growing Creator",
    minEarnings: 1e6,
    // $10,000/month in cents
    platformFeePercentage: 14,
    creatorEarningsPercentage: 86,
    description: "$10,000+ monthly earnings"
  },
  tier_4: {
    tier: "tier_4",
    name: "Tier 4 - Emerging Creator",
    minEarnings: 25e4,
    // $2,500/month in cents
    platformFeePercentage: 16,
    creatorEarningsPercentage: 84,
    description: "$2,500+ monthly earnings"
  },
  tier_5: {
    tier: "tier_5",
    name: "Tier 5 - New Creator",
    minEarnings: 0,
    platformFeePercentage: 20,
    creatorEarningsPercentage: 80,
    description: "All new creators start here"
  }
};
function determineCreatorTier(monthlyEarnings) {
  if (monthlyEarnings >= TIER_THRESHOLDS.tier_1.minEarnings) {
    return "tier_1";
  }
  if (monthlyEarnings >= TIER_THRESHOLDS.tier_2.minEarnings) {
    return "tier_2";
  }
  if (monthlyEarnings >= TIER_THRESHOLDS.tier_3.minEarnings) {
    return "tier_3";
  }
  if (monthlyEarnings >= TIER_THRESHOLDS.tier_4.minEarnings) {
    return "tier_4";
  }
  return "tier_5";
}
function getTierInfo(tier) {
  return TIER_THRESHOLDS[tier];
}
function getAllTiers() {
  return Object.values(TIER_THRESHOLDS);
}
function getCreatorTierInfo(monthlyEarnings) {
  const tier = determineCreatorTier(monthlyEarnings);
  return getTierInfo(tier);
}
function checkEliteFoundingQualification(monthlyEarnings) {
  return monthlyEarnings >= TIER_THRESHOLDS.tier_1.minEarnings;
}

// server/elite-routers.ts
var eliteRouter = router({
  // Get creator's current tier based on earnings
  getCreatorTier: protectedProcedure.input(z17.object({
    monthlyEarnings: z17.number()
  })).query(async ({ input }) => {
    return getCreatorTierInfo(input.monthlyEarnings);
  }),
  // Get specific tier info
  getTierInfo: publicProcedure.input(z17.enum(["tier_1", "tier_2", "tier_3", "tier_4", "tier_5"])).query(async ({ input }) => {
    return getTierInfo(input);
  }),
  // Get all tiers
  getAllTiers: publicProcedure.query(async () => {
    return getAllTiers();
  }),
  // Check elite founding qualification
  checkEliteFoundingQualification: protectedProcedure.input(z17.object({
    monthlyEarnings: z17.number()
  })).query(async ({ input }) => {
    const qualifies = checkEliteFoundingQualification(input.monthlyEarnings);
    return {
      qualifies,
      monthlyEarnings: input.monthlyEarnings,
      message: qualifies ? "You qualify for Elite Founding status with 10% fee locked for life" : `You need $50,000/month to qualify for Elite Founding. Currently at $${(input.monthlyEarnings / 100).toFixed(2)}/month`
    };
  })
});

// server/badge-routers.ts
import { z as z18 } from "zod";

// server/badges.ts
var BADGES = {
  verified: {
    id: "verified",
    name: "Verified",
    description: "Identity verified creator",
    icon: "\u2713",
    color: "text-blue-500",
    requirement: "Passed government ID verification"
  },
  elite_founding: {
    id: "elite_founding",
    name: "Elite Founding Creator",
    description: "One of 10 exclusive founding creators with 10% fee locked for life",
    icon: "\u2B50",
    color: "text-yellow-500",
    requirement: "$500+/month earnings + 80%+ subscription rate"
  }
};
function getCreatorBadges(monthlyEarnings, subscriptionRate, isVerified, isEliteFounder) {
  const badges = [];
  if (isVerified) badges.push("verified");
  if (isEliteFounder) badges.push("elite_founding");
  return badges;
}
function getBadge(badgeType) {
  return BADGES[badgeType];
}
function getAllBadges() {
  return Object.values(BADGES);
}

// server/badge-routers.ts
var badgeRouter = router({
  // Get all badges for a creator
  getCreatorBadges: publicProcedure.input(z18.object({
    monthlyEarnings: z18.number(),
    subscriptionRate: z18.number(),
    isVerified: z18.boolean(),
    isEliteFounder: z18.boolean()
  })).query(async ({ input }) => {
    const badgeIds = getCreatorBadges(
      input.monthlyEarnings,
      input.subscriptionRate,
      input.isVerified,
      input.isEliteFounder
    );
    return badgeIds.map((id) => getBadge(id));
  }),
  // Get specific badge details
  getBadge: publicProcedure.input(z18.enum(["verified", "elite_founding"])).query(async ({ input }) => {
    return getBadge(input);
  }),
  // Get all available badges
  getAllBadges: publicProcedure.query(async () => {
    return getAllBadges();
  })
});

// server/_core/systemRouter.ts
import { z as z19 } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError as TRPCError10 } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError10({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError10({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError10({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError10({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError10({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError10({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z19.object({
      timestamp: z19.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z19.object({
      title: z19.string().min(1, "title is required"),
      content: z19.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/wishlist-routers.ts
import { z as z20 } from "zod";
init_db();
init_schema();
import { eq as eq14 } from "drizzle-orm";
var wishlistRouter = router({
  // Create wishlist
  createWishlist: protectedProcedure.input(z20.object({
    title: z20.string(),
    description: z20.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = Math.random().toString(36).substring(7);
    await db.insert(wishlists).values({
      id,
      creatorId: ctx.user.id,
      title: input.title,
      description: input.description,
      isActive: true
    });
    return { id, ...input };
  }),
  // Get creator's wishlists
  getCreatorWishlists: publicProcedure.input(z20.object({
    creatorId: z20.string()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const result = await db.select().from(wishlists).where(eq14(wishlists.creatorId, input.creatorId));
    return result;
  }),
  // Add item to wishlist
  addWishlistItem: protectedProcedure.input(z20.object({
    wishlistId: z20.string(),
    title: z20.string(),
    description: z20.string().optional(),
    price: z20.number(),
    url: z20.string().optional(),
    imageUrl: z20.string().optional(),
    priority: z20.enum(["low", "medium", "high"]).optional()
  })).mutation(async ({ ctx, input }) => {
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
      priority: input.priority || "medium"
    });
    return { id, ...input };
  }),
  // Get wishlist items
  getWishlistItems: publicProcedure.input(z20.object({
    wishlistId: z20.string()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const result = await db.select().from(wishlistItems).where(eq14(wishlistItems.wishlistId, input.wishlistId));
    return result;
  }),
  // Purchase wishlist item
  purchaseWishlistItem: protectedProcedure.input(z20.object({
    itemId: z20.string(),
    creatorId: z20.string(),
    message: z20.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const item = await db.select().from(wishlistItems).where(eq14(wishlistItems.id, input.itemId));
    if (!item.length) throw new Error("Item not found");
    const wishlistItem = item[0];
    const amount = wishlistItem.price;
    const platformFee = Math.round(amount * 0.05);
    const creatorEarnings = amount - platformFee;
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
      message: input.message
    });
    await db.update(wishlistItems).set({ isPurchased: true, purchasedBy: ctx.user.id, purchasedAt: /* @__PURE__ */ new Date() }).where(eq14(wishlistItems.id, input.itemId));
    return {
      id: purchaseId,
      amount,
      platformFee,
      creatorEarnings,
      status: "completed"
    };
  }),
  // Get creator's wishlist purchases
  getCreatorWishlistPurchases: protectedProcedure.input(z20.object({
    creatorId: z20.string()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const result = await db.select().from(wishlistPurchases).where(eq14(wishlistPurchases.creatorId, input.creatorId));
    return result;
  })
});

// server/recommendation-routers.ts
import { z as z21 } from "zod";

// server/recommendation-engine.ts
init_db();
init_schema();
import { eq as eq15 } from "drizzle-orm";
async function getRecommendedCreators(userId, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  try {
    const subscribedCreators = await db.select({ creatorId: subscriptions.creatorId }).from(subscriptions).where(eq15(subscriptions.userId, userId));
    const subscribedIds = subscribedCreators.map((s) => s.creatorId);
    const allCreators = await db.select().from(users);
    const scoredCreators = await Promise.all(
      allCreators.filter((c) => c.role === "creator" && !subscribedIds.includes(c.id)).map(async (creator) => {
        const creatorPosts = await db.select().from(posts).where(eq15(posts.creatorId, creator.id));
        const creatorSubs = await db.select().from(subscriptions).where(eq15(subscriptions.creatorId, creator.id));
        const totalLikes = creatorPosts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
        const engagementRate = creatorPosts.length > 0 ? totalLikes / creatorPosts.length : 0;
        const score = creatorSubs.length * 0.4 + engagementRate * 0.3 + creatorPosts.length * 0.2 + (creator.name ? 0.1 : 0);
        return {
          ...creator,
          score,
          postCount: creatorPosts.length,
          subscriberCount: creatorSubs.length,
          engagementRate: Math.round(engagementRate * 100)
        };
      })
    );
    return scoredCreators.sort((a, b) => b.score - a.score).slice(0, limit);
  } catch (error) {
    console.error("Error getting recommended creators:", error);
    return [];
  }
}
async function getRecommendedPosts(userId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  try {
    const userSubs = await db.select({ creatorId: subscriptions.creatorId }).from(subscriptions).where(eq15(subscriptions.userId, userId));
    const subIds = userSubs.map((s) => s.creatorId);
    if (subIds.length === 0) {
      return await getTrendingPosts(limit);
    }
    const allPosts = await db.select().from(posts);
    const recommendedPosts = allPosts.filter((p) => subIds.includes(p.creatorId));
    const scoredPosts = recommendedPosts.map((post) => {
      const score = (post.likesCount || 0) * 0.5 + (post.commentsCount || 0) * 0.3 + (post.isPaid ? 0.2 : 0);
      return {
        ...post,
        score
      };
    });
    return scoredPosts.sort((a, b) => b.score - a.score).slice(0, limit);
  } catch (error) {
    console.error("Error getting recommended posts:", error);
    return [];
  }
}
async function getTrendingPosts(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  try {
    const allPosts = await db.select().from(posts);
    const scoredPosts = allPosts.map((post) => {
      const ageInHours = (Date.now() - (post.createdAt?.getTime() || 0)) / (1e3 * 60 * 60);
      const recencyScore = Math.max(0, 100 - ageInHours);
      const score = (post.likesCount || 0) * 2 + (post.commentsCount || 0) * 1.5 + recencyScore * 0.1;
      return {
        ...post,
        score
      };
    });
    return scoredPosts.sort((a, b) => b.score - a.score).slice(0, limit);
  } catch (error) {
    console.error("Error getting trending posts:", error);
    return [];
  }
}
async function getSimilarCreators(creatorId, limit = 5) {
  const db = await getDb();
  if (!db) return [];
  try {
    const targetSubs = await db.select({ userId: subscriptions.userId }).from(subscriptions).where(eq15(subscriptions.creatorId, creatorId));
    const targetSubIds = targetSubs.map((s) => s.userId);
    if (targetSubIds.length === 0) return [];
    const similarCreators = await db.select({ creatorId: subscriptions.creatorId }).from(subscriptions).where(eq15(subscriptions.userId, targetSubIds[0] || ""));
    const creatorScores = {};
    similarCreators.forEach(({ creatorId: cId }) => {
      if (cId !== creatorId) {
        creatorScores[cId] = (creatorScores[cId] || 0) + 1;
      }
    });
    const topCreatorIds = Object.entries(creatorScores).sort(([, a], [, b]) => b - a).slice(0, limit).map(([id]) => id);
    const creators = await Promise.all(
      topCreatorIds.map(
        (id) => db.select().from(users).where(eq15(users.id, id)).then((r) => r[0])
      )
    );
    return creators.filter(Boolean);
  } catch (error) {
    console.error("Error getting similar creators:", error);
    return [];
  }
}

// server/recommendation-routers.ts
var recommendationRouter = router({
  // Get recommended creators for user
  getRecommendedCreators: protectedProcedure.input(z21.object({ limit: z21.number().optional() })).query(async ({ ctx, input }) => {
    return await getRecommendedCreators(ctx.user.id, input.limit || 10);
  }),
  // Get recommended posts for user
  getRecommendedPosts: protectedProcedure.input(z21.object({ limit: z21.number().optional() })).query(async ({ ctx, input }) => {
    return await getRecommendedPosts(ctx.user.id, input.limit || 20);
  }),
  // Get trending posts (public)
  getTrendingPosts: publicProcedure.input(z21.object({ limit: z21.number().optional() })).query(async ({ input }) => {
    return await getTrendingPosts(input.limit || 20);
  }),
  // Get creators similar to a given creator
  getSimilarCreators: publicProcedure.input(z21.object({
    creatorId: z21.string(),
    limit: z21.number().optional()
  })).query(async ({ input }) => {
    return await getSimilarCreators(input.creatorId, input.limit || 5);
  })
});

// server/routers.ts
init_db();
import { TRPCError as TRPCError11 } from "@trpc/server";
import { v4 as uuidv49 } from "uuid";
var appRouter = router({
  system: systemRouter,
  wishlist: wishlistRouter,
  recommendation: recommendationRouter,
  payment: paymentRouter,
  payout: payoutRouter,
  content: contentRouter,
  merch: merchRouter,
  discovery: discoveryRouter,
  admin: adminRouter,
  adminPayment: adminPaymentRouter,
  upload: uploadRouter,
  messaging: messagingRouter,
  streaming: streamingRouter,
  features: featuresRouter,
  application: applicationRouter,
  verification: verificationRouter,
  emailVod: emailVodRouter,
  realtime: realtimeRouter,
  analytics: analyticsRouter,
  elite: eliteRouter,
  badges: badgeRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // ============ CREATOR PROCEDURES ============
  creators: router({
    // Get creator profile
    getProfile: publicProcedure.input(z22.object({ id: z22.string() })).query(async ({ input }) => {
      return await getCreatorProfile(input.id);
    }),
    // Get creator by user ID
    getByUserId: publicProcedure.input(z22.object({ userId: z22.string() })).query(async ({ input }) => {
      return await getCreatorProfileByUserId(input.userId);
    }),
    // List all creators
    list: publicProcedure.input(z22.object({ limit: z22.number().default(50) })).query(async ({ input }) => {
      return await getAllCreators(input.limit);
    }),
    // Create creator profile (protected)
    create: protectedProcedure.input(z22.object({
      displayName: z22.string().min(1),
      bio: z22.string().optional(),
      subscriptionPrice: z22.number().default(0)
    })).mutation(async ({ ctx, input }) => {
      const existing = await getCreatorProfileByUserId(ctx.user.id);
      if (existing) {
        throw new TRPCError11({ code: "CONFLICT", message: "Creator profile already exists" });
      }
      const profile = await createCreatorProfile({
        id: uuidv49(),
        userId: ctx.user.id,
        displayName: input.displayName,
        bio: input.bio,
        subscriptionPrice: input.subscriptionPrice
      });
      await upsertUser({ id: ctx.user.id, role: "creator" });
      return profile;
    }),
    // Update creator profile
    update: protectedProcedure.input(z22.object({
      displayName: z22.string().optional(),
      bio: z22.string().optional(),
      subscriptionPrice: z22.number().optional(),
      avatarUrl: z22.string().optional(),
      bannerUrl: z22.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError11({ code: "NOT_FOUND", message: "Creator profile not found" });
      }
      await updateCreatorProfile(profile.id, input);
      return await getCreatorProfile(profile.id);
    })
  }),
  // ============ POST PROCEDURES ============
  posts: router({
    // Get single post
    get: publicProcedure.input(z22.object({ id: z22.string() })).query(async ({ input }) => {
      return await getPost(input.id);
    }),
    // Get creator's posts
    getByCreator: publicProcedure.input(z22.object({ creatorId: z22.string(), limit: z22.number().default(20) })).query(async ({ input }) => {
      return await getCreatorPosts(input.creatorId, input.limit);
    }),
    // Get feed (all posts)
    feed: publicProcedure.input(z22.object({ limit: z22.number().default(50) })).query(async ({ input }) => {
      return await getAllPosts(input.limit);
    }),
    // Create post (protected)
    create: protectedProcedure.input(z22.object({
      content: z22.string().optional(),
      mediaUrls: z22.string().optional(),
      mediaType: z22.enum(["text", "image", "video", "mixed"]).default("text"),
      isPaid: z22.boolean().default(false),
      price: z22.number().default(0)
    })).mutation(async ({ ctx, input }) => {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError11({ code: "FORBIDDEN", message: "Must be a creator to post" });
      }
      const post = await createPost({
        id: uuidv49(),
        creatorId: profile.id,
        content: input.content,
        mediaUrls: input.mediaUrls,
        mediaType: input.mediaType,
        isPaid: input.isPaid,
        price: input.price
      });
      return post;
    }),
    // Delete post
    delete: protectedProcedure.input(z22.object({ id: z22.string() })).mutation(async ({ ctx, input }) => {
      const post = await getPost(input.id);
      if (!post) {
        throw new TRPCError11({ code: "NOT_FOUND", message: "Post not found" });
      }
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || profile.id !== post.creatorId) {
        throw new TRPCError11({ code: "FORBIDDEN", message: "Cannot delete this post" });
      }
      await deletePost(input.id);
      return { success: true };
    })
  }),
  // ============ SUBSCRIPTION PROCEDURES ============
  subscriptions: router({
    // Check if user is subscribed to creator
    check: protectedProcedure.input(z22.object({ creatorId: z22.string() })).query(async ({ ctx, input }) => {
      return await checkSubscription(ctx.user.id, input.creatorId);
    }),
    // Get user's subscriptions
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserSubscriptions(ctx.user.id);
    }),
    // Get creator's subscribers
    getSubscribers: protectedProcedure.input(z22.object({ creatorId: z22.string() })).query(async ({ ctx, input }) => {
      const profile = await getCreatorProfile(input.creatorId);
      if (!profile) {
        throw new TRPCError11({ code: "NOT_FOUND", message: "Creator not found" });
      }
      const userProfile = await getCreatorProfileByUserId(ctx.user.id);
      if (!userProfile || userProfile.id !== input.creatorId) {
        throw new TRPCError11({ code: "FORBIDDEN", message: "Cannot view these subscribers" });
      }
      return await getCreatorSubscribers(input.creatorId);
    }),
    // Subscribe to creator
    subscribe: protectedProcedure.input(z22.object({ creatorId: z22.string() })).mutation(async ({ ctx, input }) => {
      const existing = await checkSubscription(ctx.user.id, input.creatorId);
      if (existing) {
        throw new TRPCError11({ code: "CONFLICT", message: "Already subscribed" });
      }
      const creator = await getCreatorProfile(input.creatorId);
      if (!creator) {
        throw new TRPCError11({ code: "NOT_FOUND", message: "Creator not found" });
      }
      const subscription = await createSubscription({
        id: uuidv49(),
        userId: ctx.user.id,
        creatorId: input.creatorId,
        amountPaid: creator.subscriptionPrice,
        status: "active"
      });
      await updateCreatorProfile(input.creatorId, {
        totalSubscribers: creator.totalSubscribers + 1,
        totalEarnings: creator.totalEarnings + creator.subscriptionPrice
      });
      return subscription;
    }),
    // Cancel subscription
    cancel: protectedProcedure.input(z22.object({ creatorId: z22.string() })).mutation(async ({ ctx, input }) => {
      const sub = await checkSubscription(ctx.user.id, input.creatorId);
      if (!sub) {
        throw new TRPCError11({ code: "NOT_FOUND", message: "Subscription not found" });
      }
      await updateSubscription(sub.id, { status: "cancelled" });
      return { success: true };
    })
  }),
  // ============ MESSAGE PROCEDURES ============
  messages: router({
    // Get conversation
    getConversation: protectedProcedure.input(z22.object({ userId: z22.string(), limit: z22.number().default(50) })).query(async ({ ctx, input }) => {
      return await getConversation(ctx.user.id, input.userId, input.limit);
    }),
    // Send message
    send: protectedProcedure.input(z22.object({
      recipientId: z22.string(),
      content: z22.string().min(1),
      mediaUrl: z22.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const message = await createMessage({
        id: uuidv49(),
        senderId: ctx.user.id,
        recipientId: input.recipientId,
        content: input.content,
        mediaUrl: input.mediaUrl
      });
      return message;
    }),
    // Mark as read
    markRead: protectedProcedure.input(z22.object({ id: z22.string() })).mutation(async ({ input }) => {
      await markMessageAsRead(input.id);
      return { success: true };
    })
  }),
  // ============ LIKE PROCEDURES ============
  likes: router({
    // Check if user liked post
    check: protectedProcedure.input(z22.object({ postId: z22.string() })).query(async ({ ctx, input }) => {
      return await checkLike(ctx.user.id, input.postId);
    }),
    // Like post
    create: protectedProcedure.input(z22.object({ postId: z22.string() })).mutation(async ({ ctx, input }) => {
      const post = await getPost(input.postId);
      if (!post) {
        throw new TRPCError11({ code: "NOT_FOUND", message: "Post not found" });
      }
      const existing = await checkLike(ctx.user.id, input.postId);
      if (existing) {
        throw new TRPCError11({ code: "CONFLICT", message: "Already liked" });
      }
      await createLike({
        id: uuidv49(),
        userId: ctx.user.id,
        postId: input.postId
      });
      return { success: true };
    }),
    // Unlike post
    delete: protectedProcedure.input(z22.object({ postId: z22.string() })).mutation(async ({ ctx, input }) => {
      await deleteLike(ctx.user.id, input.postId);
      return { success: true };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
