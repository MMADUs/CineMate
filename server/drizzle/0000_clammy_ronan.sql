CREATE TABLE `AdminLog` (
	`LogID` int AUTO_INCREMENT NOT NULL,
	`AdminID` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entity` varchar(50) NOT NULL,
	`entityId` varchar(100) NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `AdminLog_LogID` PRIMARY KEY(`LogID`)
);
--> statement-breakpoint
CREATE TABLE `Admin` (
	`AdminID` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`password` varchar(255) NOT NULL,
	`refreshTokenHash` varchar(255),
	CONSTRAINT `Admin_AdminID` PRIMARY KEY(`AdminID`),
	CONSTRAINT `Admin_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `Booking_Seat` (
	`BookingID` varchar(36) NOT NULL,
	`SeatID` int NOT NULL,
	CONSTRAINT `Booking_Seat_BookingID_SeatID_pk` PRIMARY KEY(`BookingID`,`SeatID`)
);
--> statement-breakpoint
CREATE TABLE `Booking` (
	`BookingID` varchar(36) NOT NULL,
	`UserID` int NOT NULL,
	`ShowtimeID` int NOT NULL,
	`bookingDate` timestamp NOT NULL DEFAULT (now()),
	`taxAmount` decimal(12,2) NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`bookingStatus` varchar(20) NOT NULL DEFAULT 'Pending',
	CONSTRAINT `Booking_BookingID` PRIMARY KEY(`BookingID`)
);
--> statement-breakpoint
CREATE TABLE `CinemaHall` (
	`HallID` int AUTO_INCREMENT NOT NULL,
	`CinemaName` varchar(100) NOT NULL,
	`StudioName` varchar(50) NOT NULL,
	`totalRows` int NOT NULL,
	`seatsPerRow` int NOT NULL,
	CONSTRAINT `CinemaHall_HallID` PRIMARY KEY(`HallID`)
);
--> statement-breakpoint
CREATE TABLE `FNB_Order_Item` (
	`FNBOrderID` varchar(36) NOT NULL,
	`snackID` int NOT NULL,
	`quantity` int NOT NULL,
	`subTotalPrice` decimal(12,2) NOT NULL,
	CONSTRAINT `FNB_Order_Item_FNBOrderID_snackID_pk` PRIMARY KEY(`FNBOrderID`,`snackID`)
);
--> statement-breakpoint
CREATE TABLE `FNB_Order` (
	`FNBOrderID` varchar(36) NOT NULL,
	`UserID` int NOT NULL,
	`orderDate` timestamp NOT NULL DEFAULT (now()),
	`taxAmount` decimal(12,2) NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`orderStatus` varchar(20) NOT NULL DEFAULT 'Pending',
	CONSTRAINT `FNB_Order_FNBOrderID` PRIMARY KEY(`FNBOrderID`)
);
--> statement-breakpoint
CREATE TABLE `Movie` (
	`MovieID` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`genre` varchar(100) NOT NULL,
	`AgeRate` varchar(10) NOT NULL,
	`DurationMinutes` int NOT NULL,
	`PosterURL` varchar(255) NOT NULL,
	`TrailerURL` varchar(255) NOT NULL,
	`releaseDate` varchar(10) NOT NULL,
	`endDate` varchar(10) NOT NULL,
	`status` varchar(20) NOT NULL,
	CONSTRAINT `Movie_MovieID` PRIMARY KEY(`MovieID`)
);
--> statement-breakpoint
CREATE TABLE `PaymentWebhookEvent` (
	`EventID` int AUTO_INCREMENT NOT NULL,
	`PaymentID` int,
	`provider` varchar(50) NOT NULL DEFAULT 'XENDIT',
	`providerEventId` varchar(255) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`payload` text NOT NULL,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `PaymentWebhookEvent_EventID` PRIMARY KEY(`EventID`)
);
--> statement-breakpoint
CREATE TABLE `Payment` (
	`PaymentID` int AUTO_INCREMENT NOT NULL,
	`BookingID` varchar(36),
	`FNBOrderID` varchar(36),
	`provider` varchar(50) NOT NULL DEFAULT 'XENDIT',
	`providerPaymentId` varchar(100),
	`externalId` varchar(100) NOT NULL,
	`invoiceUrl` text,
	`paymentMethod` varchar(100) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'IDR',
	`paymentDate` timestamp NOT NULL DEFAULT (now()),
	`paymentStatus` varchar(20) NOT NULL DEFAULT 'Pending',
	`paidAt` varchar(50),
	`expiresAt` varchar(50),
	`failureReason` text,
	CONSTRAINT `Payment_PaymentID` PRIMARY KEY(`PaymentID`),
	CONSTRAINT `Payment_BookingID_unique` UNIQUE(`BookingID`),
	CONSTRAINT `Payment_FNBOrderID_unique` UNIQUE(`FNBOrderID`),
	CONSTRAINT `Payment_externalId_unique` UNIQUE(`externalId`)
);
--> statement-breakpoint
CREATE TABLE `Seat` (
	`SeatID` int AUTO_INCREMENT NOT NULL,
	`HallID` int NOT NULL,
	`rowLetter` varchar(1) NOT NULL,
	`SeatNumber` int NOT NULL,
	CONSTRAINT `Seat_SeatID` PRIMARY KEY(`SeatID`),
	CONSTRAINT `seat_hall_row_number_unique` UNIQUE(`HallID`,`rowLetter`,`SeatNumber`)
);
--> statement-breakpoint
CREATE TABLE `Showtime` (
	`ShowtimeID` int AUTO_INCREMENT NOT NULL,
	`MovieID` int NOT NULL,
	`HallID` int NOT NULL,
	`showDate` varchar(10) NOT NULL,
	`showTime` varchar(5) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	CONSTRAINT `Showtime_ShowtimeID` PRIMARY KEY(`ShowtimeID`)
);
--> statement-breakpoint
CREATE TABLE `Snack` (
	`SnackID` int AUTO_INCREMENT NOT NULL,
	`snackName` varchar(100) NOT NULL,
	`category` varchar(50) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`imageURL` varchar(255) NOT NULL,
	CONSTRAINT `Snack_SnackID` PRIMARY KEY(`SnackID`)
);
--> statement-breakpoint
CREATE TABLE `User` (
	`UserID` int AUTO_INCREMENT NOT NULL,
	`FullName` varchar(50) NOT NULL,
	`Email` varchar(100) NOT NULL,
	`PhoneNum` varchar(20) NOT NULL,
	`Password` varchar(255) NOT NULL,
	`refreshTokenHash` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `User_UserID` PRIMARY KEY(`UserID`),
	CONSTRAINT `User_Email_unique` UNIQUE(`Email`)
);
--> statement-breakpoint
ALTER TABLE `AdminLog` ADD CONSTRAINT `AdminLog_AdminID_Admin_AdminID_fk` FOREIGN KEY (`AdminID`) REFERENCES `Admin`(`AdminID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Booking_Seat` ADD CONSTRAINT `Booking_Seat_BookingID_Booking_BookingID_fk` FOREIGN KEY (`BookingID`) REFERENCES `Booking`(`BookingID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Booking_Seat` ADD CONSTRAINT `Booking_Seat_SeatID_Seat_SeatID_fk` FOREIGN KEY (`SeatID`) REFERENCES `Seat`(`SeatID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_UserID_User_UserID_fk` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_ShowtimeID_Showtime_ShowtimeID_fk` FOREIGN KEY (`ShowtimeID`) REFERENCES `Showtime`(`ShowtimeID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `FNB_Order_Item` ADD CONSTRAINT `FNB_Order_Item_FNBOrderID_FNB_Order_FNBOrderID_fk` FOREIGN KEY (`FNBOrderID`) REFERENCES `FNB_Order`(`FNBOrderID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `FNB_Order_Item` ADD CONSTRAINT `FNB_Order_Item_snackID_Snack_SnackID_fk` FOREIGN KEY (`snackID`) REFERENCES `Snack`(`SnackID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `FNB_Order` ADD CONSTRAINT `FNB_Order_UserID_User_UserID_fk` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `PaymentWebhookEvent` ADD CONSTRAINT `PaymentWebhookEvent_PaymentID_Payment_PaymentID_fk` FOREIGN KEY (`PaymentID`) REFERENCES `Payment`(`PaymentID`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_BookingID_Booking_BookingID_fk` FOREIGN KEY (`BookingID`) REFERENCES `Booking`(`BookingID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_FNBOrderID_FNB_Order_FNBOrderID_fk` FOREIGN KEY (`FNBOrderID`) REFERENCES `FNB_Order`(`FNBOrderID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_HallID_CinemaHall_HallID_fk` FOREIGN KEY (`HallID`) REFERENCES `CinemaHall`(`HallID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Showtime` ADD CONSTRAINT `Showtime_MovieID_Movie_MovieID_fk` FOREIGN KEY (`MovieID`) REFERENCES `Movie`(`MovieID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Showtime` ADD CONSTRAINT `Showtime_HallID_CinemaHall_HallID_fk` FOREIGN KEY (`HallID`) REFERENCES `CinemaHall`(`HallID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `admin_log_admin_id_idx` ON `AdminLog` (`AdminID`);--> statement-breakpoint
CREATE INDEX `booking_seat_seat_id_idx` ON `Booking_Seat` (`SeatID`);--> statement-breakpoint
CREATE INDEX `booking_user_id_idx` ON `Booking` (`UserID`);--> statement-breakpoint
CREATE INDEX `booking_showtime_id_idx` ON `Booking` (`ShowtimeID`);--> statement-breakpoint
CREATE INDEX `fnb_order_item_snack_id_idx` ON `FNB_Order_Item` (`snackID`);--> statement-breakpoint
CREATE INDEX `fnb_order_user_id_idx` ON `FNB_Order` (`UserID`);--> statement-breakpoint
CREATE INDEX `payment_webhook_event_payment_id_idx` ON `PaymentWebhookEvent` (`PaymentID`);--> statement-breakpoint
CREATE INDEX `payment_webhook_event_provider_event_idx` ON `PaymentWebhookEvent` (`provider`,`providerEventId`);--> statement-breakpoint
CREATE INDEX `payment_external_id_idx` ON `Payment` (`externalId`);--> statement-breakpoint
CREATE INDEX `payment_provider_payment_id_idx` ON `Payment` (`providerPaymentId`);--> statement-breakpoint
CREATE INDEX `seat_hall_id_idx` ON `Seat` (`HallID`);--> statement-breakpoint
CREATE INDEX `showtime_movie_id_idx` ON `Showtime` (`MovieID`);--> statement-breakpoint
CREATE INDEX `showtime_hall_id_idx` ON `Showtime` (`HallID`);