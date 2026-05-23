import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const cinemaHalls = sqliteTable('CinemaHall', {
  hallId: integer('HallID').primaryKey({ autoIncrement: true }),
  cinemaName: text('CinemaName', { length: 100 }).notNull(),
  studioName: text('StudioName', { length: 50 }).notNull(),
  totalRows: integer('totalRows').notNull(),
  seatsPerRow: integer('seatsPerRow').notNull(),
});
