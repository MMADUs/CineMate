import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class QueryShowtimeDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({ example: 1 })
  movieId?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '2026-05-23' })
  showDate?: string;
}
