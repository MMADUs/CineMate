import { relations } from 'drizzle-orm';
import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { studios } from './studio.schema';

export const cinemas = mysqlTable('Cinema', {
  cinemaId: int('CinemaID').primaryKey().autoincrement(),
  cinemaName: varchar('CinemaName', { length: 100 }).notNull(),
  location: varchar('Location', { length: 255 }).notNull(),
});

export const cinemasRelations = relations(cinemas, ({ many }) => ({
  studios: many(studios),
}));
