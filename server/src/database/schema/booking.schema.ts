import {
  decimal,
  index,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { showtimes } from './showtime.schema';
import { users } from './user.schema';

export const bookings = mysqlTable(
  'Booking',
  {
    bookingId: varchar('BookingID', { length: 36 }).primaryKey(),
    userId: int('UserID')
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
    bookingStatus: varchar('bookingStatus', { length: 20 })
      .notNull()
      .default('Pending'),
  },
  (table) => [
    index('booking_user_id_idx').on(table.userId),
    index('booking_showtime_id_idx').on(table.showtimeId),
  ],
);
