import { ApiProperty } from '@nestjs/swagger';

export class HallResponseDto {
  @ApiProperty({ example: 1 })
  hallId: number;

  @ApiProperty({ example: 'CGV Grand Indonesia' })
  cinemaName: string;

  @ApiProperty({ example: 'Studio 1' })
  studioName: string;

  @ApiProperty({ example: 8 })
  totalRows: number;
  
  @ApiProperty({ example: 12 })
  seatsPerRow: number;
}

export interface GeneratedSeatValue {
  hallId: number;
  rowLetter: string;
  seatNumber: number;
}
