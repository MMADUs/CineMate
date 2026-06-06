# CineMate Server — Project Implementation Guide

> **Audience:** Junior developers who will implement this backend from scratch.
> **Stack:** NestJS 11 · TypeScript · SQLite · Drizzle ORM · JWT (Access + Refresh) · Passport

---

## Table of Contents

1. [Issues Found & Changes Made](#1-issues-found--changes-made)
2. [Architecture Overview](#2-architecture-overview)
3. [Folder Structure](#3-folder-structure)
4. [Environment Variables](#4-environment-variables)
5. [Database & Drizzle Setup](#5-database--drizzle-setup)
6. [Corrected Database Schema](#6-corrected-database-schema)
7. [Module Implementation Guide](#7-module-implementation-guide)
   - 7.1 [Database Module](#71-database-module)
   - 7.2 [Auth Module](#72-auth-module)
   - 7.3 [Users Module](#73-users-module)
   - 7.4 [Movies Module](#74-movies-module)
   - 7.5 [Cinema Halls Module](#75-cinema-halls-module)
   - 7.6 [Showtimes Module](#76-showtimes-module)
   - 7.7 [Bookings Module](#77-bookings-module)
   - 7.8 [Snacks Module](#78-snacks-module)
   - 7.9 [FNB Orders Module](#79-fnb-orders-module)
   - 7.10 [Payments Module](#710-payments-module)
   - 7.11 [Admin Module](#711-admin-module)
   - 7.12 [File Upload Module](#712-file-upload-module)
8. [Complete API Reference](#8-complete-api-reference)
9. [Guards, Decorators & Middleware](#9-guards-decorators--middleware)
10. [DTO Patterns & Validation](#10-dto-patterns--validation)
11. [Error Handling](#11-error-handling)
12. [Security & Rate Limiting](#12-security--rate-limiting)
13. [Testing Strategy](#13-testing-strategy)
14. [Setup & Run Instructions](#14-setup--run-instructions)
15. [NestJS Best Practices Checklist](#15-nestjs-best-practices-checklist)

---

## 1. Issues Found & Changes Made

The following inconsistencies and problems were identified across the three source documents (`initial_plan.md`, `api_requirement.md`, `schema.ts`) and have been corrected in this guide:

### 🔴 Critical Issues

| # | Issue | Where Found | Fix Applied |
|---|-------|-------------|-------------|
| 1 | **Prisma references in a Drizzle project** — Section 3.3 installs `@prisma/client` and runs `npx prisma init`, but the project uses Drizzle ORM | `initial_plan.md` §3.3 | Removed Prisma entirely. Replaced with proper Drizzle + `better-sqlite3` setup instructions. |
| 2 | **PostgreSQL connection string for an SQLite project** — `DATABASE_URL` is set to `postgresql://...` but the project explicitly uses SQLite | `initial_plan.md` §4 | Changed to a SQLite file path: `DATABASE_URL="./data/cinemate.db"` |
| 3 | **Missing `refreshTokenHash` column on `users` table** — The auth flow describes storing hashed refresh tokens in the DB, but the schema has no such column | `schema.ts` + `initial_plan.md` §8 | Added `refreshTokenHash text("refreshTokenHash")` (nullable) to the `users` table. |
| 4 | **No `createdAt` timestamp on `users` table** — Every user-facing entity should have creation timestamps for auditing | `schema.ts` | Added `createdAt` with `DEFAULT CURRENT_TIMESTAMP`. |
| 5 | **Payment table has BOTH `bookingId` and `fnbOrderId` as separate unique columns** — This means a single payment can only link to one booking OR one FNB order, but not both in the same row, and a booking + FNB combo checkout would need two payment rows | `schema.ts` | Kept as-is (one payment per order type). This is actually fine for separate checkout flows. Added clarifying note in the API. |

### 🟡 Moderate Issues

| # | Issue | Where Found | Fix Applied |
|---|-------|-------------|-------------|
| 6 | **Duplicate endpoints for user profile** — `GET /auth/me` and `GET /users/me` both exist, and `GET /api/users/profile` is also listed | `initial_plan.md` §10 + `api_requirement.md` §3 | Consolidated to `GET /api/users/profile` (returns full user data) and `GET /api/auth/me` (returns JWT payload only, lightweight). Removed `GET /users/me`. |
| 7 | **Login payload says `email / username`** but schema has no `username` field on `User` table | `api_requirement.md` §1 | Changed login payload to `email` + `password` only (matching the schema). |
| 8 | **Register payload uses `FullName`** (PascalCase) but login uses `email` (camelCase) — inconsistent DTO naming | `api_requirement.md` §1 | Standardized all DTO fields to **camelCase**: `fullName`, `email`, `phoneNum`, `password`. |
| 9 | **`POST /api/bookings` payload includes `taxAmount` and `totalAmount`** — The client should NOT calculate financial amounts; this must be server-side | `api_requirement.md` §3 | Removed `taxAmount` and `totalAmount` from the client payload. Backend will calculate these from seat count × showtime price + tax rate. |
| 10 | **`POST /api/fnb-orders` payload includes `subTotalPrice`, `taxAmount`, `totalAmount`** — Same issue, prices must be authoritative from the DB | `api_requirement.md` §3 | Client sends `items: [{ snackId, quantity }]` only. Backend looks up prices and calculates totals. |
| 11 | **No `bookingStatus` default value** — Schema requires `bookingStatus` but has no default | `schema.ts` | Added `.default("Pending")` for new bookings. |
| 12 | **No `orderStatus` default value** for FNB orders | `schema.ts` | Added `.default("Pending")`. |
| 13 | **No `paymentStatus` default value** for payments | `schema.ts` | Added `.default("Pending")`. |
| 14 | **Admin logs endpoint (`GET /api/admin/logs`)** has no backing table | `api_requirement.md` §5F | Added an `adminLogs` table to the schema. |

### 🟢 Minor Issues / Improvements

| # | Issue | Fix Applied |
|---|-------|-------------|
| 15 | `description` column is `varchar(255)` — too short for movie descriptions | Changed to unbounded `text()` (no length limit). |
| 16 | Schema column naming is inconsistent (mix of PascalCase DB names and camelCase) | Kept DB column names as-is (they match the ERD), but all TypeScript property names are camelCase. This is correct Drizzle pattern. |
| 17 | Seat lock API is commented out in Indonesian — unclear if needed | Made it a proper optional feature with clear implementation guidance. Marked as **Phase 2**. |
| 18 | `POST /api/admin/transactions/:bookingId/verify` is POST but should be PATCH (partial update) | Changed to `PATCH` for semantic correctness. |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Frontend)                  │
│                 (Next.js / React + Vite)                 │
└──────────────────────────┬──────────────────────────────┘
                           │  HTTP (REST + HttpOnly Cookies)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    NestJS Application                    │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ Helmet   │  │ CORS     │  │ Cookie Parser          │ │
│  │ (headers)│  │          │  │                        │ │
│  └──────────┘  └──────────┘  └────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Global ValidationPipe               │   │
│  │         (whitelist + transform + forbid)          │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │              ThrottlerGuard (Global)              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │                   Modules                        │    │
│  │  ┌──────┐ ┌──────┐ ┌────────┐ ┌──────────────┐  │    │
│  │  │ Auth │ │Movies│ │Bookings│ │   Admin       │  │    │
│  │  └──────┘ └──────┘ └────────┘ └──────────────┘  │    │
│  │  ┌──────┐ ┌──────┐ ┌────────┐ ┌──────────────┐  │    │
│  │  │Users │ │Halls │ │  FNB   │ │  Payments    │  │    │
│  │  └──────┘ └──────┘ └────────┘ └──────────────┘  │    │
│  │  ┌──────────┐ ┌───────────┐                      │    │
│  │  │Showtimes │ │FileUpload │                      │    │
│  │  └──────────┘ └───────────┘                      │    │
│  └─────────────────────────────────────────────────┘    │
│                           │                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Database Module (Drizzle)            │   │
│  │                    SQLite                         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

1. **One module per domain entity** — keeps responsibilities clear and modules testable in isolation.
2. **Global prefix `/api`** — set via `app.setGlobalPrefix('api')` in `main.ts`.
3. **Drizzle over Prisma** — lighter, SQL-first, better for SQLite prototyping.
4. **HttpOnly cookies for tokens** — NOT `localStorage`. Prevents XSS-based token theft.
5. **Separate Admin and User auth** — Admin has its own table and login flow. They are different entities.

---

## 3. Folder Structure

```
src/
├── main.ts                          # Bootstrap, global middleware
├── app.module.ts                    # Root module, imports all feature modules
│
├── common/                          # Shared utilities used across modules
│   ├── decorators/
│   │   ├── current-user.decorator.ts    # @CurrentUser() param decorator
│   │   ├── current-admin.decorator.ts   # @CurrentAdmin() param decorator
│   │   └── public.decorator.ts          # @Public() route decorator
│   ├── guards/
│   │   ├── jwt-access.guard.ts          # Validates access_token cookie
│   │   ├── jwt-refresh.guard.ts         # Validates refresh_token cookie
│   │   ├── admin-jwt.guard.ts           # Validates admin access_token
│   │   └── roles.guard.ts              # Role-based access control
│   ├── filters/
│   │   └── http-exception.filter.ts     # Global exception formatting
│   ├── interceptors/
│   │   └── transform.interceptor.ts     # Standardize response shape
│   ├── pipes/
│   │   └── parse-int.pipe.ts            # Custom int parsing with errors
│   ├── interfaces/
│   │   ├── jwt-payload.interface.ts     # JWT payload type
│   │   └── api-response.interface.ts    # Standard API response type
│   └── constants/
│       ├── booking-status.enum.ts       # Booking status enum
│       ├── order-status.enum.ts         # FNB order status enum
│       └── payment-status.enum.ts       # Payment status enum
│
├── config/                          # Configuration
│   └── env.validation.ts               # Joi/class-validator schema for .env
│
├── database/                        # Database module
│   ├── database.module.ts               # Drizzle provider registration
│   ├── database.provider.ts             # Drizzle instance factory
│   ├── schema/                          # All Drizzle schemas
│   │   ├── index.ts                     # Re-exports everything
│   │   ├── admin.schema.ts
│   │   ├── user.schema.ts
│   │   ├── movie.schema.ts
│   │   ├── cinema-hall.schema.ts
│   │   ├── showtime.schema.ts
│   │   ├── seat.schema.ts
│   │   ├── booking.schema.ts
│   │   ├── booking-seat.schema.ts
│   │   ├── snack.schema.ts
│   │   ├── fnb-order.schema.ts
│   │   ├── fnb-order-item.schema.ts
│   │   ├── payment.schema.ts
│   │   └── admin-log.schema.ts
│   ├── relations/                       # All Drizzle relations
│   │   └── index.ts                     # All relation definitions
│   └── drizzle.config.ts               # Drizzle Kit config (migrations)
│
├── auth/                            # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt-access.strategy.ts       # Passport strategy for access tokens
│   │   └── jwt-refresh.strategy.ts      # Passport strategy for refresh tokens
│   └── dto/
│       ├── register.dto.ts
│       └── login.dto.ts
│
├── users/                           # User profile module
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
│       └── update-profile.dto.ts
│
├── movies/                          # Movies module
│   ├── movies.module.ts
│   ├── movies.controller.ts
│   ├── movies.service.ts
│   └── dto/
│       ├── create-movie.dto.ts
│       ├── update-movie.dto.ts
│       └── query-movie.dto.ts
│
├── cinema-halls/                    # Cinema halls module
│   ├── cinema-halls.module.ts
│   ├── cinema-halls.controller.ts
│   ├── cinema-halls.service.ts
│   └── dto/
│       ├── create-hall.dto.ts
│       └── update-hall.dto.ts
│
├── showtimes/                       # Showtimes module
│   ├── showtimes.module.ts
│   ├── showtimes.controller.ts
│   ├── showtimes.service.ts
│   └── dto/
│       ├── create-showtime.dto.ts
│       ├── update-showtime.dto.ts
│       └── query-showtime.dto.ts
│
├── bookings/                        # Bookings module
│   ├── bookings.module.ts
│   ├── bookings.controller.ts
│   ├── bookings.service.ts
│   └── dto/
│       └── create-booking.dto.ts
│
├── snacks/                          # Snacks / F&B items module
│   ├── snacks.module.ts
│   ├── snacks.controller.ts
│   ├── snacks.service.ts
│   └── dto/
│       ├── create-snack.dto.ts
│       ├── update-snack.dto.ts
│       └── query-snack.dto.ts
│
├── fnb-orders/                      # F&B orders module
│   ├── fnb-orders.module.ts
│   ├── fnb-orders.controller.ts
│   ├── fnb-orders.service.ts
│   └── dto/
│       └── create-fnb-order.dto.ts
│
├── payments/                        # Payments module
│   ├── payments.module.ts
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   └── dto/
│       └── create-payment.dto.ts
│
├── admin/                           # Admin-specific module
│   ├── admin.module.ts
│   ├── admin.controller.ts          # Dashboard + transaction mgmt
│   ├── admin.service.ts
│   ├── admin-auth.controller.ts     # Admin login
│   ├── admin-auth.service.ts
│   ├── strategies/
│   │   └── admin-jwt.strategy.ts
│   └── dto/
│       └── admin-login.dto.ts
│
└── file-upload/                     # File upload utility module
    ├── file-upload.module.ts
    ├── file-upload.service.ts
    └── multer-config.ts
```

> **Rule:** Every module follows the pattern: `module.ts` → `controller.ts` → `service.ts` → `dto/`. No exceptions.

---

## 4. Environment Variables

Create a `.env` file at the project root:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (SQLite file path, relative to project root)
DATABASE_URL=./data/cinemate.db

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# JWT Secrets (CHANGE THESE — use `openssl rand -hex 32` to generate)
JWT_ACCESS_SECRET=replace-with-strong-access-secret-min-32-chars
JWT_REFRESH_SECRET=replace-with-strong-refresh-secret-min-32-chars

# JWT Expiry
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Admin JWT (separate secrets for admin tokens)
JWT_ADMIN_ACCESS_SECRET=replace-with-strong-admin-access-secret
JWT_ADMIN_REFRESH_SECRET=replace-with-strong-admin-refresh-secret

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

Create a `.env.example` file with the same structure but placeholder values. Commit `.env.example`, never commit `.env`.

### Environment Validation

Create `src/config/env.validation.ts`:

```typescript
import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsOptional, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  CLIENT_URL: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string;

  @IsString()
  JWT_ADMIN_ACCESS_SECRET: string;

  @IsString()
  JWT_ADMIN_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  NODE_ENV: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
```

---

## 5. Database & Drizzle Setup

### 5.1 Install Dependencies

```bash
# Drizzle ORM + SQLite driver
npm install drizzle-orm better-sqlite3

# Drizzle Kit for migrations (dev only)
npm install -D drizzle-kit @types/better-sqlite3
```

### 5.2 Drizzle Config

Create `src/database/drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './drizzle',           // migration output folder
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './data/cinemate.db',
  },
});
```

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate --config=src/database/drizzle.config.ts",
    "db:migrate": "drizzle-kit migrate --config=src/database/drizzle.config.ts",
    "db:studio": "drizzle-kit studio --config=src/database/drizzle.config.ts",
    "db:push": "drizzle-kit push --config=src/database/drizzle.config.ts"
  }
}
```

### 5.3 Database Module

Create `src/database/database.module.ts`:

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema/index.js';
import * as relations from './relations/index.js';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()   // Makes DRIZZLE injectable everywhere without importing DatabaseModule
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbPath = configService.get<string>('DATABASE_URL', './data/cinemate.db');
        const sqlite = new Database(dbPath);

        // Enable WAL mode for better concurrent read performance
        sqlite.pragma('journal_mode = WAL');
        // Enable foreign key enforcement (SQLite has this OFF by default!)
        sqlite.pragma('foreign_keys = ON');

        return drizzle(sqlite, { schema: { ...schema, ...relations } });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
```

> ⚠️ **Critical:** SQLite has foreign keys **disabled by default**. You **must** run `PRAGMA foreign_keys = ON` on every connection or your cascade deletes and referential integrity will silently not work.

---

## 6. Corrected Database Schema

Split the monolithic `schema.ts` into individual files under `src/database/schema/`. Each file exports one table.

### `src/database/schema/admin.schema.ts`

```typescript
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const admins = sqliteTable('Admin', {
  adminId: integer('AdminID').primaryKey({ autoIncrement: true }),
  username: text('username', { length: 100 }).notNull(),
  email: text('email', { length: 100 }).notNull().unique(),
  password: text('password', { length: 255 }).notNull(),
  refreshTokenHash: text('refreshTokenHash'),
});
```

### `src/database/schema/user.schema.ts`

```typescript
import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('User', {
  userId: integer('UserID').primaryKey({ autoIncrement: true }),
  fullName: text('FullName', { length: 50 }).notNull(),
  email: text('Email', { length: 100 }).notNull().unique(),
  phoneNum: text('PhoneNum', { length: 20 }).notNull(),
  password: text('Password', { length: 255 }).notNull(),
  refreshTokenHash: text('refreshTokenHash'),                         // ← ADDED
  createdAt: text('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`), // ← ADDED
});
```

### `src/database/schema/movie.schema.ts`

```typescript
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const movies = sqliteTable('Movie', {
  movieId: integer('MovieID').primaryKey({ autoIncrement: true }),
  title: text('title', { length: 255 }).notNull(),
  description: text('description').notNull(),     // ← CHANGED: removed length limit
  genre: text('genre', { length: 100 }).notNull(),
  ageRate: text('AgeRate', { length: 10 }).notNull(),
  durationMinutes: integer('DurationMinutes').notNull(),
  posterUrl: text('PosterURL', { length: 255 }).notNull(),
  trailerUrl: text('TrailerURL', { length: 255 }).notNull(),
  releaseDate: text('releaseDate').notNull(),
  endDate: text('endDate').notNull(),
  status: text('status', { length: 20 }).notNull(),    // 'NOW_PLAYING' | 'UPCOMING'
});
```

### `src/database/schema/cinema-hall.schema.ts`

```typescript
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const cinemaHalls = sqliteTable('CinemaHall', {
  hallId: integer('HallID').primaryKey({ autoIncrement: true }),
  cinemaName: text('CinemaName', { length: 100 }).notNull(),
  studioName: text('StudioName', { length: 50 }).notNull(),
  totalRows: integer('totalRows').notNull(),
  seatsPerRow: integer('seatsPerRow').notNull(),
});
```

### `src/database/schema/showtime.schema.ts`

```typescript
import { sqliteTable, integer, text, numeric, index } from 'drizzle-orm/sqlite-core';
import { movies } from './movie.schema.js';
import { cinemaHalls } from './cinema-hall.schema.js';

export const showtimes = sqliteTable(
  'Showtime',
  {
    showtimeId: integer('ShowtimeID').primaryKey({ autoIncrement: true }),
    movieId: integer('MovieID')
      .notNull()
      .references(() => movies.movieId, { onDelete: 'cascade' }),
    hallId: integer('HallID')
      .notNull()
      .references(() => cinemaHalls.hallId, { onDelete: 'cascade' }),
    showDate: text('showDate').notNull(),       // Format: 'YYYY-MM-DD'
    showTime: text('showTime').notNull(),       // Format: 'HH:mm'
    price: numeric('price').notNull(),
  },
  (table) => [
    index('showtime_movie_id_idx').on(table.movieId),
    index('showtime_hall_id_idx').on(table.hallId),
  ],
);
```

### `src/database/schema/seat.schema.ts`

```typescript
import { sqliteTable, integer, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { cinemaHalls } from './cinema-hall.schema.js';

export const seats = sqliteTable(
  'Seat',
  {
    seatId: integer('SeatID').primaryKey({ autoIncrement: true }),
    hallId: integer('HallID')
      .notNull()
      .references(() => cinemaHalls.hallId, { onDelete: 'cascade' }),
    rowLetter: text('rowLetter', { length: 1 }).notNull(),
    seatNumber: integer('SeatNumber').notNull(),
  },
  (table) => [
    uniqueIndex('seat_hall_row_number_unique').on(
      table.hallId,
      table.rowLetter,
      table.seatNumber,
    ),
    index('seat_hall_id_idx').on(table.hallId),
  ],
);
```

### `src/database/schema/booking.schema.ts`

```typescript
import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, numeric, index } from 'drizzle-orm/sqlite-core';
import { users } from './user.schema.js';
import { showtimes } from './showtime.schema.js';

export const bookings = sqliteTable(
  'Booking',
  {
    bookingId: text('BookingID')
      .primaryKey()
      .default(sql`lower(hex(randomblob(16)))`),
    userId: integer('UserID')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    showtimeId: integer('ShowtimeID')
      .notNull()
      .references(() => showtimes.showtimeId, { onDelete: 'cascade' }),
    bookingDate: text('bookingDate')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    taxAmount: numeric('taxAmount').notNull(),
    totalAmount: numeric('totalAmount').notNull(),
    bookingStatus: text('bookingStatus', { length: 20 })
      .notNull()
      .default('Pending'),     // ← ADDED default
  },
  (table) => [
    index('booking_user_id_idx').on(table.userId),
    index('booking_showtime_id_idx').on(table.showtimeId),
  ],
);
```

### `src/database/schema/booking-seat.schema.ts`

```typescript
import { sqliteTable, integer, text, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { bookings } from './booking.schema.js';
import { seats } from './seat.schema.js';

export const bookingSeats = sqliteTable(
  'Booking_Seat',
  {
    bookingId: text('BookingID')
      .notNull()
      .references(() => bookings.bookingId, { onDelete: 'cascade' }),
    seatId: integer('SeatID')
      .notNull()
      .references(() => seats.seatId, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.bookingId, table.seatId] }),
    index('booking_seat_seat_id_idx').on(table.seatId),
  ],
);
```

### `src/database/schema/snack.schema.ts`

```typescript
import { sqliteTable, integer, text, numeric } from 'drizzle-orm/sqlite-core';

export const snacks = sqliteTable('Snack', {
  snackId: integer('SnackID').primaryKey({ autoIncrement: true }),
  snackName: text('snackName', { length: 100 }).notNull(),
  category: text('category', { length: 50 }).notNull(),       // 'Snack' | 'Drink' | 'Combo'
  price: numeric('price').notNull(),
  imageUrl: text('imageURL', { length: 255 }).notNull(),
});
```

### `src/database/schema/fnb-order.schema.ts`

```typescript
import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, numeric, index } from 'drizzle-orm/sqlite-core';
import { users } from './user.schema.js';

export const fnbOrders = sqliteTable(
  'FNB_Order',
  {
    fnbOrderId: text('FNBOrderID')
      .primaryKey()
      .default(sql`lower(hex(randomblob(16)))`),
    userId: integer('UserID')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    orderDate: text('orderDate')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    taxAmount: numeric('taxAmount').notNull(),
    totalAmount: numeric('totalAmount').notNull(),
    orderStatus: text('orderStatus', { length: 20 })
      .notNull()
      .default('Pending'),     // ← ADDED default
  },
  (table) => [index('fnb_order_user_id_idx').on(table.userId)],
);
```

### `src/database/schema/fnb-order-item.schema.ts`

```typescript
import { sqliteTable, integer, text, numeric, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { fnbOrders } from './fnb-order.schema.js';
import { snacks } from './snack.schema.js';

export const fnbOrderItems = sqliteTable(
  'FNB_Order_Item',
  {
    fnbOrderId: text('FNBOrderID')
      .notNull()
      .references(() => fnbOrders.fnbOrderId, { onDelete: 'cascade' }),
    snackId: integer('snackID')
      .notNull()
      .references(() => snacks.snackId, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    subTotalPrice: numeric('subTotalPrice').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.fnbOrderId, table.snackId] }),
    index('fnb_order_item_snack_id_idx').on(table.snackId),
  ],
);
```

### `src/database/schema/payment.schema.ts`

```typescript
import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, numeric } from 'drizzle-orm/sqlite-core';
import { bookings } from './booking.schema.js';
import { fnbOrders } from './fnb-order.schema.js';

export const payments = sqliteTable('Payment', {
  paymentId: integer('PaymentID').primaryKey({ autoIncrement: true }),
  bookingId: text('BookingID')
    .unique()
    .references(() => bookings.bookingId, { onDelete: 'cascade' }),
  fnbOrderId: text('FNBOrderID')
    .unique()
    .references(() => fnbOrders.fnbOrderId, { onDelete: 'cascade' }),
  paymentMethod: text('paymentMethod', { length: 100 }).notNull(),
  amount: numeric('amount').notNull(),
  paymentDate: text('paymentDate')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  paymentStatus: text('paymentStatus', { length: 20 })
    .notNull()
    .default('Pending'),     // ← ADDED default
});
```

### `src/database/schema/admin-log.schema.ts` ← NEW TABLE

```typescript
import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { admins } from './admin.schema.js';

export const adminLogs = sqliteTable(
  'AdminLog',
  {
    logId: integer('LogID').primaryKey({ autoIncrement: true }),
    adminId: integer('AdminID')
      .notNull()
      .references(() => admins.adminId, { onDelete: 'cascade' }),
    action: text('action', { length: 100 }).notNull(),     // e.g., 'CREATE_MOVIE', 'DELETE_SHOWTIME'
    entity: text('entity', { length: 50 }).notNull(),       // e.g., 'Movie', 'Showtime'
    entityId: text('entityId').notNull(),                    // The ID of the affected record
    details: text('details'),                                // Optional JSON string with extra info
    createdAt: text('createdAt')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('admin_log_admin_id_idx').on(table.adminId),
  ],
);
```

### `src/database/schema/index.ts`

```typescript
export { admins } from './admin.schema.js';
export { users } from './user.schema.js';
export { movies } from './movie.schema.js';
export { cinemaHalls } from './cinema-hall.schema.js';
export { showtimes } from './showtime.schema.js';
export { seats } from './seat.schema.js';
export { bookings } from './booking.schema.js';
export { bookingSeats } from './booking-seat.schema.js';
export { snacks } from './snack.schema.js';
export { fnbOrders } from './fnb-order.schema.js';
export { fnbOrderItems } from './fnb-order-item.schema.js';
export { payments } from './payment.schema.js';
export { adminLogs } from './admin-log.schema.js';
```

### `src/database/relations/index.ts`

Keep all relation definitions in this single file (they reference cross-schema, so grouping makes sense):

```typescript
import { relations } from 'drizzle-orm';
import {
  admins, users, movies, cinemaHalls, showtimes, seats,
  bookings, bookingSeats, snacks, fnbOrders, fnbOrderItems,
  payments, adminLogs,
} from '../schema/index.js';

export const adminsRelations = relations(admins, ({ many }) => ({
  logs: many(adminLogs),
}));

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  fnbOrders: many(fnbOrders),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  showtimes: many(showtimes),
}));

export const cinemaHallsRelations = relations(cinemaHalls, ({ many }) => ({
  showtimes: many(showtimes),
  seats: many(seats),
}));

export const showtimesRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, {
    fields: [showtimes.movieId],
    references: [movies.movieId],
  }),
  hall: one(cinemaHalls, {
    fields: [showtimes.hallId],
    references: [cinemaHalls.hallId],
  }),
  bookings: many(bookings),
}));

export const seatsRelations = relations(seats, ({ one, many }) => ({
  hall: one(cinemaHalls, {
    fields: [seats.hallId],
    references: [cinemaHalls.hallId],
  }),
  bookingSeats: many(bookingSeats),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.userId],
  }),
  showtime: one(showtimes, {
    fields: [bookings.showtimeId],
    references: [showtimes.showtimeId],
  }),
  payment: one(payments),
  bookingSeats: many(bookingSeats),
}));

export const bookingSeatsRelations = relations(bookingSeats, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingSeats.bookingId],
    references: [bookings.bookingId],
  }),
  seat: one(seats, {
    fields: [bookingSeats.seatId],
    references: [seats.seatId],
  }),
}));

export const snacksRelations = relations(snacks, ({ many }) => ({
  orderItems: many(fnbOrderItems),
}));

export const fnbOrdersRelations = relations(fnbOrders, ({ one, many }) => ({
  user: one(users, {
    fields: [fnbOrders.userId],
    references: [users.userId],
  }),
  orderItems: many(fnbOrderItems),
  payment: one(payments),
}));

export const fnbOrderItemsRelations = relations(fnbOrderItems, ({ one }) => ({
  fnbOrder: one(fnbOrders, {
    fields: [fnbOrderItems.fnbOrderId],
    references: [fnbOrders.fnbOrderId],
  }),
  snack: one(snacks, {
    fields: [fnbOrderItems.snackId],
    references: [snacks.snackId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.bookingId],
  }),
  fnbOrder: one(fnbOrders, {
    fields: [payments.fnbOrderId],
    references: [fnbOrders.fnbOrderId],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(admins, {
    fields: [adminLogs.adminId],
    references: [admins.adminId],
  }),
}));
```

---

## 7. Module Implementation Guide

### 7.1 Database Module

**Already covered in Section 5.3.** Key points:
- Mark as `@Global()` so every module can inject `DRIZZLE`.
- Inject using `@Inject(DRIZZLE)` in services.
- Type the injected value as `BetterSQLite3Database<typeof schema>`.

**Usage pattern in any service:**

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module.js';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../database/schema/index.js';

@Injectable()
export class MoviesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: BetterSQLite3Database<typeof schema>,
  ) {}
}
```

---

### 7.2 Auth Module (User Authentication)

**Files:** `src/auth/`

**Responsibilities:**
- Register new users
- Login users
- Refresh tokens (with rotation)
- Logout (clear tokens)
- `GET /api/auth/me` — return JWT payload for the currently authenticated user

#### Auth Flow Recap

| Action | Steps |
|--------|-------|
| **Register** | Validate DTO → Check email uniqueness → Hash password (Argon2) → Insert user → Generate access + refresh tokens → Hash refresh token → Save hash to DB → Set HttpOnly cookies → Return user (without password) |
| **Login** | Validate DTO → Find user by email → Verify password (Argon2) → Generate tokens → Hash + save refresh token → Set cookies → Return user |
| **Refresh** | Read `refresh_token` cookie → Verify JWT → Find user → Compare token hash → Rotate: generate new pair → Save new refresh hash → Set new cookies |
| **Logout** | Clear `refreshTokenHash` in DB → Clear both cookies → Return success |

#### DTOs

**`src/auth/dto/register.dto.ts`**

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s]+$/, { message: 'Phone number format is invalid' })
  phoneNum: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
```

**`src/auth/dto/login.dto.ts`**

```typescript
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

#### JWT Strategies

**`src/auth/strategies/jwt-access.strategy.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

// Extract JWT from cookie instead of Authorization header
function extractFromCookie(req: Request): string | null {
  return req?.cookies?.['access_token'] ?? null;
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: extractFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  // Whatever this returns gets attached to request.user
  validate(payload: { sub: number; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

**`src/auth/strategies/jwt-refresh.strategy.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

function extractRefreshFromCookie(req: Request): string | null {
  return req?.cookies?.['refresh_token'] ?? null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: extractRefreshFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,     // We need the raw token for hash comparison
    });
  }

  validate(req: Request, payload: { sub: number; email: string }) {
    const refreshToken = req.cookies['refresh_token'];
    return { userId: payload.sub, email: payload.email, refreshToken };
  }
}
```

#### Cookie Helper

Create a utility method in `AuthService` (or a shared helper):

```typescript
private setCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProduction = this.configService.get('NODE_ENV') === 'production';

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,              // 15 minutes
    path: '/',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,     // 7 days
    path: '/',
  });
}

