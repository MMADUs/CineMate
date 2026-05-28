import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UploadImageDto {
  @IsIn(['movies', 'snacks'])
  @ApiProperty({ example: 'movies', enum: ['movies', 'snacks'] })
  folder: 'movies' | 'snacks';
}
