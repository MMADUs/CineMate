import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
import { resolve } from 'node:path';

const databaseUrl =
  process.env.DATABASE_URL ??
  'mysql://cinemate:cinemate@localhost:3306/cinemate';
const migrationsFolder = resolve(
  process.env.DRIZZLE_MIGRATIONS_DIR ?? './drizzle',
);

const pool = createPool({
  uri: databaseUrl,
  waitForConnections: true,
  connectionLimit: 1,
});

async function main(): Promise<void> {
  const db = drizzle(pool, { mode: 'default' });

  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await pool.end();
  }

  console.log('Database migrations applied');
}

void main();
