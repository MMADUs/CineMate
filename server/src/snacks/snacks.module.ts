import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { SnacksController } from './snacks.controller';
import { SnacksService } from './snacks.service';

@Module({
  imports: [StorageModule],
  controllers: [SnacksController],
  providers: [SnacksService],
})
export class SnacksModule {}
