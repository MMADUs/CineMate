# CineMate - REST API Requirements Document

This document outlines the REST API endpoints required by the CineMate Frontend, strictly aligned with the database Entity-Relationship Diagram (ERD).

---

## 1. Authentication (User & Admin)
* **POST `/api/auth/register`**
  * **Role:** Public
  * **Payload:** `FullName`, `Email`, `PhoneNum`, `Password`
  * **Response:** `201 Created` with User object and JWT Token.
* **POST `/api/auth/login`**
  * **Role:** Public
  * **Payload:** `email` / `username`, `password`
  * **Response:** `200 OK` with JWT Token and Role (`admin` or `user`).

---

## 2. Public Endpoints (Movies, Showtimes, & Snacks)
* **GET `/api/movies`**
  * **Query Params:** `?status=NOW_PLAYING|UPCOMING` & `?search=keyword`
  * **Response:** Array of `Movie` objects.
* **GET `/api/movies/:movieId`**
  * **Response:** Single `Movie` detail.
* **GET `/api/showtimes`**
  * **Query Params:** `?movieId=X&showDate=YYYY-MM-DD`
  * **Response:** Array of `Showtime` joined with `CinemaHall`.
* **GET `/api/showtimes/:showtimeId/seats`**
  * **Response:** Details of `CinemaHall` (rows and columns logic) and an array of occupied `Seat` objects (by checking `Booking_Seat` for the specific showtime).
* **GET `/api/snacks`**
  * **Query Params:** `?category=Snack|Drink|Combo`
  * **Response:** Array of `Snack` items for Food & Beverage page.

---

## 3. User: Checkout, Orders, & Payments
* **POST `/api/bookings`**
  * **Role:** User (Requires Token)
  * **Payload:** `showtimeID`, `seatIDs` (Array of selected SeatIDs), `taxAmount`, `totalAmount`
  * **Action:** Backend creates `Booking` and inserts into `Booking_Seat`.
  * **Response:** `BookingID`
* **POST `/api/fnb-orders`** (If purchasing snacks)
  * **Role:** User
  * **Payload:** `items: [{ snackID, quantity, subTotalPrice }]`, `taxAmount`, `totalAmount`
  * **Action:** Backend creates `FNB_Order` and `FNB_Order_Item`.
  * **Response:** `FNBOrderID`
* **POST `/api/payments`**
  * **Role:** User
  * **Payload:** `BookingID` (optional), `FNBOrderID` (optional), `paymentMethod`, `amount`
  * **Action:** Creates record in `Payment` table and updates `bookingStatus` / `orderStatus`.
* **GET `/api/users/orders`**
  * **Role:** User
  * **Response:** Array of User's `Booking` and `FNB_Order` history.
* **GET `/api/orders/:bookingId`**
  * **Role:** User
  * **Response:** Complete ticket/receipt data (Movie, Showtime, CinemaHall, Seats, Payment status).

---

## 4. Admin: Dashboard Analytics
* **GET `/api/admin/dashboard/metrics`**
  * **Role:** Admin
  * **Response:** `totalRevenue` (Sum of `Payment.amount`), `ticketsSold` (Count of `Booking_Seat`), `pendingOrders`, `activeMoviesCount`.
* **GET `/api/admin/dashboard/chart`**
  * **Role:** Admin
  * **Response:** Weekly revenue data array for Shadcn Charts `[{ name: 'Mon', total: 4500000 }, ...]`.

---

## 5. Admin: Data Management (CRUD)
*(All endpoints below require Admin JWT Token)*

### A. Movie Management (`Movie` Table)
* **GET** `/api/admin/movies`
* **POST** `/api/admin/movies` (Requires `multipart/form-data` for image upload)
  * **Payload:** `title`, `description`, `genre`, `AgeRate`, `DurationMinutes`, `TrailerURL`, `releaseDate`, `endDate`, `status`, `PosterURL` (File).
* **PUT** `/api/admin/movies/:movieId`
* **DELETE** `/api/admin/movies/:movieId`

### B. Cinema Hall & Seat Management (`CinemaHall` & `Seat` Tables)
* **GET** `/api/admin/halls`
* **POST** `/api/admin/halls`
  * **Payload:** `CinemaName`, `StudioName`, `totalRows`, `seatsPerRow`
  * **Critical Logic:** After inserting into `CinemaHall`, backend **MUST** loop to auto-generate and insert rows into the `Seat` table (`rowLetter`, `SeatNumber`) linked to the new `HallID`.
* **PUT** `/api/admin/halls/:hallId`
  * **Critical Logic:** If grid dimensions change, backend must reset/re-generate the `Seat` entries.
* **DELETE** `/api/admin/halls/:hallId`

### C. Showtime Management (`Showtime` Table)
* **GET** `/api/admin/showtimes`
* **POST** `/api/admin/showtimes`
  * **Payload:** `MovieID`, `HallID`, `showDate`, `showTime`, `price`
* **PUT** `/api/admin/showtimes/:showtimeId`
* **DELETE** `/api/admin/showtimes/:showtimeId`

### D. Snack / F&B Management (`Snack` Table)
* **GET** `/api/admin/snacks`
* **POST** `/api/admin/snacks` (Requires `multipart/form-data`)
  * **Payload:** `snackName`, `category`, `price`, `imageURL` (File).
* **PUT** `/api/admin/snacks/:snackId`
* **DELETE** `/api/admin/snacks/:snackId`

### E. Transaction & Order Management
* **GET** `/api/admin/transactions`
  * **Response:** Joined data from `Booking`, `FNB_Order`, `User`, and `Payment` tables.
* **PUT** `/api/admin/transactions/:bookingId/cancel`
  * **Action:** Updates `bookingStatus` to 'Cancelled'.

### F. Admin Profile & System Logs
* **GET** `/api/admin/profile`
  * **Response:** Admin data from `Admin` table.
* **GET** `/api/admin/logs`
  * **Response:** Array of system activity logs.