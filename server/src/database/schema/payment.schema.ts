import { sql } from 'drizzle-orm';
import { integer, numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bookings } from './booking.schema';
import { fnbOrders } from './fnb-order.schema';

export const payments = sqliteTable('Payment', {
  paymentId: integer('PaymentID').primaryKey({ autoIncrement: true }),
  bookingId: text('BookingID')
    .unique()
    .references(() => bookings.bookingId, { onDelete: 'cascade' }),
  fnbOrderId: text('FNBOrderID')
    .unique()
    .references(() => fnbOrders.fnbOrderId, { onDelete: 'cascade' }),
  paymentMethod: text('paymentMethod', { length: 100 }).notNull(),
  amount: numeric('amount').notNull(),
  paymentDate: text('paymentDate')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  paymentStatus: text('paymentStatus', { length: 20 })
    .notNull()
    .default('Pending'),
});
