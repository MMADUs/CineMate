import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsIn } from 'class-validator';

export class UploadImageDto {
  @IsIn(['movies', 'snacks'])
  @ApiProperty({ example: 'movies', enum: ['movies', 'snacks'] })
  folder: 'movies' | 'snacks';

  @Allow()
  file?: unknown;
}
