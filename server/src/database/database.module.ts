import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { DRIZZLE } from './database.constants';
import * as relations from './relations';
import * as schema from './schema';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // db path
        const dbPath =
          configService.get<string>('DATABASE_URL') ?? './data/cinemate.db';
        // resolved path
        const resolvedPath = resolve(dbPath);
        // make directory if not exists
        mkdirSync(dirname(resolvedPath), { recursive: true });

        // new sqlite db
        const sqlite = new Database(resolvedPath);
        // foreign keys
        sqlite.pragma('foreign_keys = ON');

        // drizzle
        return drizzle(sqlite, { schema: { ...schema, ...relations } });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
