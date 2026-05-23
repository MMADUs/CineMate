import {
  index,
  integer,
  numeric,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import { fnbOrders } from './fnb-order.schema';
import { snacks } from './snack.schema';

export const fnbOrderItems = sqliteTable(
  'FNB_Order_Item',
  {
    fnbOrderId: text('FNBOrderID')
      .notNull()
      .references(() => fnbOrders.fnbOrderId, { onDelete: 'cascade' }),
    snackId: integer('snackID')
      .notNull()
      .references(() => snacks.snackId, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    subTotalPrice: numeric('subTotalPrice').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.fnbOrderId, table.snackId] }),
    index('fnb_order_item_snack_id_idx').on(table.snackId),
  ],
);
