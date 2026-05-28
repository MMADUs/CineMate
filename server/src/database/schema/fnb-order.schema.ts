import {
  decimal,
  index,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { users } from './user.schema';

export const fnbOrders = mysqlTable(
  'FNB_Order',
  {
    fnbOrderId: varchar('FNBOrderID', { length: 36 }).primaryKey(),
    userId: int('UserID')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    orderDate: timestamp('orderDate', { mode: 'string' })
      .notNull()
      .defaultNow(),
    taxAmount: decimal('taxAmount', { precision: 12, scale: 2 }).notNull(),
    totalAmount: decimal('totalAmount', { precision: 12, scale: 2 }).notNull(),
    orderStatus: varchar('orderStatus', { length: 20 })
      .notNull()
      .default('Pending'),
  },
  (table) => [index('fnb_order_user_id_idx').on(table.userId)],
);
