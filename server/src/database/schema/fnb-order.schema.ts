import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  numeric,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import { users } from './user.schema';

export const fnbOrders = sqliteTable(
  'FNB_Order',
  {
    fnbOrderId: text('FNBOrderID').primaryKey(),
    userId: integer('UserID')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    orderDate: text('orderDate')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    taxAmount: numeric('taxAmount').notNull(),
    totalAmount: numeric('totalAmount').notNull(),
    orderStatus: text('orderStatus', { length: 20 })
      .notNull()
      .default('Pending'),
  },
  (table) => [index('fnb_order_user_id_idx').on(table.userId)],
);
