import { relations } from 'drizzle-orm';
import { int, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';
import { showtimes } from './showtime.schema';

export const movies = mysqlTable('Movie', {
  movieId: int('MovieID').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  genre: varchar('genre', { length: 100 }).notNull(),
  ageRate: varchar('AgeRate', { length: 10 }).notNull(),
  durationMinutes: int('DurationMinutes').notNull(),
  imageKey: varchar('image_key', { length: 255 }).notNull(),
  trailerUrl: varchar('TrailerURL', { length: 255 }).notNull(),
  releaseDate: varchar('releaseDate', { length: 10 }).notNull(),
  endDate: varchar('endDate', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
});

export const moviesRelations = relations(movies, ({ many }) => ({
  showtimes: many(showtimes),
}));
