ALTER TABLE `User` MODIFY COLUMN `PhoneNum` varchar(20);--> statement-breakpoint
ALTER TABLE `User` MODIFY COLUMN `Password` varchar(255);--> statement-breakpoint
ALTER TABLE `FNB_Order` ADD `ShowtimeID` int;--> statement-breakpoint
ALTER TABLE `Snack` ADD `stock` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `User` ADD `authProvider` varchar(20) DEFAULT 'LOCAL' NOT NULL;--> statement-breakpoint
ALTER TABLE `User` ADD `googleId` varchar(100);--> statement-breakpoint
ALTER TABLE `User` ADD `avatarUrl` varchar(255);--> statement-breakpoint
ALTER TABLE `User` ADD CONSTRAINT `User_googleId_unique` UNIQUE(`googleId`);--> statement-breakpoint
ALTER TABLE `FNB_Order` ADD CONSTRAINT `FNB_Order_ShowtimeID_Showtime_ShowtimeID_fk` FOREIGN KEY (`ShowtimeID`) REFERENCES `Showtime`(`ShowtimeID`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `fnb_order_showtime_id_idx` ON `FNB_Order` (`ShowtimeID`);--> statement-breakpoint
ALTER TABLE `Booking` DROP COLUMN `bookingStatus`;