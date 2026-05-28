# CineMate - REST API Requirements Document

This document outlines the complete REST API endpoints required by the CineMate Frontend, strictly aligned with the database Entity-Relationship Diagram (ERD) and frontend TypeScript interfaces.

---

## 1. Authentication (User & Admin)
* **POST `/api/auth/register`**
  * **Role:** Public
  * **Payload:** `FullName`, `Email`, `PhoneNum`, `Password`
  * **Response:** `201 Created` with User object and JWT Token.
* **POST `/api/auth/login`**
  * **Role:** Public
  * **Payload:** `email` (or `username`), `password`
  * **Response:** `200 OK` with JWT Token and Role (`admin` or `user`).
* **POST `/api/auth/google`** *(ADDED)*
  * **Role:** Public
  * **Payload:** Google Firebase Token / Google User Data (`email`, `displayName`)
  * **Action:** Checks if the email exists in the `User` table. If yes, generate JWT. If not, auto-register the user then generate JWT.
  * **Response:** `200 OK` with JWT Token and Role.

---

## 2. Public Endpoints (Movies, Showtimes, & Snacks)
* **GET `/api/movies`**
  * **Query Params:** `?status=NOW_PLAYING|UPCOMING` & `?search=keyword`
  * **Response:** Array of `Movie` objects.
* **GET `/api/movies/:movieId`**
  * **Response:** Single `Movie` detail.
* **GET `/api/showtimes`**
  * **Query Params:** `?movieId=X&showDate=YYYY-MM-DD`
  * **Response:** Array of `Showtime` joined with `CinemaHall` (to get StudioName and CinemaName).
* **GET `/api/showtimes/:showtimeId/seats`** *(UPDATED - Logic Changed)*
  * **Response:** Details of `CinemaHall` (to render the A-J rows and columns) and an array of currently **occupied** `Seat` objects. 
  * **Critical Logic:** Backend must check `Booking_Seat` linked to this showtime where `BookingStatus != 'Cancelled'`.

---

## 3. User: Checkout, Orders, & Payments
* **POST `/api/bookings`** *(UPDATED - Replaced Lock Seats API)*
  * **Role:** User (Requires Token)
  * **Payload:** `ShowtimeID`, `SeatIDs` (Array of selected strings e.g., ["A1", "A2"]), `taxAmount`, `totalAmount`
  * **Critical Logic:** Backend must rely on DB UNIQUE constraint (`BookingID` + `SeatID` in `Booking_Seat`) to prevent double-booking. If it fails, return `409 Conflict: Seat already taken`.
  * **Response:** `BookingID`
* **POST `/api/fnb-orders`**
  * **Role:** User (Requires Token)
  * **Payload:** `items: [{ SnackID, Quantity, SubTotalPrice }]`, `taxAmount`, `totalAmount`
  * **Action:** Backend creates `FNB_Order` and multiple `FNB_Order_Item`.
  * **Response:** `FNBOrderID`
* **POST `/api/payments`** *(UPDATED - Added nullable handling)*
  * **Role:** User (Requires Token)
  * **Payload:** `BookingID` (nullable), `FNBOrderID` (nullable), `paymentMethod` (e.g., 'card', 'qris', 'gopay'), `amount`
  * **Action:** Creates a record in the `Payment` table. Automatically updates `bookingStatus` and `orderStatus` to 'Upcoming'/'Success' if the payment is verified.
* **GET `/api/users/orders`**
  * **Role:** User (Requires Token)
  * **Response:** Array of User's `Booking` and/or `FNB_Order` history.
* **GET `/api/orders/:bookingId`**
  * **Role:** User (Requires Token)
  * **Response:** Complete ticket/receipt data (Joined Movie, Showtime, CinemaHall, array of Seats, and Payment status).
* **GET `/api/users/profile`**
  * **Role:** User (Requires Token)
  * **Response:** User data matching the `User` table.
* **PUT `/api/users/profile`**
  * **Role:** User (Requires Token)
  * **Payload:** `FullName`, `PhoneNum`, `Password` (Optional).
  * **Action:** Updates user information.

---

