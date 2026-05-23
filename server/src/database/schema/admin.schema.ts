import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const admins = sqliteTable('Admin', {
  adminId: integer('AdminID').primaryKey({ autoIncrement: true }),
  username: text('username', { length: 100 }).notNull(),
  email: text('email', { length: 100 }).notNull().unique(),
  password: text('password', { length: 255 }).notNull(),
  refreshTokenHash: text('refreshTokenHash'),
});
