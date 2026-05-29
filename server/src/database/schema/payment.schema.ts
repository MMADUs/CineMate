import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { bookings } from './booking.schema';
import { fnbOrders } from './fnb-order.schema';

export const payments = mysqlTable(
  'Payment',
  {
    paymentId: int('PaymentID').primaryKey().autoincrement(),
    bookingId: varchar('BookingID', { length: 36 })
      .unique()
      .references(() => bookings.bookingId, { onDelete: 'cascade' }),
    fnbOrderId: varchar('FNBOrderID', { length: 36 })
      .unique()
      .references(() => fnbOrders.fnbOrderId, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 50 }).notNull().default('XENDIT'),
    providerPaymentId: varchar('providerPaymentId', { length: 100 }),
    externalId: varchar('externalId', { length: 100 }).notNull().unique(),
    invoiceUrl: text('invoiceUrl'),
    paymentMethod: varchar('paymentMethod', { length: 100 }).notNull(),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('IDR'),
    paymentDate: timestamp('paymentDate', { mode: 'string' })
      .notNull()
      .defaultNow(),
    paymentStatus: varchar('paymentStatus', { length: 20 })
      .notNull()
      .default('Pending'),
    paidAt: varchar('paidAt', { length: 50 }),
    expiresAt: varchar('expiresAt', { length: 50 }),
    failureReason: text('failureReason'),
  },
  (table) => [
    index('payment_external_id_idx').on(table.externalId),
    index('payment_provider_payment_id_idx').on(table.providerPaymentId),
  ],
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.bookingId],
  }),
  fnbOrder: one(fnbOrders, {
    fields: [payments.fnbOrderId],
    references: [fnbOrders.fnbOrderId],
  }),
}));
