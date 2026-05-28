import {
  index,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from 'drizzle-orm/mysql-core';
import { bookings } from './booking.schema';
import { seats } from './seat.schema';

export const bookingSeats = mysqlTable(
  'Booking_Seat',
  {
    bookingId: varchar('BookingID', { length: 36 })
      .notNull()
      .references(() => bookings.bookingId, { onDelete: 'cascade' }),
    seatId: int('SeatID')
      .notNull()
      .references(() => seats.seatId, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.bookingId, table.seatId] }),
    index('booking_seat_seat_id_idx').on(table.seatId),
  ],
);
