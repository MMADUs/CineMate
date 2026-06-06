import { relations } from 'drizzle-orm';
import {
  index,
  int,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';
import { studios } from './studio.schema';
import { bookingSeats } from './booking-seat.schema';

export const seats = mysqlTable(
  'Seat',
  {
    seatId: int('SeatID').primaryKey().autoincrement(),
    studioId: int('StudioID')
      .notNull()
      .references(() => studios.studioId, { onDelete: 'cascade' }),
    rowLetter: varchar('rowLetter', { length: 1 }).notNull(),
    seatNumber: int('SeatNumber').notNull(),
  },
  (table) => [
    uniqueIndex('seat_studio_row_number_unique').on(
      table.studioId,
      table.rowLetter,
      table.seatNumber,
    ),
    index('seat_studio_id_idx').on(table.studioId),
  ],
);

export const seatsRelations = relations(seats, ({ one, many }) => ({
  studio: one(studios, {
    fields: [seats.studioId],
    references: [studios.studioId],
  }),
  bookingSeats: many(bookingSeats),
}));
