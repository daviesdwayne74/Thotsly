CREATE TABLE `creator_profiles` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`bio` text,
	`avatarUrl` text,
	`bannerUrl` text,
	`subscriptionPrice` int NOT NULL DEFAULT 0,
	`isVerified` boolean NOT NULL DEFAULT false,
	`totalSubscribers` int NOT NULL DEFAULT 0,
	`totalEarnings` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `creator_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`postId` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(64) NOT NULL,
	`senderId` varchar(64) NOT NULL,
	`recipientId` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`mediaUrl` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` varchar(64) NOT NULL,
	`creatorId` varchar(64) NOT NULL,
	`content` text,
	`mediaUrls` text,
	`mediaType` enum('text','image','video','mixed') NOT NULL DEFAULT 'text',
	`isPaid` boolean NOT NULL DEFAULT false,
	`price` int NOT NULL DEFAULT 0,
	`likesCount` int NOT NULL DEFAULT 0,
	`commentsCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`creatorId` varchar(64) NOT NULL,
	`status` enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
	`startDate` timestamp DEFAULT (now()),
	`endDate` timestamp,
	`renewalDate` timestamp,
	`amountPaid` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`creatorId` varchar(64),
	`type` enum('subscription','ppv','tip','payout') NOT NULL,
	`amount` int NOT NULL,
	`platformFee` int NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`description` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','creator') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `creator_profiles` ADD CONSTRAINT `creator_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_users_id_fk` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_recipientId_users_id_fk` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_creatorId_creator_profiles_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `creator_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_creatorId_creator_profiles_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `creator_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_creatorId_creator_profiles_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `creator_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `creator_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `likes` (`userId`);--> statement-breakpoint
CREATE INDEX `postId_idx` ON `likes` (`postId`);--> statement-breakpoint
CREATE INDEX `senderId_idx` ON `messages` (`senderId`);--> statement-breakpoint
CREATE INDEX `recipientId_idx` ON `messages` (`recipientId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `messages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `creatorId_idx` ON `posts` (`creatorId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `posts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `creatorId_idx` ON `subscriptions` (`creatorId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `transactions` (`userId`);--> statement-breakpoint
CREATE INDEX `creatorId_idx` ON `transactions` (`creatorId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `transactions` (`type`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `transactions` (`status`);