private clearCookies(res: Response) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
}
```

#### Controller Skeleton

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {}

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {}

  @UseGuards(JwtAccessGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {}

  @UseGuards(JwtAccessGuard)
  @Get('me')
  getMe(@CurrentUser() user: any) {}
}
```

> ⚠️ **Important:** Always use `@Res({ passthrough: true })` when you need `res` for cookies but still want NestJS to handle the response serialization. If you use `@Res()` without `passthrough`, NestJS will NOT send the return value — you'd have to call `res.json()` manually.

---

### 7.3 Users Module

**Files:** `src/users/`

**Responsibilities:**
- `GET /api/users/profile` — Get authenticated user's profile
- `PUT /api/users/profile` — Update authenticated user's profile (fullName, phoneNum, password)

All routes are protected with `JwtAccessGuard`.

**`src/users/dto/update-profile.dto.ts`**

```typescript
import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s]+$/, { message: 'Phone number format is invalid' })
  phoneNum?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
```

> **Note:** Email changes are intentionally not allowed (as per the API spec).

---

### 7.4 Movies Module

**Files:** `src/movies/`

**Responsibilities:**
- **Public:** List movies (with filters), get movie detail
- **Admin:** Full CRUD with image upload

#### DTOs

**`src/movies/dto/query-movie.dto.ts`**

