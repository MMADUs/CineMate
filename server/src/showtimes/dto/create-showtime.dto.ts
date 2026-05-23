import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateShowtimeDto {
  @Type(() => Number) 
  @IsInt() 
  movieId: number;

  @Type(() => Number) 
  @IsInt() 
  hallId: number;

  @IsString() 
  @IsNotEmpty() 
  showDate: string;

  @IsString() 
  @IsNotEmpty() 
  showTime: string;

  @Type(() => Number) 
  @IsNumber() 
  @Min(0) 
  price: number;
}
