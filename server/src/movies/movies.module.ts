import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

@Module({
  imports: [StorageModule],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
