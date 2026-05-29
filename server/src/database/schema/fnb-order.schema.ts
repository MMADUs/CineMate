import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { fnbOrderItems } from './fnb-order-item.schema';
import { payments } from './payment.schema';
import { showtimes } from './showtime.schema';
import { users } from './user.schema';

export const fnbOrders = mysqlTable(
  'FNB_Order',
  {
    fnbOrderId: varchar('FNBOrderID', { length: 36 }).primaryKey(),
    userId: varchar('UserID', { length: 36 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    showtimeId: int('ShowtimeID').references(() => showtimes.showtimeId, {
      onDelete: 'set null',
    }),
    orderDate: timestamp('orderDate', { mode: 'string' })
      .notNull()
      .defaultNow(),
    taxAmount: decimal('taxAmount', { precision: 12, scale: 2 }).notNull(),
    totalAmount: decimal('totalAmount', { precision: 12, scale: 2 }).notNull(),
    orderStatus: varchar('orderStatus', { length: 30 })
      .notNull()
      .default('PendingPayment'),
  },
  (table) => [
    index('fnb_order_user_id_idx').on(table.userId),
    index('fnb_order_showtime_id_idx').on(table.showtimeId),
  ],
);

export const fnbOrdersRelations = relations(fnbOrders, ({ one, many }) => ({
  user: one(users, { fields: [fnbOrders.userId], references: [users.userId] }),
  showtime: one(showtimes, {
    fields: [fnbOrders.showtimeId],
    references: [showtimes.showtimeId],
  }),
  items: many(fnbOrderItems),
  payment: one(payments),
}));
