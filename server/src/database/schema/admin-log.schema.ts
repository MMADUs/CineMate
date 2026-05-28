import {
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { admins } from './admin.schema';

export const adminLogs = mysqlTable(
  'AdminLog',
  {
    logId: int('LogID').primaryKey().autoincrement(),
    adminId: int('AdminID')
      .notNull()
      .references(() => admins.adminId, { onDelete: 'cascade' }),
    action: varchar('action', { length: 100 }).notNull(),
    entity: varchar('entity', { length: 50 }).notNull(),
    entityId: varchar('entityId', { length: 100 }).notNull(),
    details: text('details'),
    createdAt: timestamp('createdAt', { mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('admin_log_admin_id_idx').on(table.adminId)],
);