```typescript
import { IsOptional, IsString, IsIn } from 'class-validator';

export class QueryMovieDto {
  @IsOptional()
  @IsIn(['NOW_PLAYING', 'UPCOMING'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
```

**`src/movies/dto/create-movie.dto.ts`**

```typescript
import { IsNotEmpty, IsString, IsInt, IsIn, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  genre: string;

  @IsString()
  @IsNotEmpty()
  ageRate: string;        // e.g., 'PG-13', 'R', 'SU'

  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsString()
  @IsOptional()
  trailerUrl?: string;

  @IsString()
  @IsNotEmpty()
  releaseDate: string;     // 'YYYY-MM-DD'

  @IsString()
  @IsNotEmpty()
  endDate: string;         // 'YYYY-MM-DD'

  @IsIn(['NOW_PLAYING', 'UPCOMING'])
  status: string;

  // posterUrl is set by the file upload handler, not from the body
}
```

**`src/movies/dto/update-movie.dto.ts`** — Use `PartialType(CreateMovieDto)` from `@nestjs/mapped-types`:

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto.js';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
```

> 💡 **Best Practice:** Always use `PartialType`, `PickType`, or `OmitType` from `@nestjs/mapped-types` for update DTOs. This keeps validation rules DRY.

---

### 7.5 Cinema Halls Module

**Files:** `src/cinema-halls/`

**Responsibilities:**
- Admin CRUD for cinema halls
- **Critical:** Auto-generate seats when a hall is created or updated

#### Seat Generation Logic

When a hall is created with `totalRows = 5` and `seatsPerRow = 10`:

```
Row A: seats 1-10
Row B: seats 1-10
Row C: seats 1-10
Row D: seats 1-10
Row E: seats 1-10
```

**Implementation in service:**

```typescript
private async generateSeats(hallId: number, totalRows: number, seatsPerRow: number) {
  const seatRows = [];
  for (let row = 0; row < totalRows; row++) {
    const rowLetter = String.fromCharCode(65 + row); // A, B, C...
    for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
      seatRows.push({ hallId, rowLetter, seatNumber: seatNum });
    }
  }
  await this.db.insert(seats).values(seatRows);
}
```

**On update:** If `totalRows` or `seatsPerRow` changes:
1. Delete ALL existing seats for this hall (cascade will handle booking_seats).
2. Re-generate with the new dimensions.

> ⚠️ **Warning:** Deleting seats will cascade-delete `Booking_Seat` entries. In production, you'd want to prevent this if there are active bookings. For the prototype, this is acceptable.

#### DTOs

**`src/cinema-halls/dto/create-hall.dto.ts`**

```typescript
import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateHallDto {
  @IsString()
  @IsNotEmpty()
  cinemaName: string;

  @IsString()
  @IsNotEmpty()
  studioName: string;

  @IsInt()
  @Min(1)
  @Max(26)    // Max 26 rows (A-Z)
  totalRows: number;

  @IsInt()
  @Min(1)
  @Max(50)
  seatsPerRow: number;
}
```

---

### 7.6 Showtimes Module

**Files:** `src/showtimes/`

**Responsibilities:**
- **Public:** List showtimes filtered by movie + date, get seat availability for a showtime
- **Admin:** CRUD showtimes

#### Seat Availability Logic (`GET /api/showtimes/:showtimeId/seats`)

This endpoint must return:
1. The cinema hall layout (totalRows, seatsPerRow)
2. ALL seats for the hall
3. Which seats are already booked (by joining `Booking_Seat` → `Booking` for this showtime, where `bookingStatus != 'Cancelled'`)

**Response shape:**

```json
{
  "hall": {
    "hallId": 1,
    "cinemaName": "CGV Grand Indonesia",
    "studioName": "Studio 3",
    "totalRows": 5,
    "seatsPerRow": 10
  },
  "seats": [
    { "seatId": 1, "rowLetter": "A", "seatNumber": 1, "isOccupied": false },
    { "seatId": 2, "rowLetter": "A", "seatNumber": 2, "isOccupied": true },
    ...
  ]
}
```

#### DTOs

**`src/showtimes/dto/query-showtime.dto.ts`**

```typescript
import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryShowtimeDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  movieId?: number;

  @IsOptional()
  @IsString()
  showDate?: string;      // 'YYYY-MM-DD'
}
```

---

### 7.7 Bookings Module

**Files:** `src/bookings/`

**Responsibilities:**
- Create a booking (user selects showtime + seats)
- Get user's booking history
- Get booking detail (ticket/receipt)

#### Create Booking Flow

```
1. Validate DTO (showtimeId + seatIds array)
2. Verify the showtime exists and is in the future
3. Verify ALL seatIds belong to the correct hall for this showtime
4. Check none of the seats are already booked for this showtime
   → Query Booking_Seat JOIN Booking WHERE showtimeId = X AND bookingStatus != 'Cancelled'
