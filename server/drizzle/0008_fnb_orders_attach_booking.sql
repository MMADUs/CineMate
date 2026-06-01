SET @fnb_order_showtime_fk = (
  SELECT `CONSTRAINT_NAME`
  FROM `information_schema`.`KEY_COLUMN_USAGE`
  WHERE `TABLE_SCHEMA` = DATABASE()
    AND `TABLE_NAME` = 'FNB_Order'
    AND `COLUMN_NAME` = 'ShowtimeID'
    AND `REFERENCED_TABLE_NAME` = 'Showtime'
  LIMIT 1
);
--> statement-breakpoint
SET @drop_fnb_order_showtime_fk = IF(
  @fnb_order_showtime_fk IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE `FNB_Order` DROP FOREIGN KEY `', @fnb_order_showtime_fk, '`')
);
--> statement-breakpoint
PREPARE stmt FROM @drop_fnb_order_showtime_fk;
--> statement-breakpoint
EXECUTE stmt;
--> statement-breakpoint
DEALLOCATE PREPARE stmt;
--> statement-breakpoint
DROP INDEX `fnb_order_showtime_id_idx` ON `FNB_Order`;
--> statement-breakpoint
ALTER TABLE `FNB_Order` DROP COLUMN `ShowtimeID`;
--> statement-breakpoint
ALTER TABLE `FNB_Order` ADD `BookingID` varchar(36);
--> statement-breakpoint
CREATE INDEX `fnb_order_booking_id_idx` ON `FNB_Order` (`BookingID`);
--> statement-breakpoint
ALTER TABLE `FNB_Order` ADD CONSTRAINT `FNB_Order_BookingID_Booking_BookingID_fk` FOREIGN KEY (`BookingID`) REFERENCES `Booking`(`BookingID`) ON DELETE set null ON UPDATE no action;
