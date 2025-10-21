CREATE TABLE `affiliates` (
	`id` varchar(64) NOT NULL,
	`creatorId` varchar(64) NOT NULL,
	`affiliateCode` varchar(64) NOT NULL,
	`commissionRate` int NOT NULL DEFAULT 20,
	`totalEarnings` int NOT NULL DEFAULT 0,
	`status` enum('active','suspended','terminated') NOT NULL DEFAULT 'active',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_affiliateCode_unique` UNIQUE(`affiliateCode`)
);
--> statement-breakpoint
CREATE TABLE `content_flags` (
	`id` varchar(64) NOT NULL,
	`postId` varchar(64),
	`streamId` varchar(64),
	`reason` enum('spam','harassment','violence','adult','copyright','other') NOT NULL,
	`description` text,
	`flaggedBy` varchar(64) NOT NULL,
	`status` enum('pending','reviewed','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` varchar(64),
	`action` enum('none','warning','suspend','ban'),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `content_flags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`type` enum('subscription','message','tip','like','comment','stream') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`relatedUserId` varchar(64),
	`relatedId` varchar(64),
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` varchar(64) NOT NULL,
	`referrerId` varchar(64) NOT NULL,
	`referredUserId` varchar(64) NOT NULL,
	`referralCode` varchar(64) NOT NULL,
	`status` enum('pending','active','expired') NOT NULL DEFAULT 'pending',
	`commissionRate` int NOT NULL DEFAULT 10,
	`totalEarnings` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` varchar(64) NOT NULL,
	`creatorId` varchar(64) NOT NULL,
	`mediaUrl` text NOT NULL,
	`mediaType` enum('image','video') NOT NULL,
	`caption` text,
	`viewCount` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `story_views` (
	`id` varchar(64) NOT NULL,
	`storyId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`viewedAt` timestamp DEFAULT (now()),
	CONSTRAINT `story_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vault_folders` (
	`id` varchar(64) NOT NULL,
	`creatorId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isPrivate` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `vault_folders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vault_items` (
	`id` varchar(64) NOT NULL,
	`folderId` varchar(64) NOT NULL,
	`postId` varchar(64),
	`title` varchar(255) NOT NULL,
	`description` text,
	`mediaUrl` text,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `vault_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `affiliates` ADD CONSTRAINT `affiliates_creatorId_creator_profiles_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `creator_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_flags` ADD CONSTRAINT `content_flags_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_flags` ADD CONSTRAINT `content_flags_streamId_live_streams_id_fk` FOREIGN KEY (`streamId`) REFERENCES `live_streams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_flags` ADD CONSTRAINT `content_flags_flaggedBy_users_id_fk` FOREIGN KEY (`flaggedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_flags` ADD CONSTRAINT `content_flags_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_relatedUserId_users_id_fk` FOREIGN KEY (`relatedUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrerId_creator_profiles_id_fk` FOREIGN KEY (`referrerId`) REFERENCES `creator_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referredUserId_users_id_fk` FOREIGN KEY (`referredUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stories` ADD CONSTRAINT `stories_creatorId_creator_profiles_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `creator_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `story_views` ADD CONSTRAINT `story_views_storyId_stories_id_fk` FOREIGN KEY (`storyId`) REFERENCES `stories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `story_views` ADD CONSTRAINT `story_views_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vault_folders` ADD CONSTRAINT `vault_folders_creatorId_creator_profiles_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `creator_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vault_items` ADD CONSTRAINT `vault_items_folderId_vault_folders_id_fk` FOREIGN KEY (`folderId`) REFERENCES `vault_folders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vault_items` ADD CONSTRAINT `vault_items_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `creatorId_idx` ON `affiliates` (`creatorId`);--> statement-breakpoint
CREATE INDEX `affiliateCode_idx` ON `affiliates` (`affiliateCode`);--> statement-breakpoint
CREATE INDEX `postId_idx` ON `content_flags` (`postId`);--> statement-breakpoint
CREATE INDEX `streamId_idx` ON `content_flags` (`streamId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `content_flags` (`status`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `isRead_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `referrerId_idx` ON `referrals` (`referrerId`);--> statement-breakpoint
CREATE INDEX `referredUserId_idx` ON `referrals` (`referredUserId`);--> statement-breakpoint
CREATE INDEX `referralCode_idx` ON `referrals` (`referralCode`);--> statement-breakpoint
CREATE INDEX `creatorId_idx` ON `stories` (`creatorId`);--> statement-breakpoint
CREATE INDEX `expiresAt_idx` ON `stories` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `storyId_idx` ON `story_views` (`storyId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `story_views` (`userId`);--> statement-breakpoint
CREATE INDEX `creatorId_idx` ON `vault_folders` (`creatorId`);--> statement-breakpoint
CREATE INDEX `folderId_idx` ON `vault_items` (`folderId`);--> statement-breakpoint
CREATE INDEX `postId_idx` ON `vault_items` (`postId`);