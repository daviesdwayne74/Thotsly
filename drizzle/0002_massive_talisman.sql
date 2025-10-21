CREATE TABLE `merch_products` (
	`id` varchar(64) NOT NULL,
	`creatorId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`price` int NOT NULL,
	`inventory` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `merch_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stripe_customers` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`stripeCustomerId` varchar(255) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `stripe_customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_customers_stripeCustomerId_unique` UNIQUE(`stripeCustomerId`)
);
--> statement-breakpoint
ALTER TABLE `merch_products` ADD CONSTRAINT `merch_products_creatorId_creator_profiles_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `creator_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stripe_customers` ADD CONSTRAINT `stripe_customers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `creatorId_idx` ON `merch_products` (`creatorId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `stripe_customers` (`userId`);