import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { admins } from './schema';

loadEnv({ path: resolve(process.cwd(), '.env'), override: true });

const databaseUrl =
  process.env.DATABASE_URL ??
  'mysql://cinemate:cinemate@localhost:3306/cinemate';
const username = process.env.ADMIN_USERNAME ?? 'admin';
const email = process.env.ADMIN_EMAIL ?? 'admin@cinemate.local';
const password = process.env.ADMIN_PASSWORD ?? 'Admin@123456';
const forceUpdate = process.env.ADMIN_SEED_FORCE_UPDATE === 'true';

async function main() {
  const pool = createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 1,
  });
  const db = drizzle(pool, { mode: 'default' });

  try {
    const [existingAdmin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email));

    if (!existingAdmin) {
      await db.insert(admins).values({
        username,
        email,
        password: await argon2.hash(password),
      });
      console.log(`Seeded admin account: ${email}`);
    } else if (forceUpdate) {
      await db
        .update(admins)
        .set({
          username,
          password: await argon2.hash(password),
        })
        .where(eq(admins.email, email));
      console.log(`Updated seeded admin account: ${email}`);
    } else {
      console.log(`Admin account already exists: ${email}`);
    }
  } finally {
    await pool.end();
  }
}

void main();
