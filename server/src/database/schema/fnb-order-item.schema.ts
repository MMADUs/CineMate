import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from 'drizzle-orm/mysql-core';
import { fnbOrders } from './fnb-order.schema';
import { snacks } from './snack.schema';

export const fnbOrderItems = mysqlTable(
  'FNB_Order_Item',
  {
    fnbOrderId: varchar('FNBOrderID', { length: 36 })
      .notNull()
      .references(() => fnbOrders.fnbOrderId, { onDelete: 'cascade' }),
    snackId: int('snackID')
      .notNull()
      .references(() => snacks.snackId, { onDelete: 'cascade' }),
    quantity: int('quantity').notNull(),
    subTotalPrice: decimal('subTotalPrice', {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.fnbOrderId, table.snackId] }),
    index('fnb_order_item_snack_id_idx').on(table.snackId),
  ],
);

export const fnbOrderItemsRelations = relations(fnbOrderItems, ({ one }) => ({
  order: one(fnbOrders, {
    fields: [fnbOrderItems.fnbOrderId],
    references: [fnbOrders.fnbOrderId],
  }),
  snack: one(snacks, {
    fields: [fnbOrderItems.snackId],
    references: [snacks.snackId],
  }),
}));
