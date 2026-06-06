import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1 })
  showtimeId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @ApiProperty({ example: [1, 2] })
  seatIds: number[];
}
