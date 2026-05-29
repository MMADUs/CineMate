import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  numeric,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

/**
 * SQLite + Drizzle schema converted from the Prisma schema.
 *
 * Notes:
 * - SQLite has no native varchar/char/decimal/datetime types.
 * - text() is used for varchar/char/date/datetime/string UUID fields.
 * - numeric() is used for decimal values.
 * - Date fields use text with SQL timestamps/defaults.
 * - UUID-like IDs use SQLite random hex generation.
 */

export const admins = sqliteTable("Admin", {
  adminId: integer("AdminID").primaryKey({ autoIncrement: true }),
  username: text("username", { length: 100 }).notNull(),
  email: text("email", { length: 100 }).notNull().unique(),
  password: text("password", { length: 255 }).notNull(),
});

export const users = sqliteTable("User", {
  userId: integer("UserID").primaryKey({ autoIncrement: true }),
  fullName: text("FullName", { length: 50 }).notNull(),
  email: text("Email", { length: 100 }).notNull().unique(),
  phoneNum: text("PhoneNum", { length: 20 }).notNull(),
  password: text("Password", { length: 255 }).notNull(),
});

export const movies = sqliteTable("Movie", {
  movieId: integer("MovieID").primaryKey({ autoIncrement: true }),
  title: text("title", { length: 255 }).notNull(),
  description: text("description", { length: 255 }).notNull(),
  genre: text("genre", { length: 100 }).notNull(),
  ageRate: text("AgeRate", { length: 10 }).notNull(),
  durationMinutes: integer("DurationMinutes").notNull(),
  posterUrl: text("PosterURL", { length: 255 }).notNull(),
  trailerUrl: text("TrailerURL", { length: 255 }).notNull(),
  releaseDate: text("releaseDate").notNull(),
  endDate: text("endDate").notNull(),
  status: text("status", { length: 20 }).notNull(),
});

export const cinemaHalls = sqliteTable("CinemaHall", {
  hallId: integer("HallID").primaryKey({ autoIncrement: true }),
  cinemaName: text("CinemaName", { length: 100 }).notNull(),
  studioName: text("StudioName", { length: 50 }).notNull(),
  totalRows: integer("totalRows").notNull(),
  seatsPerRow: integer("seatsPerRow").notNull(),
});

export const showtimes = sqliteTable(
  "Showtime",
  {
    showtimeId: integer("ShowtimeID").primaryKey({ autoIncrement: true }),
    movieId: integer("MovieID")
      .notNull()
      .references(() => movies.movieId, { onDelete: "cascade" }),
    hallId: integer("HallID")
      .notNull()
      .references(() => cinemaHalls.hallId, { onDelete: "cascade" }),
    showDate: text("showDate").notNull(),
    showTime: text("showTime").notNull(),
    price: numeric("price").notNull(),
  },
  (table) => [
    index("showtime_movie_id_idx").on(table.movieId),
    index("showtime_hall_id_idx").on(table.hallId),
  ],
);

export const seats = sqliteTable(
  "Seat",
  {
    seatId: integer("SeatID").primaryKey({ autoIncrement: true }),
    hallId: integer("HallID")
      .notNull()
      .references(() => cinemaHalls.hallId, { onDelete: "cascade" }),
    rowLetter: text("rowLetter", { length: 1 }).notNull(),
    seatNumber: integer("SeatNumber").notNull(),
  },
  (table) => [
    uniqueIndex("seat_hall_row_number_unique").on(
      table.hallId,
      table.rowLetter,
      table.seatNumber,
    ),
    index("seat_hall_id_idx").on(table.hallId),
  ],
);

export const bookings = sqliteTable(
  "Booking",
  {
    bookingId: text("BookingID")
      .primaryKey()
      .default(sql`lower(hex(randomblob(16)))`),
    userId: integer("UserID")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    showtimeId: integer("ShowtimeID")
      .notNull()
      .references(() => showtimes.showtimeId, { onDelete: "cascade" }),
    bookingDate: text("bookingDate")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    taxAmount: numeric("taxAmount").notNull(),
    totalAmount: numeric("totalAmount").notNull(),
    bookingStatus: text("bookingStatus", { length: 20 }).notNull(),
  },
  (table) => [
    index("booking_user_id_idx").on(table.userId),
    index("booking_showtime_id_idx").on(table.showtimeId),
  ],
);

