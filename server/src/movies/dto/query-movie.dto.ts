import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryMovieDto {
  @IsOptional()
  @IsIn(['NOW_PLAYING', 'UPCOMING'])
  @ApiPropertyOptional({
    example: 'NOW_PLAYING',
    enum: ['NOW_PLAYING', 'UPCOMING'],
  })
  status?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'interstellar' })
  search?: string;
}
