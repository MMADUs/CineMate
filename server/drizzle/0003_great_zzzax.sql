SET @booking_user_fk = (SELECT `CONSTRAINT_NAME` FROM `information_schema`.`KEY_COLUMN_USAGE` WHERE `TABLE_SCHEMA` = DATABASE() AND `TABLE_NAME` = 'Booking' AND `COLUMN_NAME` = 'UserID' AND `REFERENCED_TABLE_NAME` = 'User' LIMIT 1);--> statement-breakpoint
SET @booking_user_fk_sql = IF(@booking_user_fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE `Booking` DROP FOREIGN KEY `', @booking_user_fk, '`'));--> statement-breakpoint
PREPARE booking_user_fk_stmt FROM @booking_user_fk_sql;--> statement-breakpoint
EXECUTE booking_user_fk_stmt;--> statement-breakpoint
DEALLOCATE PREPARE booking_user_fk_stmt;--> statement-breakpoint
SET @fnb_order_user_fk = (SELECT `CONSTRAINT_NAME` FROM `information_schema`.`KEY_COLUMN_USAGE` WHERE `TABLE_SCHEMA` = DATABASE() AND `TABLE_NAME` = 'FNB_Order' AND `COLUMN_NAME` = 'UserID' AND `REFERENCED_TABLE_NAME` = 'User' LIMIT 1);--> statement-breakpoint
SET @fnb_order_user_fk_sql = IF(@fnb_order_user_fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE `FNB_Order` DROP FOREIGN KEY `', @fnb_order_user_fk, '`'));--> statement-breakpoint
PREPARE fnb_order_user_fk_stmt FROM @fnb_order_user_fk_sql;--> statement-breakpoint
EXECUTE fnb_order_user_fk_stmt;--> statement-breakpoint
DEALLOCATE PREPARE fnb_order_user_fk_stmt;--> statement-breakpoint
SET @new_user_id_exists = (SELECT COUNT(*) FROM `information_schema`.`COLUMNS` WHERE `TABLE_SCHEMA` = DATABASE() AND `TABLE_NAME` = 'User' AND `COLUMN_NAME` = 'NewUserID');--> statement-breakpoint
SET @add_new_user_id_sql = IF(@new_user_id_exists = 0, 'ALTER TABLE `User` ADD `NewUserID` varchar(36)', 'SELECT 1');--> statement-breakpoint
PREPARE add_new_user_id_stmt FROM @add_new_user_id_sql;--> statement-breakpoint
EXECUTE add_new_user_id_stmt;--> statement-breakpoint
DEALLOCATE PREPARE add_new_user_id_stmt;--> statement-breakpoint
UPDATE `User` SET `NewUserID` = UUID();--> statement-breakpoint
ALTER TABLE `User` MODIFY COLUMN `UserID` int NOT NULL;--> statement-breakpoint
ALTER TABLE `Booking` MODIFY COLUMN `UserID` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `FNB_Order` MODIFY COLUMN `UserID` varchar(36) NOT NULL;--> statement-breakpoint
UPDATE `Booking` `b` INNER JOIN `User` `u` ON CAST(`b`.`UserID` AS UNSIGNED) = `u`.`UserID` SET `b`.`UserID` = `u`.`NewUserID`;--> statement-breakpoint
UPDATE `FNB_Order` `f` INNER JOIN `User` `u` ON CAST(`f`.`UserID` AS UNSIGNED) = `u`.`UserID` SET `f`.`UserID` = `u`.`NewUserID`;--> statement-breakpoint
ALTER TABLE `User` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `User` MODIFY COLUMN `UserID` varchar(36) NOT NULL;--> statement-breakpoint
UPDATE `User` SET `UserID` = `NewUserID`;--> statement-breakpoint
ALTER TABLE `User` DROP COLUMN `NewUserID`;--> statement-breakpoint
ALTER TABLE `User` ADD CONSTRAINT `User_UserID` PRIMARY KEY(`UserID`);--> statement-breakpoint
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_UserID_User_UserID_fk` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `FNB_Order` ADD CONSTRAINT `FNB_Order_UserID_User_UserID_fk` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE cascade ON UPDATE no action;
