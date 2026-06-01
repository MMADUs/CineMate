import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { bookings } from './booking.schema';
import { fnbOrderItems } from './fnb-order-item.schema';
import { payments } from './payment.schema';
import { users } from './user.schema';

export const fnbOrders = mysqlTable(
  'FNB_Order',
  {
    fnbOrderId: varchar('FNBOrderID', { length: 36 }).primaryKey(),
    userId: varchar('UserID', { length: 36 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    bookingId: varchar('BookingID', { length: 36 }).references(
      () => bookings.bookingId,
      {
        onDelete: 'set null',
      },
    ),
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
    index('fnb_order_booking_id_idx').on(table.bookingId),
  ],
);

export const fnbOrdersRelations = relations(fnbOrders, ({ one, many }) => ({
  user: one(users, { fields: [fnbOrders.userId], references: [users.userId] }),
  booking: one(bookings, {
    fields: [fnbOrders.bookingId],
    references: [bookings.bookingId],
  }),
  items: many(fnbOrderItems),
  payment: one(payments),
}));
