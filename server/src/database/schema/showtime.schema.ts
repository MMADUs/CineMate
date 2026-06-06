import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  int,
  mysqlTable,
  varchar,
} from 'drizzle-orm/mysql-core';
import { studios } from './studio.schema';
import { bookings } from './booking.schema';
import { movies } from './movie.schema';

export const showtimes = mysqlTable(
  'Showtime',
  {
    showtimeId: int('ShowtimeID').primaryKey().autoincrement(),
    movieId: int('MovieID')
      .notNull()
      .references(() => movies.movieId, { onDelete: 'cascade' }),
    studioId: int('StudioID')
      .notNull()
      .references(() => studios.studioId, { onDelete: 'cascade' }),
    showDate: varchar('showDate', { length: 10 }).notNull(),
    showTime: varchar('showTime', { length: 5 }).notNull(),
    price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [
    index('showtime_movie_id_idx').on(table.movieId),
    index('showtime_studio_id_idx').on(table.studioId),
  ],
);

export const showtimesRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, {
    fields: [showtimes.movieId],
    references: [movies.movieId],
  }),
  studio: one(studios, {
    fields: [showtimes.studioId],
    references: [studios.studioId],
  }),
  bookings: many(bookings),
}));
