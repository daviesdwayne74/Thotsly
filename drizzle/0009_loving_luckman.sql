CREATE TABLE `creator_payouts` (
	`id` varchar(64) NOT NULL,
	`creatorId` varchar(64) NOT NULL,
	`stripePayoutId` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','in_transit','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
	`currency` varchar(3) NOT NULL DEFAULT 'usd',
	`arrivalDate` timestamp,
	`failureCode` varchar(64),
	`failureMessage` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `creator_payouts_id` PRIMARY KEY(`id`),
	CONSTRAINT `creator_payouts_stripePayoutId_unique` UNIQUE(`stripePayoutId`)
);
--> statement-breakpoint
CREATE TABLE `stripe_connect_accounts` (
	`id` varchar(64) NOT NULL,
	`creatorId` varchar(64) NOT NULL,
	`stripeConnectAccountId` varchar(255) NOT NULL,
	`type` enum('express','custom') NOT NULL DEFAULT 'express',
	`status` enum('pending','active','inactive') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `stripe_connect_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_connect_accounts_stripeConnectAccountId_unique` UNIQUE(`stripeConnectAccountId`)
);
--> statement-breakpoint
ALTER TABLE `creator_profiles` ADD `isEliteFounding` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `creator_payouts` ADD CONSTRAINT `creator_payouts_creatorId_creator_profiles_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `creator_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stripe_connect_accounts` ADD CONSTRAINT `stripe_connect_accounts_creatorId_creator_profiles_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `creator_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `creatorId_idx` ON `creator_payouts` (`creatorId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `creator_payouts` (`status`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `creator_payouts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `creatorId_idx` ON `stripe_connect_accounts` (`creatorId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `stripe_connect_accounts` (`status`);