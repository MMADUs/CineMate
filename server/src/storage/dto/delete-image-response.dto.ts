import { ApiProperty } from '@nestjs/swagger';

export class DeleteImageResponseDto {
  @ApiProperty({ example: 'movies/4f8f4f86-a5db-47fd-81ea-3f0a92f8e9a1.webp' })
  key: string;

  @ApiProperty({ example: true })
  deleted: boolean;
}
