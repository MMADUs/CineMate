import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryMovieDto {
  @IsOptional()
  @IsIn(['NOW_PLAYING', 'UPCOMING'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
