import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
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
        const databaseUrl =
          configService.get<string>('DATABASE_URL') ??
          'mysql://cinemate:cinemate@localhost:3306/cinemate';

        const pool = createPool({
          uri: databaseUrl,
          waitForConnections: true,
          connectionLimit: Number(
            configService.get<number>('DATABASE_POOL_SIZE') ?? 10,
          ),
        });

        return drizzle(pool, {
          schema: { ...schema, ...relations },
          mode: 'default',
        });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
