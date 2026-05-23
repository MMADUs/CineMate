import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { cinemaHalls } from './cinema-hall.schema';

export const seats = sqliteTable(
  'Seat',
  {
    seatId: integer('SeatID').primaryKey({ autoIncrement: true }),
    hallId: integer('HallID')
      .notNull()
      .references(() => cinemaHalls.hallId, { onDelete: 'cascade' }),
    rowLetter: text('rowLetter', { length: 1 }).notNull(),
    seatNumber: integer('SeatNumber').notNull(),
  },
  (table) => [
    uniqueIndex('seat_hall_row_number_unique').on(
      table.hallId,
      table.rowLetter,
      table.seatNumber,
    ),
    index('seat_hall_id_idx').on(table.hallId),
  ],
);
