import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class QueryShowtimeDto {
  @IsOptional() 
  @Type(() => Number) 
  @IsInt() 
  movieId?: number;

  @IsOptional() 
  @IsString() 
  showDate?: string;
}
