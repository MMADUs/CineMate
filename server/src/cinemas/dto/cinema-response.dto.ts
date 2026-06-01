import { ApiProperty } from '@nestjs/swagger';

export class CinemaResponseDto {
  @ApiProperty({ example: 1 })
  cinemaId: number;

  @ApiProperty({ example: 'CGV Grand Indonesia' })
  cinemaName: string;

  @ApiProperty({ example: 'Grand Indonesia, Jakarta' })
  location: string;
}
