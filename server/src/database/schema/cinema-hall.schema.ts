import { relations } from 'drizzle-orm';
import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { seats } from './seat.schema';
import { showtimes } from './showtime.schema';

export const cinemaHalls = mysqlTable('CinemaHall', {
  hallId: int('HallID').primaryKey().autoincrement(),
  cinemaName: varchar('CinemaName', { length: 100 }).notNull(),
  studioName: varchar('StudioName', { length: 50 }).notNull(),
  totalRows: int('totalRows').notNull(),
  seatsPerRow: int('seatsPerRow').notNull(),
});

export const cinemaHallsRelations = relations(cinemaHalls, ({ many }) => ({
  seats: many(seats),
  showtimes: many(showtimes),
}));
