CREATE TABLE `PaymentWebhookEvent` (
	`EventID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`PaymentID` integer,
	`provider` text(50) DEFAULT 'XENDIT' NOT NULL,
	`providerEventId` text(255) NOT NULL,
	`eventType` text(100) NOT NULL,
	`payload` text NOT NULL,
	`receivedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`PaymentID`) REFERENCES `Payment`(`PaymentID`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `payment_webhook_event_payment_id_idx` ON `PaymentWebhookEvent` (`PaymentID`);--> statement-breakpoint
CREATE INDEX `payment_webhook_event_provider_event_idx` ON `PaymentWebhookEvent` (`provider`,`providerEventId`);--> statement-breakpoint
ALTER TABLE `Payment` ADD `provider` text(50) DEFAULT 'XENDIT' NOT NULL;--> statement-breakpoint
ALTER TABLE `Payment` ADD `providerPaymentId` text(100);--> statement-breakpoint
ALTER TABLE `Payment` ADD `externalId` text(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `Payment` ADD `invoiceUrl` text;--> statement-breakpoint
ALTER TABLE `Payment` ADD `currency` text(3) DEFAULT 'IDR' NOT NULL;--> statement-breakpoint
ALTER TABLE `Payment` ADD `paidAt` text;--> statement-breakpoint
ALTER TABLE `Payment` ADD `expiresAt` text;--> statement-breakpoint
ALTER TABLE `Payment` ADD `failureReason` text;--> statement-breakpoint
CREATE UNIQUE INDEX `Payment_externalId_unique` ON `Payment` (`externalId`);--> statement-breakpoint
CREATE INDEX `payment_external_id_idx` ON `Payment` (`externalId`);--> statement-breakpoint
CREATE INDEX `payment_provider_payment_id_idx` ON `Payment` (`providerPaymentId`);