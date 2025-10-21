CREATE TABLE `wishlistItems` (
	`id` varchar(64) NOT NULL,
	`wishlistId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`url` text,
	`imageUrl` text,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`isPurchased` boolean NOT NULL DEFAULT false,
	`purchasedBy` varchar(64),
	`purchasedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `wishlistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlistPurchases` (
	`id` varchar(64) NOT NULL,
	`itemId` varchar(64) NOT NULL,
	`buyerId` varchar(64) NOT NULL,
	`creatorId` varchar(64) NOT NULL,
	`amount` int NOT NULL,
	`platformFee` int NOT NULL,
	`creatorEarnings` int NOT NULL,
	`status` enum('pending','completed','failed') DEFAULT 'pending',
	`transactionId` varchar(255),
	`message` text,
	`createdAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `wishlistPurchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` varchar(64) NOT NULL,
	`creatorId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`)
);
