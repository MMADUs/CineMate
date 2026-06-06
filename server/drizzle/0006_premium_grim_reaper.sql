ALTER TABLE `FNB_Order` MODIFY COLUMN `orderStatus` varchar(30) NOT NULL DEFAULT 'PendingPayment';--> statement-breakpoint
ALTER TABLE `Booking` ADD `orderStatus` varchar(30) DEFAULT 'PendingPayment' NOT NULL;
--> statement-breakpoint
UPDATE `FNB_Order` SET `orderStatus` = 'PendingPayment' WHERE `orderStatus` = 'Pending';
