import { int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('User', {
  userId: int('UserID').primaryKey().autoincrement(),
  fullName: varchar('FullName', { length: 50 }).notNull(),
  email: varchar('Email', { length: 100 }).notNull().unique(),
  phoneNum: varchar('PhoneNum', { length: 20 }).notNull(),
  password: varchar('Password', { length: 255 }).notNull(),
  refreshTokenHash: varchar('refreshTokenHash', { length: 255 }),
  createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
});
