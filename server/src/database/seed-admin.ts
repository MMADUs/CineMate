import Database from 'better-sqlite3';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { admins } from './schema';

// Database path
const dbPath = resolve(process.env.DATABASE_URL ?? './data/cinemate.db');

// Admin credentials
const username = process.env.ADMIN_USERNAME ?? 'admin';
const email = process.env.ADMIN_EMAIL ?? 'admin@cinemate.local';
const password = process.env.ADMIN_PASSWORD ?? 'Admin@123456';

// Force update flag
const forceUpdate = process.env.ADMIN_SEED_FORCE_UPDATE === 'true';

mkdirSync(dirname(dbPath), { recursive: true });

async function main() {
  // new sqlite db connection
  const sqlite = new Database(dbPath);
  sqlite.pragma('foreign_keys = ON');

  // new drizzle instance
  const db = drizzle(sqlite);

  // check if admin exists
  const existingAdmin = db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .get();

  // if admin doesn't exist, seed it
  if (!existingAdmin) {
    db.insert(admins)
      .values({
        username,
        email,
        password: await argon2.hash(password),
      })
      .run();

    console.log(`Seeded admin account: ${email}`);
  // else if forceUpdate is true, update admin
  } else if (forceUpdate) {
    db.update(admins)
      .set({
        username,
        password: await argon2.hash(password),
      })
      .where(eq(admins.email, email))
      .run();

    console.log(`Updated seeded admin account: ${email}`);
  } else {
    console.log(`Admin account already exists: ${email}`);
  }

  sqlite.close();
}

void main();
