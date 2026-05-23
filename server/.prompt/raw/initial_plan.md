# CineMate Server Implementation Plan

## 1. Project Goal

Build a production-ready NestJS backend for CineMate with:

- REST API architecture
- SQLite for faster prototyping
- Drizzle ORM
- Secure JWT authentication
- Access token + refresh token flow
- HttpOnly cookie-based token storage
- DTO validation
- Rate limiting
- Helmet security headers
- Clean module-based structure

---

## 2. Recommended Tech Stack

| Area | Tool |
|---|---|
| Backend Framework | NestJS |
| Language | TypeScript |
| Database | SQLite |
| ORM | Drizzle |
| Authentication | JWT + Passport |
| Password Hashing | Argon2 |
| Token Storage | HttpOnly Secure Cookies |
| Validation | class-validator + class-transformer |
| Config | @nestjs/config |
| Security Headers | helmet |
| Rate Limiting | @nestjs/throttler |

---

## 3. Initial Setup

### 3.1 Install core dependencies

```bash
npm install @nestjs/config
npm install class-validator class-transformer
npm install cookie-parser helmet
npm install @nestjs/throttler
```

---

### 3.2 Install auth dependencies

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install argon2
npm install -D @types/passport-jwt @types/cookie-parser
```

---

### 3.3 Install Prisma

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

---

## 4. Environment Variables

Create `.env`:

```env
PORT=3000

DATABASE_URL="postgresql://username:password@localhost:5432/cinemate"

CLIENT_URL="http://localhost:5173"

JWT_ACCESS_SECRET="replace-with-strong-access-secret"
JWT_REFRESH_SECRET="replace-with-strong-refresh-secret"

JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

NODE_ENV="development"
```

Important:

- Do not commit `.env`.
- Use different secrets for access and refresh tokens.
- Use strong random secrets in production.

---

## 5. Main Security Setup

In `main.ts`, configure global security:

```ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
```

---

## 6. Authentication Design

Use two tokens:

| Token | Lifetime | Purpose |
|---|---:|---|
| Access Token | 5–15 minutes | Access protected routes |
| Refresh Token | 7–30 days | Generate new access token |

Recommended default:

```txt
accessToken: 15 minutes
refreshToken: 7 days
```

---

## 7. Token Storage Strategy

For a web app, use cookies:

```txt
access_token  -> HttpOnly, Secure, SameSite=Lax
refresh_token -> HttpOnly, Secure, SameSite=Lax
```

Do not store JWTs in `localStorage` if you want better security against token theft from XSS.

---

## 8. Password and Refresh Token Hashing

Use Argon2.

Passwords:

```txt
raw password -> Argon2 hash -> store in database
```

Refresh tokens:

```txt
raw refresh token -> Argon2 hash -> store in database
```

Never store raw passwords or raw refresh tokens.

---

## 9. Drizzle Schema

The drizzle schema can be seen at `src/schema.ts` (THIS IS TEMPORARY LOCATION, PLEASE MOVE IT TO MORE PROPER LOCATION FOR THIS PROJECT)

---

## 10. Auth API Endpoints

### Public routes

```txt
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

### Protected routes

```txt
GET /auth/me
GET /users/me
```

---

## 11. Auth Flow

### Register

```txt
1. Validate request body.
2. Check whether email already exists.
3. Hash password with Argon2.
4. Create user.
5. Generate access token and refresh token.
6. Hash refresh token and save it to database.
7. Send tokens as HttpOnly cookies.
8. Return safe user data.
```

---

### Login

```txt
1. Validate request body.
2. Find user by email.
3. Verify password with Argon2.
4. Generate access token and refresh token.
5. Hash new refresh token and save it to database.
6. Send tokens as HttpOnly cookies.
7. Return safe user data.
```

---

### Refresh

```txt
1. Read refresh token from HttpOnly cookie.
2. Verify refresh token JWT.
3. Find user by token payload.
4. Compare raw refresh token against stored refreshTokenHash.
5. If valid, rotate refresh token.
6. Issue new access token and new refresh token.
7. Save new refresh token hash.
8. Send new cookies.
```

Important:

- Refresh token should be rotated every time.
- If refresh token reuse is detected, clear the stored refresh token and force login again.

---

### Logout

```txt
1. Clear refreshTokenHash from database.
2. Clear access_token cookie.
3. Clear refresh_token cookie.
4. Return success response.
```

---

## 12. Guards

Use guards to protect routes:

```ts
@UseGuards(JwtAccessGuard)
@Get('me')
getMe(@CurrentUser() user: JwtPayload) {
  return user;
}
```

Recommended guards:

```txt
JwtAccessGuard   -> protects normal private routes
JwtRefreshGuard  -> protects refresh route
RolesGuard       -> protects admin-only routes
```

---

## 13. Rate Limiting

Protect sensitive routes:

```txt
POST /auth/login
POST /auth/register
POST /auth/refresh
```

Use `@nestjs/throttler`.

Example policy:

```txt
Login: 5 attempts per minute
Register: 3 attempts per minute
Refresh: 10 attempts per minute
```

---

## 14. Cookie Configuration

Recommended helper:

```ts
const isProduction = process.env.NODE_ENV === 'production';

res.cookie('access_token', accessToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000,
});

res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

For production with HTTPS:

```txt
secure: true
```


