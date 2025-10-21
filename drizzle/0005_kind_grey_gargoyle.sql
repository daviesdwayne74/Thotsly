CREATE TABLE `creator_applications` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`bio` text,
	`category` varchar(64) NOT NULL,
	`portfolioUrls` text,
	`socialLinks` text,
	`statement` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`rejectionReason` text,
	`reviewedBy` varchar(64),
	`submittedAt` timestamp DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `creator_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_items` (
	`id` varchar(64) NOT NULL,
	`applicationId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`mediaUrl` text NOT NULL,
	`mediaType` enum('image','video','audio') NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `portfolio_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `creator_applications` ADD CONSTRAINT `creator_applications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `creator_applications` ADD CONSTRAINT `creator_applications_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portfolio_items` ADD CONSTRAINT `portfolio_items_applicationId_creator_applications_id_fk` FOREIGN KEY (`applicationId`) REFERENCES `creator_applications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `creator_applications` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `creator_applications` (`status`);--> statement-breakpoint
CREATE INDEX `applicationId_idx` ON `portfolio_items` (`applicationId`);