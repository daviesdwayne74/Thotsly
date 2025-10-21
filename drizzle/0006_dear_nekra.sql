CREATE TABLE `age_verifications` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`verificationId` varchar(64) NOT NULL,
	`dateOfBirth` varchar(10) NOT NULL,
	`age` int NOT NULL,
	`isOver18` boolean NOT NULL,
	`isOver21` boolean NOT NULL,
	`verifiedAt` timestamp DEFAULT (now()),
	CONSTRAINT `age_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `id_verifications` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`idType` enum('passport','driver_license','national_id','other') NOT NULL,
	`idNumber` varchar(255) NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`dateOfBirth` varchar(10) NOT NULL,
	`expiryDate` varchar(10),
	`country` varchar(2) NOT NULL,
	`idImageUrl` text NOT NULL,
	`idImageBackUrl` text,
	`status` enum('pending','verified','rejected','expired') NOT NULL DEFAULT 'pending',
	`verificationNotes` text,
	`verifiedBy` varchar(64),
	`submittedAt` timestamp DEFAULT (now()),
	`verifiedAt` timestamp,
	CONSTRAINT `id_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `age_verifications` ADD CONSTRAINT `age_verifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `age_verifications` ADD CONSTRAINT `age_verifications_verificationId_id_verifications_id_fk` FOREIGN KEY (`verificationId`) REFERENCES `id_verifications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `id_verifications` ADD CONSTRAINT `id_verifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `id_verifications` ADD CONSTRAINT `id_verifications_verifiedBy_users_id_fk` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `age_verifications` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `id_verifications` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `id_verifications` (`status`);