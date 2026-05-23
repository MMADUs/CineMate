import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateShowtimeDto {
  @Type(() => Number)
  @IsInt()
  @ApiProperty({ example: 1 })
  movieId: number;

  @Type(() => Number)
  @IsInt()
  @ApiProperty({ example: 1 })
  hallId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '2026-05-23' })
  showDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '19:30' })
  showTime: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 50000 })
  price: number;
}
