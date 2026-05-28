import {
  index,
  int,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';
import { cinemaHalls } from './cinema-hall.schema';

export const seats = mysqlTable(
  'Seat',
  {
    seatId: int('SeatID').primaryKey().autoincrement(),
    hallId: int('HallID')
      .notNull()
      .references(() => cinemaHalls.hallId, { onDelete: 'cascade' }),
    rowLetter: varchar('rowLetter', { length: 1 }).notNull(),
    seatNumber: int('SeatNumber').notNull(),
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
