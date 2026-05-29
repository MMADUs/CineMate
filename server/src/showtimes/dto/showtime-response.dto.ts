import { ApiProperty } from '@nestjs/swagger';
import { HallResponseDto } from '../../cinema-halls/dto/hall-response.dto';

export class ShowtimeResponseDto {
  @ApiProperty({ example: 1 })
  showtimeId: number;

  @ApiProperty({ example: 1 })
  movieId: number;

  @ApiProperty({ example: 1 })
  hallId: number;

  @ApiProperty({ example: '2026-05-23' })
  showDate: string;

  @ApiProperty({ example: '19:30' })
  showTime: string;

  @ApiProperty({ example: '50000' })
  price: string;
}

export class ShowtimeSeatResponseDto {
  @ApiProperty({ example: 1 })
  seatId: number;

  @ApiProperty({ example: 1 })
  hallId: number;

  @ApiProperty({ example: 'A' })
  rowLetter: string;

  @ApiProperty({ example: 1 })
  seatNumber: number;

  @ApiProperty({ example: false })
  isOccupied: boolean;
}

export class ShowtimeSeatsResponseDto {
  @ApiProperty({ type: HallResponseDto })
  hall: HallResponseDto;

  @ApiProperty({ type: [ShowtimeSeatResponseDto] })
  seats: ShowtimeSeatResponseDto[];
}
