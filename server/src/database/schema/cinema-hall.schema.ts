import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const cinemaHalls = mysqlTable('CinemaHall', {
  hallId: int('HallID').primaryKey().autoincrement(),
  cinemaName: varchar('CinemaName', { length: 100 }).notNull(),
  studioName: varchar('StudioName', { length: 50 }).notNull(),
  totalRows: int('totalRows').notNull(),
  seatsPerRow: int('seatsPerRow').notNull(),
});