export const bookingSeats = sqliteTable(
  "Booking_Seat",
  {
    bookingId: text("BookingID")
      .notNull()
      .references(() => bookings.bookingId, { onDelete: "cascade" }),
    seatId: integer("SeatID")
      .notNull()
      .references(() => seats.seatId, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.bookingId, table.seatId] }),
    index("booking_seat_seat_id_idx").on(table.seatId),
  ],
);

export const snacks = sqliteTable("Snack", {
  snackId: integer("SnackID").primaryKey({ autoIncrement: true }),
  snackName: text("snackName", { length: 100 }).notNull(),
  category: text("category", { length: 50 }).notNull(),
  price: numeric("price").notNull(),
  imageUrl: text("imageURL", { length: 255 }).notNull(),
});

export const fnbOrders = sqliteTable(
  "FNB_Order",
  {
    fnbOrderId: text("FNBOrderID")
      .primaryKey()
      .default(sql`lower(hex(randomblob(16)))`),
    userId: integer("UserID")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    orderDate: text("orderDate")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    taxAmount: numeric("taxAmount").notNull(),
    totalAmount: numeric("totalAmount").notNull(),
    orderStatus: text("orderStatus", { length: 20 }).notNull(),
  },
  (table) => [index("fnb_order_user_id_idx").on(table.userId)],
);

export const fnbOrderItems = sqliteTable(
  "FNB_Order_Item",
  {
    fnbOrderId: text("FNBOrderID")
      .notNull()
      .references(() => fnbOrders.fnbOrderId, { onDelete: "cascade" }),
    snackId: integer("snackID")
      .notNull()
      .references(() => snacks.snackId, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    subTotalPrice: numeric("subTotalPrice").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.fnbOrderId, table.snackId] }),
    index("fnb_order_item_snack_id_idx").on(table.snackId),
  ],
);

export const payments = sqliteTable("Payment", {
  paymentId: integer("PaymentID").primaryKey({ autoIncrement: true }),
  bookingId: text("BookingID")
    .unique()
    .references(() => bookings.bookingId, { onDelete: "cascade" }),
  fnbOrderId: text("FNBOrderID")
    .unique()
    .references(() => fnbOrders.fnbOrderId, { onDelete: "cascade" }),
  paymentMethod: text("paymentMethod", { length: 100 }).notNull(),
  amount: numeric("amount").notNull(),
  paymentDate: text("paymentDate")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  paymentStatus: text("paymentStatus", { length: 20 }).notNull(),
});

/**
 * Relations
 */

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  fnbOrders: many(fnbOrders),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  showtimes: many(showtimes),
}));

export const cinemaHallsRelations = relations(cinemaHalls, ({ many }) => ({
  showtimes: many(showtimes),
  seats: many(seats),
}));

export const showtimesRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, {
    fields: [showtimes.movieId],
    references: [movies.movieId],
  }),
  hall: one(cinemaHalls, {
    fields: [showtimes.hallId],
    references: [cinemaHalls.hallId],
  }),
  bookings: many(bookings),
}));

export const seatsRelations = relations(seats, ({ one, many }) => ({
  hall: one(cinemaHalls, {
    fields: [seats.hallId],
    references: [cinemaHalls.hallId],
  }),
  bookingSeats: many(bookingSeats),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.userId],
  }),
  showtime: one(showtimes, {
    fields: [bookings.showtimeId],
    references: [showtimes.showtimeId],
  }),
  payment: one(payments),
  bookingSeats: many(bookingSeats),
}));

export const bookingSeatsRelations = relations(bookingSeats, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingSeats.bookingId],
    references: [bookings.bookingId],
  }),
  seat: one(seats, {
    fields: [bookingSeats.seatId],
    references: [seats.seatId],
  }),
}));

export const snacksRelations = relations(snacks, ({ many }) => ({
  orderItems: many(fnbOrderItems),
}));

export const fnbOrdersRelations = relations(fnbOrders, ({ one, many }) => ({
  user: one(users, {
    fields: [fnbOrders.userId],
    references: [users.userId],
  }),
  orderItems: many(fnbOrderItems),
  payment: one(payments),
}));

export const fnbOrderItemsRelations = relations(fnbOrderItems, ({ one }) => ({
  fnbOrder: one(fnbOrders, {
    fields: [fnbOrderItems.fnbOrderId],
    references: [fnbOrders.fnbOrderId],
  }),
  snack: one(snacks, {
    fields: [fnbOrderItems.snackId],
    references: [snacks.snackId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.bookingId],
  }),
  fnbOrder: one(fnbOrders, {
    fields: [payments.fnbOrderId],
    references: [fnbOrders.fnbOrderId],
  }),
}));
