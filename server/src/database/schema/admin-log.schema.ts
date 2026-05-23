import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { admins } from './admin.schema';

export const adminLogs = sqliteTable(
  'AdminLog',
  {
    logId: integer('LogID').primaryKey({ autoIncrement: true }),
    adminId: integer('AdminID')
      .notNull()
      .references(() => admins.adminId, { onDelete: 'cascade' }),
    action: text('action', { length: 100 }).notNull(),
    entity: text('entity', { length: 50 }).notNull(),
    entityId: text('entityId').notNull(),
    details: text('details'),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index('admin_log_admin_id_idx').on(table.adminId)],
);
