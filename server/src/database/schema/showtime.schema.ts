import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  int,
  mysqlTable,
  varchar,
} from 'drizzle-orm/mysql-core';
import { cinemaHalls } from './cinema-hall.schema';
import { bookings } from './booking.schema';
import { movies } from './movie.schema';

export const showtimes = mysqlTable(
  'Showtime',
  {
    showtimeId: int('ShowtimeID').primaryKey().autoincrement(),
    movieId: int('MovieID')
      .notNull()
      .references(() => movies.movieId, { onDelete: 'cascade' }),
    hallId: int('HallID')
      .notNull()
      .references(() => cinemaHalls.hallId, { onDelete: 'cascade' }),
    showDate: varchar('showDate', { length: 10 }).notNull(),
    showTime: varchar('showTime', { length: 5 }).notNull(),
    price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [
    index('showtime_movie_id_idx').on(table.movieId),
    index('showtime_hall_id_idx').on(table.hallId),
  ],
);

export const showtimesRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, {
    fields: [showtimes.movieId],
    references: [movies.movieId],
  }),
  hall: one(cinemaHalls, {
    fields: [showtimes.hallId],
    references: [cinemaHalls.hallId],
  }),
  bookings: many(bookings),
}));
