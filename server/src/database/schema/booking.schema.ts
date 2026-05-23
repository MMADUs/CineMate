import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  numeric,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import { showtimes } from './showtime.schema';
import { users } from './user.schema';

export const bookings = sqliteTable(
  'Booking',
  {
    bookingId: text('BookingID').primaryKey(),
    userId: integer('UserID')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    showtimeId: integer('ShowtimeID')
      .notNull()
      .references(() => showtimes.showtimeId, { onDelete: 'cascade' }),
    bookingDate: text('bookingDate')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    taxAmount: numeric('taxAmount').notNull(),
    totalAmount: numeric('totalAmount').notNull(),
    bookingStatus: text('bookingStatus', { length: 20 })
      .notNull()
      .default('Pending'),
  },
  (table) => [
    index('booking_user_id_idx').on(table.userId),
    index('booking_showtime_id_idx').on(table.showtimeId),
  ],
);
