import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const admins = mysqlTable('Admin', {
  adminId: int('AdminID').primaryKey().autoincrement(),
  username: varchar('username', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  refreshTokenHash: varchar('refreshTokenHash', { length: 255 }),
});
