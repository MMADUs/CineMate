import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Interstellar' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'A team travels through a wormhole in space.' })
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Sci-Fi' })
  genre: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'PG-13' })
  ageRate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 169 })
  durationMinutes: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'https://example.com/poster.jpg' })
  posterUrl?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=example' })
  trailerUrl?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '2026-05-01' })
  releaseDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '2026-06-01' })
  endDate: string;

  @IsIn(['NOW_PLAYING', 'UPCOMING'])
  @ApiProperty({ example: 'NOW_PLAYING', enum: ['NOW_PLAYING', 'UPCOMING'] })
  status: string;
}
