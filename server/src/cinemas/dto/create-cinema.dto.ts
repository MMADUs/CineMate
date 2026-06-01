import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCinemaDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'CGV Grand Indonesia' })
  cinemaName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Grand Indonesia, Jakarta' })
  location: string;
}
