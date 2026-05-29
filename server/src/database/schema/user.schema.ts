import { relations } from 'drizzle-orm';
import { mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { bookings } from './booking.schema';
import { fnbOrders } from './fnb-order.schema';

export const users = mysqlTable('User', {
  userId: varchar('UserID', { length: 36 }).primaryKey(),
  fullName: varchar('FullName', { length: 50 }).notNull(),
  email: varchar('Email', { length: 100 }).notNull().unique(),
  phoneNum: varchar('PhoneNum', { length: 20 }),
  password: varchar('Password', { length: 255 }),
  authProvider: varchar('authProvider', { length: 20 })
    .notNull()
    .default('LOCAL'),
  googleId: varchar('googleId', { length: 100 }).unique(),
  avatarUrl: varchar('avatarUrl', { length: 255 }),
  refreshTokenHash: varchar('refreshTokenHash', { length: 255 }),
  createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  fnbOrders: many(fnbOrders),
}));
