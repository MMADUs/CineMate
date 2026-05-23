import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  showtimeId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  seatIds: number[];
}