## 4. Admin: Dashboard Analytics
* **GET `/api/admin/dashboard/metrics`**
  * **Role:** Admin (Requires Token)
  * **Response:** `totalRevenue` (Sum of `Payment.amount`), `ticketsSold` (Count of `Booking_Seat`), `pendingOrders`, `activeMoviesCount`.
* **GET `/api/admin/dashboard/chart`**
  * **Role:** Admin (Requires Token)
  * **Response:** Weekly revenue data array for Charts `[{ name: 'Mon', total: 4500000 }]`.

---

## 5. Admin: Data Management (CRUD)
*(Note: All GET requests here MUST support pagination `?page=X&limit=Y` and `?search=keyword` to allow Frontend to control data loads)*

### A. Movie Management (`Movie` Table)
* **GET** `/api/admin/movies?page=1&limit=5&search=keyword` *(UPDATED - Added Pagination)*
* **POST** `/api/admin/movies` 
  * **Content-Type:** `multipart/form-data`
  * **Payload:** `title`, `description`, `genre`, `AgeRate`, `DurationMinutes`, `TrailerURL`, `releaseDate`, `endDate`, `status`, `PosterURL` (File Upload).
* **PUT** `/api/admin/movies/:movieId`
* **DELETE** `/api/admin/movies/:movieId`

### B. Cinema Hall & Seat Management (`CinemaHall` & `Seat` Tables)
* **GET** `/api/admin/halls?page=1&limit=5&search=keyword` *(UPDATED - Added Pagination)*
* **POST** `/api/admin/halls` *(UPDATED - Added critical auto-generate logic)*
  * **Payload:** `CinemaName`, `StudioName`, `totalRows`, `seatsPerRow`
  * **Critical Logic:** After inserting into `CinemaHall`, backend **MUST** loop to auto-generate and insert rows into the `Seat` table (`rowLetter`, `SeatNumber`) linked to the new `HallID`.
* **PUT** `/api/admin/halls/:hallId` *(UPDATED - Added reset logic)*
  * **Critical Logic:** If totalRows or seatsPerRow changes, backend must reset/re-generate the `Seat` entries. Warn frontend via `400 Bad Request` if there are existing bookings for this hall before resetting.
* **DELETE** `/api/admin/halls/:hallId`

### C. Showtime Management (`Showtime` Table)
* **GET** `/api/admin/showtimes?page=1&limit=5&search=keyword` *(UPDATED - Added Pagination)*
* **POST** `/api/admin/showtimes`
  * **Payload:** `MovieID`, `HallID`, `showDate`, `showTime`, `price`
* **PUT** `/api/admin/showtimes/:showtimeId`
* **DELETE** `/api/admin/showtimes/:showtimeId`

### D. Snack / F&B Management (`Snack` Table)
* **GET** `/api/admin/snacks?page=1&limit=5&search=keyword` *(UPDATED - Added Pagination)*
* **POST** `/api/admin/snacks` 
  * **Content-Type:** `multipart/form-data`
  * **Payload:** `snackName`, `category`, `price`, `imageURL` (File Upload).
* **PUT** `/api/admin/snacks/:snackId`
* **DELETE** `/api/admin/snacks/:snackId`

### E. Transaction & Order Management
* **GET** `/api/admin/transactions?page=1&limit=5&search=keyword` *(UPDATED - Added Pagination)*
  * **Response:** Joined data from `Booking`, `FNB_Order`, `User`, and `Payment` tables to display on Admin Transactions Page.
* **PUT** `/api/admin/transactions/:bookingId/cancel`
  * **Action:** Manually updates `bookingStatus` to 'Cancelled'.
* **POST `/api/admin/transactions/:bookingId/verify`**
  * **Action:** Endpoint to be hit when Admin scans a User's QR Code. Validates the QR code and updates `bookingStatus` from 'Upcoming' to 'Completed'.

### F. Admin Profile
* **GET** `/api/admin/profile` *(UPDATED - Removed System Logs)*
  * **Response:** Admin data from `Admin` table.
* **PUT** `/api/admin/profile`
  * **Payload:** `FullName`, `PhoneNum`
  * **Action:** Updates admin profile data.