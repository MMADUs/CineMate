import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  numeric,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import { bookings } from './booking.schema';
import { fnbOrders } from './fnb-order.schema';

export const payments = sqliteTable(
  'Payment',
  {
    paymentId: integer('PaymentID').primaryKey({ autoIncrement: true }),
    bookingId: text('BookingID')
      .unique()
      .references(() => bookings.bookingId, { onDelete: 'cascade' }),
    fnbOrderId: text('FNBOrderID')
      .unique()
      .references(() => fnbOrders.fnbOrderId, { onDelete: 'cascade' }),
    provider: text('provider', { length: 50 }).notNull().default('XENDIT'),
    providerPaymentId: text('providerPaymentId', { length: 100 }),
    externalId: text('externalId', { length: 100 }).notNull().unique(),
    invoiceUrl: text('invoiceUrl'),
    paymentMethod: text('paymentMethod', { length: 100 }).notNull(),
    amount: numeric('amount').notNull(),
    currency: text('currency', { length: 3 }).notNull().default('IDR'),
    paymentDate: text('paymentDate')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    paymentStatus: text('paymentStatus', { length: 20 })
      .notNull()
      .default('Pending'),
    paidAt: text('paidAt'),
    expiresAt: text('expiresAt'),
    failureReason: text('failureReason'),
  },
  (table) => [
    index('payment_external_id_idx').on(table.externalId),
    index('payment_provider_payment_id_idx').on(table.providerPaymentId),
  ],
);
