import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const movies = sqliteTable('Movie', {
  movieId: integer('MovieID').primaryKey({ autoIncrement: true }),
  title: text('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  genre: text('genre', { length: 100 }).notNull(),
  ageRate: text('AgeRate', { length: 10 }).notNull(),
  durationMinutes: integer('DurationMinutes').notNull(),
  posterUrl: text('PosterURL', { length: 255 }).notNull(),
  trailerUrl: text('TrailerURL', { length: 255 }).notNull(),
  releaseDate: text('releaseDate').notNull(),
  endDate: text('endDate').notNull(),
  status: text('status', { length: 20 }).notNull(),
});
