CREATE TABLE `live_streams` (
	`id` varchar(64) NOT NULL,
	`creatorId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`thumbnailUrl` text,
	`streamKey` varchar(255) NOT NULL,
	`status` enum('scheduled','live','ended') NOT NULL DEFAULT 'scheduled',
	`isPrivate` boolean NOT NULL DEFAULT false,
	`isPaid` boolean NOT NULL DEFAULT false,
	`price` int NOT NULL DEFAULT 0,
	`viewerCount` int NOT NULL DEFAULT 0,
	`totalViewers` int NOT NULL DEFAULT 0,
	`duration` int NOT NULL DEFAULT 0,
	`startedAt` timestamp,
	`endedAt` timestamp,
	`recordingUrl` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `live_streams_id` PRIMARY KEY(`id`),
	CONSTRAINT `live_streams_streamKey_unique` UNIQUE(`streamKey`)
);
--> statement-breakpoint
CREATE TABLE `stream_chat` (
	`id` varchar(64) NOT NULL,
	`streamId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`message` text NOT NULL,
	`isModeratorMessage` boolean NOT NULL DEFAULT false,
	`isFlaggedAsSpam` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `stream_chat_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stream_tips` (
	`id` varchar(64) NOT NULL,
	`streamId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`amount` int NOT NULL,
	`message` text,
	`isAnonymous` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `stream_tips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stream_viewers` (
	`id` varchar(64) NOT NULL,
	`streamId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`joinedAt` timestamp DEFAULT (now()),
	`leftAt` timestamp,
	`watchDuration` int NOT NULL DEFAULT 0,
	CONSTRAINT `stream_viewers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `live_streams` ADD CONSTRAINT `live_streams_creatorId_creator_profiles_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `creator_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stream_chat` ADD CONSTRAINT `stream_chat_streamId_live_streams_id_fk` FOREIGN KEY (`streamId`) REFERENCES `live_streams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stream_chat` ADD CONSTRAINT `stream_chat_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stream_tips` ADD CONSTRAINT `stream_tips_streamId_live_streams_id_fk` FOREIGN KEY (`streamId`) REFERENCES `live_streams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stream_tips` ADD CONSTRAINT `stream_tips_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stream_viewers` ADD CONSTRAINT `stream_viewers_streamId_live_streams_id_fk` FOREIGN KEY (`streamId`) REFERENCES `live_streams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stream_viewers` ADD CONSTRAINT `stream_viewers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `creatorId_idx` ON `live_streams` (`creatorId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `live_streams` (`status`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `live_streams` (`createdAt`);--> statement-breakpoint
CREATE INDEX `streamId_idx` ON `stream_chat` (`streamId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `stream_chat` (`userId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `stream_chat` (`createdAt`);--> statement-breakpoint
CREATE INDEX `streamId_idx` ON `stream_tips` (`streamId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `stream_tips` (`userId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `stream_tips` (`createdAt`);--> statement-breakpoint
CREATE INDEX `streamId_idx` ON `stream_viewers` (`streamId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `stream_viewers` (`userId`);