5. Look up showtime price
6. Calculate:
   - subtotal = price × number of seats
   - taxAmount = subtotal × 0.11 (11% PPN)
   - totalAmount = subtotal + taxAmount
7. INSERT into Booking (with calculated amounts)
8. INSERT into Booking_Seat (one row per seat)
9. Return bookingId + calculated amounts
```

> ⚠️ **Critical:** Steps 4-8 MUST run inside a **database transaction** to prevent race conditions (two users booking the same seat simultaneously).

**SQLite transaction with Drizzle:**

```typescript
// better-sqlite3 transactions are synchronous
const result = this.db.transaction((tx) => {
  // All DB operations inside here use `tx` instead of `this.db`
  // ... check seats, insert booking, insert booking_seats
  return { bookingId, taxAmount, totalAmount };
});
```

#### DTO

**`src/bookings/dto/create-booking.dto.ts`**

```typescript
import { IsNotEmpty, IsInt, IsArray, ArrayMinSize } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  showtimeId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  seatIds: number[];
}
```

> **Notice:** No `taxAmount` or `totalAmount` — the server calculates these.

---

### 7.8 Snacks Module

**Files:** `src/snacks/`

**Responsibilities:**
- **Public:** List snacks (filterable by category)
- **Admin:** CRUD with image upload

**`src/snacks/dto/query-snack.dto.ts`**

```typescript
import { IsOptional, IsIn } from 'class-validator';

