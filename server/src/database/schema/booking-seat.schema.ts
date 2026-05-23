import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import { bookings } from './booking.schema';
import { seats } from './seat.schema';

export const bookingSeats = sqliteTable(
  'Booking_Seat',
  {
    bookingId: text('BookingID')
      .notNull()
      .references(() => bookings.bookingId, { onDelete: 'cascade' }),
    seatId: integer('SeatID')
      .notNull()
      .references(() => seats.seatId, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.bookingId, table.seatId] }),
    index('booking_seat_seat_id_idx').on(table.seatId),
  ],
);
