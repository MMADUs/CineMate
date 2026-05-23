import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { payments } from './payment.schema';

export const paymentWebhookEvents = sqliteTable(
  'PaymentWebhookEvent',
  {
    eventId: integer('EventID').primaryKey({ autoIncrement: true }),
    paymentId: integer('PaymentID').references(() => payments.paymentId, {
      onDelete: 'set null',
    }),
    provider: text('provider', { length: 50 }).notNull().default('XENDIT'),
    providerEventId: text('providerEventId', { length: 255 }).notNull(),
    eventType: text('eventType', { length: 100 }).notNull(),
    payload: text('payload').notNull(),
    receivedAt: text('receivedAt')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('payment_webhook_event_payment_id_idx').on(table.paymentId),
    index('payment_webhook_event_provider_event_idx').on(
      table.provider,
      table.providerEventId,
    ),
  ],
);
