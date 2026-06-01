import { ApiProperty } from '@nestjs/swagger';

export class StudioResponseDto {
  @ApiProperty({ example: 1 })
  studioId: number;

  @ApiProperty({ example: 1 })
  cinemaId: number;

  @ApiProperty({ example: 'Studio 1' })
  studioName: string;

  @ApiProperty({ example: 8 })
  totalRows: number;

  @ApiProperty({ example: 12 })
  seatsPerRow: number;
}

export interface GeneratedSeatValue {
  studioId: number;
  rowLetter: string;
  seatNumber: number;
}
