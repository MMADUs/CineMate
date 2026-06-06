import { ApiProperty } from '@nestjs/swagger';
import { ShowtimeResponseDto } from '../../showtimes/dto/showtime-response.dto';
import { CinemaResponseDto } from '../../cinemas/dto/cinema-response.dto';
import { StudioResponseDto } from '../../studios/dto/studio-response.dto';

export class MovieShowtimeStudioResponseDto extends StudioResponseDto {
  @ApiProperty({ type: CinemaResponseDto })
  cinema: CinemaResponseDto;
}

export class MovieShowtimeResponseDto extends ShowtimeResponseDto {
  @ApiProperty({ type: MovieShowtimeStudioResponseDto })
  studio: MovieShowtimeStudioResponseDto;
}

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

  @ApiProperty({
    example: 'movies/4f8f4f86-a5db-47fd-81ea-3f0a92f8e9a1.webp',
  })
  imageKey: string;

  @ApiProperty({
    example:
      'http://localhost:3000/api/assets/images/movies/4f8f4f86-a5db-47fd-81ea-3f0a92f8e9a1.webp',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({ example: 'https://youtube.com/watch?v=example' })
  trailerUrl: string;

  @ApiProperty({ example: '2026-05-01' })
  releaseDate: string;

  @ApiProperty({ example: '2026-06-01' })
  endDate: string;

  @ApiProperty({ example: 'NOW_PLAYING' })
  status: string;
}

export class MovieDetailResponseDto extends MovieResponseDto {
  @ApiProperty({ type: [MovieShowtimeResponseDto] })
  showtimes: MovieShowtimeResponseDto[];
}