export class QuerySnackDto {
  @IsOptional()
  @IsIn(['Snack', 'Drink', 'Combo'])
  category?: string;
}
```

---

### 7.9 FNB Orders Module

**Files:** `src/fnb-orders/`

**Responsibilities:**
- Create an F&B order (user selects snack items + quantities)

#### Create FNB Order Flow

```
1. Validate DTO (items array with snackId + quantity)
2. Look up ALL snack prices from DB
3. Calculate per-item subtotals (price × quantity)
4. Calculate total + tax
5. INSERT into FNB_Order
6. INSERT into FNB_Order_Item (one row per snack)
7. Return fnbOrderId + calculated amounts
```

**`src/fnb-orders/dto/create-fnb-order.dto.ts`**

```typescript
import { IsArray, ArrayMinSize, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class FnbOrderItemDto {
  @IsInt()
  snackId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateFnbOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FnbOrderItemDto)
  items: FnbOrderItemDto[];
}
```

> **Notice:** No `subTotalPrice`, `taxAmount`, or `totalAmount` — the server calculates these.

---

### 7.10 Payments Module

**Files:** `src/payments/`

**Responsibilities:**
- Create a payment for a booking OR an FNB order (not both in one call)
- Payment creation updates the associated booking/order status

#### Create Payment Flow

```
1. Validate DTO (bookingId OR fnbOrderId, paymentMethod)
2. Verify the booking/order exists and belongs to the current user
3. Verify no existing payment for this booking/order
4. Look up the totalAmount from the booking/order
5. INSERT into Payment (amount = totalAmount from booking/order)
6. UPDATE bookingStatus to 'Confirmed' / orderStatus to 'Confirmed'
7. Return paymentId
```

**`src/payments/dto/create-payment.dto.ts`**

```typescript
import { IsOptional, IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsString()
  fnbOrderId?: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;      // e.g., 'BCA', 'GoPay', 'OVO', 'QRIS'

  // Custom validation: at least one of bookingId or fnbOrderId must be provided
  // Implement as a class-level validator or validate in the service
}
```

---

### 7.11 Admin Module

**Files:** `src/admin/`

This module handles:
1. **Admin authentication** (separate from user auth)
2. **Dashboard analytics**
3. **Transaction management** (view, cancel, verify bookings)
4. **Activity logs**

Admin CRUD for movies, halls, showtimes, and snacks lives in their **respective modules** (e.g., `MoviesController` has both public and admin routes). The admin module only handles admin-specific concerns.

#### Admin Auth

Admin uses its own JWT secrets (`JWT_ADMIN_ACCESS_SECRET`, `JWT_ADMIN_REFRESH_SECRET`) and its own passport strategy (`admin-jwt`). This ensures a user token cannot access admin routes and vice versa.

**`src/admin/dto/admin-login.dto.ts`**

```typescript
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

