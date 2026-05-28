import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { CinemaHallsModule } from './cinema-halls/cinema-halls.module';
import { AppLoggingModule } from './common/logging/app-logging.module';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { FnbOrdersModule } from './fnb-orders/fnb-orders.module';
import { IdempotencyModule } from './common/idempotency/idempotency.module';
import { MoviesModule } from './movies/movies.module';
import { PaymentsModule } from './payments/payments.module';
import { ShowtimesModule } from './showtimes/showtimes.module';
import { SnacksModule } from './snacks/snacks.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    DatabaseModule,
    AppLoggingModule,
    IdempotencyModule,
    AuthModule,
    UsersModule,
    MoviesModule,
    CinemaHallsModule,
    ShowtimesModule,
    BookingsModule,
    SnacksModule,
    FnbOrdersModule,
    PaymentsModule,
    StorageModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
