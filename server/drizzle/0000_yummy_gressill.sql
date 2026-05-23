CREATE TABLE `AdminLog` (
	`LogID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`AdminID` integer NOT NULL,
	`action` text(100) NOT NULL,
	`entity` text(50) NOT NULL,
	`entityId` text NOT NULL,
	`details` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`AdminID`) REFERENCES `Admin`(`AdminID`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `admin_log_admin_id_idx` ON `AdminLog` (`AdminID`);--> statement-breakpoint
CREATE TABLE `Admin` (
	`AdminID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text(100) NOT NULL,
	`email` text(100) NOT NULL,
	`password` text(255) NOT NULL,
	`refreshTokenHash` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Admin_email_unique` ON `Admin` (`email`);--> statement-breakpoint
CREATE TABLE `Booking_Seat` (
	`BookingID` text NOT NULL,
	`SeatID` integer NOT NULL,
	PRIMARY KEY(`BookingID`, `SeatID`),
	FOREIGN KEY (`BookingID`) REFERENCES `Booking`(`BookingID`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`SeatID`) REFERENCES `Seat`(`SeatID`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `booking_seat_seat_id_idx` ON `Booking_Seat` (`SeatID`);--> statement-breakpoint
CREATE TABLE `Booking` (
	`BookingID` text PRIMARY KEY NOT NULL,
	`UserID` integer NOT NULL,
	`ShowtimeID` integer NOT NULL,
	`bookingDate` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`taxAmount` numeric NOT NULL,
	`totalAmount` numeric NOT NULL,
	`bookingStatus` text(20) DEFAULT 'Pending' NOT NULL,
	FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ShowtimeID`) REFERENCES `Showtime`(`ShowtimeID`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `booking_user_id_idx` ON `Booking` (`UserID`);--> statement-breakpoint
CREATE INDEX `booking_showtime_id_idx` ON `Booking` (`ShowtimeID`);--> statement-breakpoint
CREATE TABLE `CinemaHall` (
	`HallID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`CinemaName` text(100) NOT NULL,
	`StudioName` text(50) NOT NULL,
	`totalRows` integer NOT NULL,
	`seatsPerRow` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `FNB_Order_Item` (
	`FNBOrderID` text NOT NULL,
	`snackID` integer NOT NULL,
	`quantity` integer NOT NULL,
	`subTotalPrice` numeric NOT NULL,
	PRIMARY KEY(`FNBOrderID`, `snackID`),
	FOREIGN KEY (`FNBOrderID`) REFERENCES `FNB_Order`(`FNBOrderID`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`snackID`) REFERENCES `Snack`(`SnackID`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `fnb_order_item_snack_id_idx` ON `FNB_Order_Item` (`snackID`);--> statement-breakpoint
CREATE TABLE `FNB_Order` (
	`FNBOrderID` text PRIMARY KEY NOT NULL,
	`UserID` integer NOT NULL,
	`orderDate` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`taxAmount` numeric NOT NULL,
	`totalAmount` numeric NOT NULL,
	`orderStatus` text(20) DEFAULT 'Pending' NOT NULL,
	FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `fnb_order_user_id_idx` ON `FNB_Order` (`UserID`);--> statement-breakpoint
CREATE TABLE `Movie` (
	`MovieID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text(255) NOT NULL,
	`description` text NOT NULL,
	`genre` text(100) NOT NULL,
	`AgeRate` text(10) NOT NULL,
	`DurationMinutes` integer NOT NULL,
	`PosterURL` text(255) NOT NULL,
	`TrailerURL` text(255) NOT NULL,
	`releaseDate` text NOT NULL,
	`endDate` text NOT NULL,
	`status` text(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Payment` (
	`PaymentID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`BookingID` text,
	`FNBOrderID` text,
	`paymentMethod` text(100) NOT NULL,
	`amount` numeric NOT NULL,
	`paymentDate` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`paymentStatus` text(20) DEFAULT 'Pending' NOT NULL,
	FOREIGN KEY (`BookingID`) REFERENCES `Booking`(`BookingID`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`FNBOrderID`) REFERENCES `FNB_Order`(`FNBOrderID`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Payment_BookingID_unique` ON `Payment` (`BookingID`);--> statement-breakpoint
CREATE UNIQUE INDEX `Payment_FNBOrderID_unique` ON `Payment` (`FNBOrderID`);--> statement-breakpoint
CREATE TABLE `Seat` (
	`SeatID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`HallID` integer NOT NULL,
	`rowLetter` text(1) NOT NULL,
	`SeatNumber` integer NOT NULL,
	FOREIGN KEY (`HallID`) REFERENCES `CinemaHall`(`HallID`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seat_hall_row_number_unique` ON `Seat` (`HallID`,`rowLetter`,`SeatNumber`);--> statement-breakpoint
CREATE INDEX `seat_hall_id_idx` ON `Seat` (`HallID`);--> statement-breakpoint
CREATE TABLE `Showtime` (
	`ShowtimeID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`MovieID` integer NOT NULL,
	`HallID` integer NOT NULL,
	`showDate` text NOT NULL,
	`showTime` text NOT NULL,
	`price` numeric NOT NULL,
	FOREIGN KEY (`MovieID`) REFERENCES `Movie`(`MovieID`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`HallID`) REFERENCES `CinemaHall`(`HallID`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `showtime_movie_id_idx` ON `Showtime` (`MovieID`);--> statement-breakpoint
CREATE INDEX `showtime_hall_id_idx` ON `Showtime` (`HallID`);--> statement-breakpoint
CREATE TABLE `Snack` (
	`SnackID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snackName` text(100) NOT NULL,
	`category` text(50) NOT NULL,
	`price` numeric NOT NULL,
	`imageURL` text(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `User` (
	`UserID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`FullName` text(50) NOT NULL,
	`Email` text(100) NOT NULL,
	`PhoneNum` text(20) NOT NULL,
	`Password` text(255) NOT NULL,
	`refreshTokenHash` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_Email_unique` ON `User` (`Email`);