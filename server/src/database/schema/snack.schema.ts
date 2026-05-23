import { integer, numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const snacks = sqliteTable('Snack', {
  snackId: integer('SnackID').primaryKey({ autoIncrement: true }),
  snackName: text('snackName', { length: 100 }).notNull(),
  category: text('category', { length: 50 }).notNull(),
  price: numeric('price').notNull(),
  imageUrl: text('imageURL', { length: 255 }).notNull(),
});