#### Dashboard Endpoints

**`GET /api/admin/dashboard/metrics`** — Returns:

```json
{
  "totalRevenue": 45000000,
  "ticketsSold": 320,
  "pendingOrders": 12,
  "activeMoviesCount": 8
}
```

Implementation notes:
- `totalRevenue`: `SUM(amount)` from `Payment` where `paymentStatus = 'Completed'`
- `ticketsSold`: `COUNT(*)` from `Booking_Seat` joined with `Booking` where `bookingStatus IN ('Confirmed', 'Completed')`
- `pendingOrders`: `COUNT(*)` from `Booking` where `bookingStatus = 'Pending'`
- `activeMoviesCount`: `COUNT(*)` from `Movie` where `status = 'NOW_PLAYING'`

**`GET /api/admin/dashboard/chart`** — Returns weekly revenue:

```json
[
  { "name": "Mon", "total": 4500000 },
  { "name": "Tue", "total": 3200000 },
  ...
]
```

#### Transaction Management

| Endpoint | Method | Action |
|----------|--------|--------|
| `/api/admin/transactions` | GET | List all transactions (bookings + FNB orders with payment info) |
| `/api/admin/transactions/:bookingId/cancel` | PATCH | Set `bookingStatus = 'Cancelled'` |
| `/api/admin/transactions/:bookingId/verify` | PATCH | Set `bookingStatus = 'Completed'` (QR verification) |
| `/api/admin/transactions/fnb/:fnbOrderId/cancel` | PATCH | Set `orderStatus = 'Cancelled'` |

---

### 7.12 File Upload Module

**Files:** `src/file-upload/`

Handles image uploads for movie posters and snack images.

**Setup using Multer (built into `@nestjs/platform-express`):**

