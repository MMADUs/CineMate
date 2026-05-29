import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { bookingSeats } from './booking-seat.schema';
import { payments } from './payment.schema';
import { showtimes } from './showtime.schema';
import { users } from './user.schema';

export const bookings = mysqlTable(
  'Booking',
  {
    bookingId: varchar('BookingID', { length: 36 }).primaryKey(),
    userId: varchar('UserID', { length: 36 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    showtimeId: int('ShowtimeID')
      .notNull()
      .references(() => showtimes.showtimeId, { onDelete: 'cascade' }),
    bookingDate: timestamp('bookingDate', { mode: 'string' })
      .notNull()
      .defaultNow(),
    taxAmount: decimal('taxAmount', { precision: 12, scale: 2 }).notNull(),
    totalAmount: decimal('totalAmount', { precision: 12, scale: 2 }).notNull(),
    orderStatus: varchar('orderStatus', { length: 30 })
      .notNull()
      .default('PendingPayment'),
  },
  (table) => [
    index('booking_user_id_idx').on(table.userId),
    index('booking_showtime_id_idx').on(table.showtimeId),
  ],
);

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.userId] }),
  showtime: one(showtimes, {
    fields: [bookings.showtimeId],
    references: [showtimes.showtimeId],
  }),
  seats: many(bookingSeats),
  payment: one(payments),
}));
