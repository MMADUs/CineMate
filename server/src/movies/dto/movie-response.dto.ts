import { ApiProperty } from '@nestjs/swagger';

export class MovieResponseDto {
  @ApiProperty({ example: 1 })
  movieId: number;

  @ApiProperty({ example: 'Interstellar' })
  title: string;

  @ApiProperty({ example: 'A team travels through a wormhole in space.' })
  description: string;

  @ApiProperty({ example: 'Sci-Fi' })
  genre: string;

  @ApiProperty({ example: 'PG-13' })
  ageRate: string;

  @ApiProperty({ example: 169 })
  durationMinutes: number;

  @ApiProperty({ example: 'https://example.com/poster.jpg' })
  posterUrl: string;

  @ApiProperty({ example: 'https://youtube.com/watch?v=example' })
  trailerUrl: string;

  @ApiProperty({ example: '2026-05-01' })
  releaseDate: string;

  @ApiProperty({ example: '2026-06-01' })
  endDate: string;

  @ApiProperty({ example: 'NOW_PLAYING' })
  status: string;
}
