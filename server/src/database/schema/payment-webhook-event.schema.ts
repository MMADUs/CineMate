import {
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { payments } from './payment.schema';

export const paymentWebhookEvents = mysqlTable(
  'PaymentWebhookEvent',
  {
    eventId: int('EventID').primaryKey().autoincrement(),
    paymentId: int('PaymentID').references(() => payments.paymentId, {
      onDelete: 'set null',
    }),
    provider: varchar('provider', { length: 50 }).notNull().default('XENDIT'),
    providerEventId: varchar('providerEventId', { length: 255 }).notNull(),
    eventType: varchar('eventType', { length: 100 }).notNull(),
    payload: text('payload').notNull(),
    receivedAt: timestamp('receivedAt', { mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('payment_webhook_event_payment_id_idx').on(table.paymentId),
    index('payment_webhook_event_provider_event_idx').on(
      table.provider,
      table.providerEventId,
    ),
  ],
);
