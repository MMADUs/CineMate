CREATE TABLE `Cinema` (
  `CinemaID` int AUTO_INCREMENT NOT NULL,
  `CinemaName` varchar(100) NOT NULL,
  `Location` varchar(255) NOT NULL,
  CONSTRAINT `Cinema_CinemaID` PRIMARY KEY(`CinemaID`)
);
--> statement-breakpoint
CREATE TABLE `Studio` (
  `StudioID` int AUTO_INCREMENT NOT NULL,
  `CinemaID` int NOT NULL,
  `StudioName` varchar(50) NOT NULL,
  `totalRows` int NOT NULL,
  `seatsPerRow` int NOT NULL,
  CONSTRAINT `Studio_StudioID` PRIMARY KEY(`StudioID`)
);
--> statement-breakpoint
ALTER TABLE `Studio` ADD CONSTRAINT `Studio_CinemaID_Cinema_CinemaID_fk` FOREIGN KEY (`CinemaID`) REFERENCES `Cinema`(`CinemaID`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `studio_cinema_id_idx` ON `Studio` (`CinemaID`);
--> statement-breakpoint
INSERT INTO `Cinema` (`CinemaName`, `Location`)
SELECT DISTINCT `CinemaName`, 'Unknown'
FROM `CinemaHall`;
--> statement-breakpoint
INSERT INTO `Studio` (`StudioID`, `CinemaID`, `StudioName`, `totalRows`, `seatsPerRow`)
SELECT `h`.`HallID`, `c`.`CinemaID`, `h`.`StudioName`, `h`.`totalRows`, `h`.`seatsPerRow`
FROM `CinemaHall` `h`
INNER JOIN `Cinema` `c` ON `c`.`CinemaName` = `h`.`CinemaName`;
--> statement-breakpoint
SET @seat_studio_fk = (SELECT `CONSTRAINT_NAME` FROM `information_schema`.`KEY_COLUMN_USAGE` WHERE `TABLE_SCHEMA` = DATABASE() AND `TABLE_NAME` = 'Seat' AND `COLUMN_NAME` = 'HallID' AND `REFERENCED_TABLE_NAME` = 'CinemaHall' LIMIT 1);
--> statement-breakpoint
SET @seat_studio_fk_sql = IF(@seat_studio_fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE `Seat` DROP FOREIGN KEY `', @seat_studio_fk, '`'));
--> statement-breakpoint
PREPARE seat_studio_fk_stmt FROM @seat_studio_fk_sql;
--> statement-breakpoint
EXECUTE seat_studio_fk_stmt;
--> statement-breakpoint
DEALLOCATE PREPARE seat_studio_fk_stmt;
--> statement-breakpoint
SET @showtime_studio_fk = (SELECT `CONSTRAINT_NAME` FROM `information_schema`.`KEY_COLUMN_USAGE` WHERE `TABLE_SCHEMA` = DATABASE() AND `TABLE_NAME` = 'Showtime' AND `COLUMN_NAME` = 'HallID' AND `REFERENCED_TABLE_NAME` = 'CinemaHall' LIMIT 1);
--> statement-breakpoint
SET @showtime_studio_fk_sql = IF(@showtime_studio_fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE `Showtime` DROP FOREIGN KEY `', @showtime_studio_fk, '`'));
--> statement-breakpoint
PREPARE showtime_studio_fk_stmt FROM @showtime_studio_fk_sql;
--> statement-breakpoint
EXECUTE showtime_studio_fk_stmt;
--> statement-breakpoint
DEALLOCATE PREPARE showtime_studio_fk_stmt;
--> statement-breakpoint
DROP INDEX `seat_hall_row_number_unique` ON `Seat`;
--> statement-breakpoint
DROP INDEX `seat_hall_id_idx` ON `Seat`;
--> statement-breakpoint
DROP INDEX `showtime_hall_id_idx` ON `Showtime`;
--> statement-breakpoint
ALTER TABLE `Seat` CHANGE `HallID` `StudioID` int NOT NULL;
--> statement-breakpoint
ALTER TABLE `Showtime` CHANGE `HallID` `StudioID` int NOT NULL;
--> statement-breakpoint
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_StudioID_Studio_StudioID_fk` FOREIGN KEY (`StudioID`) REFERENCES `Studio`(`StudioID`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `Showtime` ADD CONSTRAINT `Showtime_StudioID_Studio_StudioID_fk` FOREIGN KEY (`StudioID`) REFERENCES `Studio`(`StudioID`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX `seat_studio_row_number_unique` ON `Seat` (`StudioID`,`rowLetter`,`SeatNumber`);
--> statement-breakpoint
CREATE INDEX `seat_studio_id_idx` ON `Seat` (`StudioID`);
--> statement-breakpoint
CREATE INDEX `showtime_studio_id_idx` ON `Showtime` (`StudioID`);
--> statement-breakpoint
DROP TABLE `CinemaHall`;
