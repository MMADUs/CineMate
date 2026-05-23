import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('User', {
  userId: integer('UserID').primaryKey({ autoIncrement: true }),
  fullName: text('FullName', { length: 50 }).notNull(),
  email: text('Email', { length: 100 }).notNull().unique(),
  phoneNum: text('PhoneNum', { length: 20 }).notNull(),
  password: text('Password', { length: 255 }).notNull(),
  refreshTokenHash: text('refreshTokenHash'),
  createdAt: text('createdAt')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
