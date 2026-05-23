import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateHallDto {
  @IsString() 
  @IsNotEmpty() 
  cinemaName: string;

  @IsString() 
  @IsNotEmpty() 
  studioName: string;

  @Type(() => Number) 
  @IsInt() 
  @Min(1) 
  @Max(26) 
  totalRows: number;

  @Type(() => Number) 
  @IsInt() 
  @Min(1) 
  @Max(50) 
  seatsPerRow: number;
}
