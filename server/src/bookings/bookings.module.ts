import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [StorageModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
