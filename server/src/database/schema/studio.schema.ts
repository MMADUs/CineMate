import { relations } from 'drizzle-orm';
import { int, mysqlTable, varchar, index } from 'drizzle-orm/mysql-core';
import { cinemas } from './cinema.schema';
import { seats } from './seat.schema';
import { showtimes } from './showtime.schema';

export const studios = mysqlTable(
  'Studio',
  {
    studioId: int('StudioID').primaryKey().autoincrement(),
    cinemaId: int('CinemaID')
      .notNull()
      .references(() => cinemas.cinemaId, { onDelete: 'cascade' }),
    studioName: varchar('StudioName', { length: 50 }).notNull(),
    totalRows: int('totalRows').notNull(),
    seatsPerRow: int('seatsPerRow').notNull(),
  },
  (table) => [index('studio_cinema_id_idx').on(table.cinemaId)],
);

export const studiosRelations = relations(studios, ({ one, many }) => ({
  cinema: one(cinemas, {
    fields: [studios.cinemaId],
    references: [cinemas.cinemaId],
  }),
  seats: many(seats),
  showtimes: many(showtimes),
}));
