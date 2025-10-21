CREATE TABLE `email_logs` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`type` enum('subscription','message','tip','stream','digest','promotional') NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`status` enum('sent','failed','bounced') NOT NULL DEFAULT 'sent',
	`sentAt` timestamp DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_preferences` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`newSubscriber` boolean NOT NULL DEFAULT true,
	`newMessage` boolean NOT NULL DEFAULT true,
	`newTip` boolean NOT NULL DEFAULT true,
	`streamNotification` boolean NOT NULL DEFAULT true,
	`weeklyDigest` boolean NOT NULL DEFAULT true,
	`promotionalEmails` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `email_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stream_recordings` (
	`id` varchar(64) NOT NULL,
	`streamId` varchar(64) NOT NULL,
	`creatorId` varchar(64) NOT NULL,
	`recordingUrl` text NOT NULL,
	`thumbnailUrl` text,
	`duration` int,
	`fileSize` int,
	`resolution` varchar(20),
	`isPublic` boolean NOT NULL DEFAULT true,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `stream_recordings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vod_views` (
	`id` varchar(64) NOT NULL,
	`recordingId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`watchedDuration` int,
	`viewedAt` timestamp DEFAULT (now()),
	CONSTRAINT `vod_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `email_logs` ADD CONSTRAINT `email_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_preferences` ADD CONSTRAINT `email_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stream_recordings` ADD CONSTRAINT `stream_recordings_streamId_live_streams_id_fk` FOREIGN KEY (`streamId`) REFERENCES `live_streams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stream_recordings` ADD CONSTRAINT `stream_recordings_creatorId_creator_profiles_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `creator_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vod_views` ADD CONSTRAINT `vod_views_recordingId_stream_recordings_id_fk` FOREIGN KEY (`recordingId`) REFERENCES `stream_recordings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vod_views` ADD CONSTRAINT `vod_views_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `email_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `email_logs` (`type`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `email_preferences` (`userId`);--> statement-breakpoint
CREATE INDEX `streamId_idx` ON `stream_recordings` (`streamId`);--> statement-breakpoint
CREATE INDEX `creatorId_idx` ON `stream_recordings` (`creatorId`);--> statement-breakpoint
CREATE INDEX `recordingId_idx` ON `vod_views` (`recordingId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `vod_views` (`userId`);