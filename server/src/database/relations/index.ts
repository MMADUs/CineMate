import { relations } from 'drizzle-orm';
import {
  adminLogs,
  admins,
  bookingSeats,
  bookings,
  cinemaHalls,
  fnbOrderItems,
  fnbOrders,
  movies,
  payments,
  seats,
  showtimes,
  snacks,
  users,
} from '../schema';

export const adminsRelations = relations(admins, ({ many }) => ({
  logs: many(adminLogs),
}));
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  fnbOrders: many(fnbOrders),
}));
export const moviesRelations = relations(movies, ({ many }) => ({
  showtimes: many(showtimes),
}));
export const cinemaHallsRelations = relations(cinemaHalls, ({ many }) => ({
  seats: many(seats),
  showtimes: many(showtimes),
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
  user: one(users, { fields: [bookings.userId], references: [users.userId] }),
  showtime: one(showtimes, {
    fields: [bookings.showtimeId],
    references: [showtimes.showtimeId],
  }),
  seats: many(bookingSeats),
  payment: one(payments),
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
  user: one(users, { fields: [fnbOrders.userId], references: [users.userId] }),
  items: many(fnbOrderItems),
  payment: one(payments),
}));
export const fnbOrderItemsRelations = relations(fnbOrderItems, ({ one }) => ({
  order: one(fnbOrders, {
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
export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(admins, {
    fields: [adminLogs.adminId],
    references: [admins.adminId],
  }),
}));
