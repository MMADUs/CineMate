CREATE TABLE `IdempotencyKey` (
	`IdempotencyKeyID` int AUTO_INCREMENT NOT NULL,
	`idempotencyKey` varchar(255) NOT NULL,
	`scope` varchar(100) NOT NULL,
	`method` varchar(10) NOT NULL,
	`route` varchar(255) NOT NULL,
	`requestHash` varchar(64) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'PROCESSING',
	`responseStatus` int,
	`responseBody` text,
	`lockedUntil` timestamp,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `IdempotencyKey_IdempotencyKeyID` PRIMARY KEY(`IdempotencyKeyID`),
	CONSTRAINT `idempotency_key_scope_key_unique` UNIQUE(`scope`,`idempotencyKey`)
);
--> statement-breakpoint
CREATE INDEX `idempotency_key_expires_at_idx` ON `IdempotencyKey` (`expiresAt`);