```typescript
// src/file-upload/multer-config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';    // npm install uuid && npm install -D @types/uuid

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => {
      const uniqueName = `${uuid()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,       // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
};
```

**Usage in controller:**

```typescript
@Post()
@UseInterceptors(FileInterceptor('poster', multerConfig))
createMovie(
  @Body() dto: CreateMovieDto,
  @UploadedFile() file: Express.Multer.File,
) {
  const posterUrl = `/uploads/${file.filename}`;
  return this.moviesService.create(dto, posterUrl);
}
```

**Serve static uploads** in `main.ts`:

```typescript
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
```

---

## 8. Complete API Reference

### Legend
- 🟢 Public (no auth)
- 🔵 User (requires user JWT)
- 🔴 Admin (requires admin JWT)

### Authentication — User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | 🟢 | Register a new user |
| POST | `/api/auth/login` | 🟢 | Login user, set cookies |
| POST | `/api/auth/refresh` | 🔵 (refresh cookie) | Rotate refresh token |
| POST | `/api/auth/logout` | 🔵 | Clear tokens + cookies |
| GET | `/api/auth/me` | 🔵 | Get current user's JWT payload |

### Authentication — Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/auth/login` | 🟢 | Admin login |
| POST | `/api/admin/auth/refresh` | 🔴 (refresh cookie) | Admin token rotation |
| POST | `/api/admin/auth/logout` | 🔴 | Admin logout |

### Movies

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/movies` | 🟢 | List movies (`?status=NOW_PLAYING&search=avengers`) |
| GET | `/api/movies/:movieId` | 🟢 | Get movie detail |
| GET | `/api/admin/movies` | 🔴 | List all movies (admin view, includes all statuses) |
| POST | `/api/admin/movies` | 🔴 | Create movie (multipart/form-data) |
| PUT | `/api/admin/movies/:movieId` | 🔴 | Update movie |
| DELETE | `/api/admin/movies/:movieId` | 🔴 | Delete movie |

### Showtimes & Seats

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/showtimes` | 🟢 | List showtimes (`?movieId=1&showDate=2026-01-15`) |
| GET | `/api/showtimes/:showtimeId/seats` | 🟢 | Get hall layout + seat availability |
| GET | `/api/admin/showtimes` | 🔴 | List all showtimes (admin) |
| POST | `/api/admin/showtimes` | 🔴 | Create showtime |
| PUT | `/api/admin/showtimes/:showtimeId` | 🔴 | Update showtime |
| DELETE | `/api/admin/showtimes/:showtimeId` | 🔴 | Delete showtime |

### Cinema Halls

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/halls` | 🔴 | List all cinema halls |
| POST | `/api/admin/halls` | 🔴 | Create hall + auto-generate seats |
| PUT | `/api/admin/halls/:hallId` | 🔴 | Update hall (re-generates seats if dimensions change) |
| DELETE | `/api/admin/halls/:hallId` | 🔴 | Delete hall (cascades to seats + showtimes) |

### Snacks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/snacks` | 🟢 | List snacks (`?category=Drink`) |
| GET | `/api/admin/snacks` | 🔴 | List all snacks (admin) |
| POST | `/api/admin/snacks` | 🔴 | Create snack (multipart/form-data) |
| PUT | `/api/admin/snacks/:snackId` | 🔴 | Update snack |
| DELETE | `/api/admin/snacks/:snackId` | 🔴 | Delete snack |

### Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | 🔵 | Create booking (server calculates prices) |
| GET | `/api/users/orders` | 🔵 | Get user's booking history |
| GET | `/api/users/orders/:bookingId` | 🔵 | Get booking detail (ticket/receipt) |

### F&B Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/fnb-orders` | 🔵 | Create FNB order (server calculates prices) |

### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments` | 🔵 | Create payment for booking or FNB order |

### User Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | 🔵 | Get user profile |
| PUT | `/api/users/profile` | 🔵 | Update user profile |

### Admin Dashboard & Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard/metrics` | 🔴 | Dashboard KPIs |
| GET | `/api/admin/dashboard/chart` | 🔴 | Weekly revenue chart data |
| GET | `/api/admin/transactions` | 🔴 | List all transactions |
| PATCH | `/api/admin/transactions/:bookingId/cancel` | 🔴 | Cancel a booking |
| PATCH | `/api/admin/transactions/:bookingId/verify` | 🔴 | Verify booking (QR scan) |
| PATCH | `/api/admin/transactions/fnb/:fnbOrderId/cancel` | 🔴 | Cancel FNB order |
| GET | `/api/admin/profile` | 🔴 | Get admin profile |
| GET | `/api/admin/logs` | 🔴 | Get activity logs |

---

## 9. Guards, Decorators & Middleware

### Guards

Create these in `src/common/guards/`:

| Guard | Strategy Name | Purpose |
|-------|---------------|---------|
| `JwtAccessGuard` | `'jwt-access'` | Protects user routes — reads `access_token` cookie |
| `JwtRefreshGuard` | `'jwt-refresh'` | Protects refresh endpoint — reads `refresh_token` cookie |
| `AdminJwtGuard` | `'admin-jwt'` | Protects admin routes — reads `admin_access_token` cookie |

**Example guard:**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt-access') {}
```

### Custom Decorators

**`src/common/decorators/current-user.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.user?.[data];
    }
    return request.user;
  },
);
```

**Usage:**

```typescript
@Get('profile')
@UseGuards(JwtAccessGuard)
getProfile(@CurrentUser() user: JwtPayload) {
  return this.usersService.findById(user.userId);
}

// Or get a specific field:
@Get('profile')
@UseGuards(JwtAccessGuard)
getProfile(@CurrentUser('userId') userId: number) {
  return this.usersService.findById(userId);
}
```

### JWT Payload Interface

**`src/common/interfaces/jwt-payload.interface.ts`**

```typescript
export interface JwtPayload {
  sub: number;        // userId or adminId
  email: string;
}

export interface UserFromJwt {
  userId: number;
  email: string;
}

export interface AdminFromJwt {
  adminId: number;
  email: string;
}
```

---

## 10. DTO Patterns & Validation

### Rules for DTOs

1. **One DTO per operation** — `CreateMovieDto`, `UpdateMovieDto`, `QueryMovieDto`
2. **All DTOs use `class-validator` decorators** — never trust client input
3. **Update DTOs extend Create DTOs** using `PartialType()` — all fields become optional
4. **Query DTOs** use `@IsOptional()` on every field
5. **Numeric query params** must use `@Type(() => Number)` from `class-transformer` because query strings are always strings
6. **Never expose passwords** — always `delete user.password` before returning or use a serialization interceptor

### Install Dependencies

```bash
npm install @nestjs/mapped-types
```

### Standardized API Response Shape

All API responses should follow this shape for consistency:

```typescript
// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      })),
    );
  }
}
```

Register globally in `main.ts`:

```typescript
app.useGlobalInterceptors(new TransformInterceptor());
```

---

## 11. Error Handling

### Global Exception Filter

**`src/common/filters/http-exception.filter.ts`**

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

Register in `main.ts`:

```typescript
app.useGlobalFilters(new AllExceptionsFilter());
```

### Common Exceptions to Throw

```typescript
import {
  BadRequestException,      // 400 — invalid input
  UnauthorizedException,    // 401 — not authenticated
  ForbiddenException,       // 403 — not authorized
  NotFoundException,        // 404 — resource not found
  ConflictException,        // 409 — duplicate/conflict
} from '@nestjs/common';

