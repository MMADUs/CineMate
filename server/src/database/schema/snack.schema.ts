import { decimal, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const snacks = mysqlTable('Snack', {
  snackId: int('SnackID').primaryKey().autoincrement(),
  snackName: varchar('snackName', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  imageUrl: varchar('imageURL', { length: 255 }).notNull(),
});
