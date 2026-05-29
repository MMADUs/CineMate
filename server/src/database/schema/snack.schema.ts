import { relations } from 'drizzle-orm';
import { decimal, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { fnbOrderItems } from './fnb-order-item.schema';

export const snacks = mysqlTable('Snack', {
  snackId: int('SnackID').primaryKey().autoincrement(),
  snackName: varchar('snackName', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  stock: int('stock').notNull().default(0),
  imageKey: varchar('image_key', { length: 255 }).notNull(),
});

export const snacksRelations = relations(snacks, ({ many }) => ({
  orderItems: many(fnbOrderItems),
}));
