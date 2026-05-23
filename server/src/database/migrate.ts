import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// Database path
const dbPath = resolve(process.env.DATABASE_URL ?? './data/cinemate.db');

// Migrations folder
const migrationsFolder = resolve(
  process.env.DRIZZLE_MIGRATIONS_DIR ?? './drizzle',
);

// Create directory if not exists
mkdirSync(dirname(dbPath), { recursive: true });

// New sqlite db
const sqlite = new Database(dbPath);
// Foreign keys
sqlite.pragma('foreign_keys = ON');

// Drizzle instance
const db = drizzle(sqlite);

// Run migrations
migrate(db, { migrationsFolder });

sqlite.close();

console.log(`Database migrations applied: ${dbPath}`);
