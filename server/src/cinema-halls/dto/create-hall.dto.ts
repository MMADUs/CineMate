import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateHallDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'CGV Grand Indonesia' })
  cinemaName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Studio 1' })
  studioName: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(26)
  @ApiProperty({ example: 8 })
  totalRows: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 12 })
  seatsPerRow: number;
}
