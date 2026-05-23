import {
  index,
  integer,
  numeric,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import { cinemaHalls } from './cinema-hall.schema';
import { movies } from './movie.schema';

export const showtimes = sqliteTable(
  'Showtime',
  {
    showtimeId: integer('ShowtimeID').primaryKey({ autoIncrement: true }),
    movieId: integer('MovieID')
      .notNull()
      .references(() => movies.movieId, { onDelete: 'cascade' }),
    hallId: integer('HallID')
      .notNull()
      .references(() => cinemaHalls.hallId, { onDelete: 'cascade' }),
    showDate: text('showDate').notNull(),
    showTime: text('showTime').notNull(),
    price: numeric('price').notNull(),
  },
  (table) => [
    index('showtime_movie_id_idx').on(table.movieId),
    index('showtime_hall_id_idx').on(table.hallId),
  ],
);
