import { int, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';

export const movies = mysqlTable('Movie', {
  movieId: int('MovieID').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  genre: varchar('genre', { length: 100 }).notNull(),
  ageRate: varchar('AgeRate', { length: 10 }).notNull(),
  durationMinutes: int('DurationMinutes').notNull(),
  posterUrl: varchar('PosterURL', { length: 255 }).notNull(),
  trailerUrl: varchar('TrailerURL', { length: 255 }).notNull(),
  releaseDate: varchar('releaseDate', { length: 10 }).notNull(),
  endDate: varchar('endDate', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
});
