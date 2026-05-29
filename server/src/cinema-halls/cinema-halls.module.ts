import { Module } from '@nestjs/common';
import { CinemaHallsController } from './cinema-halls.controller';
import { CinemaHallsService } from './cinema-halls.service';

@Module({
  controllers: [CinemaHallsController],
  providers: [CinemaHallsService],
})
export class CinemaHallsModule {}