// Examples:
throw new NotFoundException('Movie not found');
throw new ConflictException('Email already registered');
throw new UnauthorizedException('Invalid credentials');
throw new BadRequestException('At least one seat must be selected');
```

---

## 12. Security & Rate Limiting

### `main.ts` — Complete Bootstrap

```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Security headers
  app.use(helmet());

  // Cookie parser (required for JWT from cookies)
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,                    // Required for cookies
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,                    // Strip unknown properties
      forbidNonWhitelisted: true,         // Throw on unknown properties
      transform: true,                    // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,   // Convert string query params to numbers etc.
      },
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Serve uploaded files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`);
}

bootstrap();
```

### Rate Limiting

Install and configure `@nestjs/throttler`:

**In `app.module.ts`:**

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,        // 1 minute
        limit: 20,         // 20 requests per minute (default for all routes)
      },
      {
        name: 'long',
        ttl: 600000,       // 10 minutes
        limit: 100,        // 100 requests per 10 minutes
      },
    ]),
    // ... other imports
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,     // Apply globally
    },
  ],
})
export class AppModule {}
```

**Custom throttle on sensitive routes:**

```typescript
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  @Throttle([{ name: 'short', limit: 5, ttl: 60000 }])   // 5 per minute
  @Post('login')
  login() {}

  @Throttle([{ name: 'short', limit: 3, ttl: 60000 }])   // 3 per minute
  @Post('register')
  register() {}
}
```

---

## 13. Testing Strategy

### Unit Tests

Test services in isolation by mocking the Drizzle DB:

```typescript
describe('MoviesService', () => {
  let service: MoviesService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockResolvedValue([{ movieId: 1 }]),
    };

    const module = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });
});
```

### E2E Tests

Use `supertest` for endpoint testing. Create a test database for E2E:

```typescript
describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    // Apply the same global config as main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  it('/api/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ fullName: 'Test', email: 'test@test.com', phoneNum: '081234', password: '12345678' })
      .expect(201);
  });
});
```

### Recommended Test Coverage

| Module | Priority | What to Test |
|--------|----------|--------------|
| Auth | 🔴 High | Register, login, refresh, logout, duplicate email, wrong password |
| Bookings | 🔴 High | Seat availability check, double-booking prevention, price calculation |
| Payments | 🔴 High | Payment creation, duplicate payment prevention, status updates |
| Movies | 🟡 Medium | CRUD, filtering, search |
| Halls | 🟡 Medium | Seat auto-generation, dimension change |
| Showtimes | 🟡 Medium | CRUD, seat availability query |

---

## 14. Setup & Run Instructions

### First-Time Setup

```bash
# 1. Install all dependencies
npm install

# 2. Install additional dependencies required by this project
npm install @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/mapped-types @nestjs/throttler
npm install passport passport-jwt
npm install class-validator class-transformer
npm install cookie-parser helmet
npm install argon2 uuid
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3 @types/passport-jwt @types/cookie-parser @types/uuid

# 3. Create environment file
cp .env.example .env
# Edit .env with your secrets

# 4. Create the data directory for SQLite
mkdir data

# 5. Create the uploads directory
mkdir uploads

# 6. Push the schema to SQLite (creates tables)
npm run db:push

# 7. Start the dev server
npm run start:dev
```

### Useful Scripts

| Script | Purpose |
|--------|---------|
| `npm run start:dev` | Start with hot reload |
| `npm run db:push` | Push schema changes to DB (development) |
| `npm run db:generate` | Generate migration files |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |

---

## 15. NestJS Best Practices Checklist

Use this checklist while implementing each module:

### Architecture
- [ ] Each module has exactly ONE responsibility (Single Responsibility Principle)
- [ ] Business logic lives in **services**, not controllers
- [ ] Controllers only handle HTTP concerns (request parsing, response formatting, status codes)
- [ ] Use dependency injection everywhere — never use `new Service()` manually
- [ ] Use `@Global()` only for truly global modules (Database, Config)
- [ ] Import modules through `imports: []`, not by importing services directly

### DTOs & Validation
- [ ] Every endpoint has a DTO (even if it has only one field)
- [ ] All DTOs use `class-validator` decorators
- [ ] Update DTOs use `PartialType(CreateDto)` from `@nestjs/mapped-types`
- [ ] Query params DTOs use `@IsOptional()` on every field
- [ ] Never trust client-sent calculations (prices, totals, taxes)

### Security
- [ ] Passwords are hashed with Argon2 (never stored in plain text)
- [ ] Refresh tokens are hashed before storing in DB
- [ ] JWTs are stored in HttpOnly cookies (never `localStorage`)
- [ ] Refresh tokens are rotated on every use
- [ ] Admin and User use different JWT secrets
- [ ] Sensitive routes have custom rate limits
- [ ] Helmet is enabled for security headers
- [ ] CORS is configured with specific origin (never `*` in production)
- [ ] `PRAGMA foreign_keys = ON` is set for SQLite

### Database
- [ ] All financial operations (bookings, payments) use transactions
- [ ] Proper indexes on foreign keys and frequently queried columns
- [ ] UUID-like IDs for bookings and FNB orders (harder to enumerate)
- [ ] Auto-increment IDs for admin-managed entities (simpler to work with)
- [ ] Schema split into individual files per table

### Error Handling
- [ ] Use NestJS built-in exceptions (`NotFoundException`, `ConflictException`, etc.)
- [ ] Global exception filter catches all unhandled errors
- [ ] Never expose stack traces in production
- [ ] Always validate that referenced entities exist before creating relations

### Code Quality
- [ ] Use `strict` TypeScript where possible
- [ ] Run `npm run lint` before every commit
- [ ] Write unit tests for services, E2E tests for critical flows
- [ ] Use enums for status fields (booking status, order status, payment status)
- [ ] Never return passwords or token hashes in API responses

### Enums

**`src/common/constants/booking-status.enum.ts`**

```typescript
export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  COMPLETED = 'Completed',       // After QR verification
  CANCELLED = 'Cancelled',
}
```

**`src/common/constants/order-status.enum.ts`**

```typescript
export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}
```

**`src/common/constants/payment-status.enum.ts`**

```typescript
export enum PaymentStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  REFUNDED = 'Refunded',
}
```

---

## Phase 2 Features (Optional — Implement After Core is Stable)

These are features that are NOT part of the initial implementation but should be built once the core is working:

### 1. Seat Locking

```
POST /api/bookings/lock-seats
Payload: { showtimeId, seatIds }
Response: 200 OK (locked for 10 minutes) or 409 Conflict

Implementation:
- Add a `seat_locks` table: { lockId, showtimeId, seatId, userId, expiresAt }
- Before booking, check for active locks by other users
- Use a scheduled task (CRON) to clean up expired locks
- Check locks in the seat availability endpoint
```

### 2. Email Notifications
- Send confirmation emails after booking/payment
- Password reset flow

### 3. Admin Registration
- Currently admin accounts should be seeded directly in the DB
- A super-admin registration flow can be added later

### 4. Pagination
- Add `page` and `limit` query params to all list endpoints
- Return `{ data, total, page, limit, totalPages }` shape

---

> **Final Note:** This document is your single source of truth. If something here conflicts with the original `.prompt/` files, **this document takes precedence**. The original files contain known errors that have been corrected here.
