import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'mysql://cinemate:cinemate@localhost:3306/cinemate',
  },
});
