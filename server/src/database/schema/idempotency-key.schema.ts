import {
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

export const idempotencyKeys = mysqlTable(
  'IdempotencyKey',
  {
    idempotencyKeyId: int('IdempotencyKeyID').primaryKey().autoincrement(),
    key: varchar('idempotencyKey', { length: 255 }).notNull(),
    scope: varchar('scope', { length: 100 }).notNull(),
    method: varchar('method', { length: 10 }).notNull(),
    route: varchar('route', { length: 255 }).notNull(),
    requestHash: varchar('requestHash', { length: 64 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('PROCESSING'),
    responseStatus: int('responseStatus'),
    responseBody: text('responseBody'),
    lockedUntil: timestamp('lockedUntil', { mode: 'string' }),
    expiresAt: timestamp('expiresAt', { mode: 'string' }).notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    scopeKeyUnique: uniqueIndex('idempotency_key_scope_key_unique').on(
      table.scope,
      table.key,
    ),
    expiresAtIdx: index('idempotency_key_expires_at_idx').on(table.expiresAt),
  }),
);
