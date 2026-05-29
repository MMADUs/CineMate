import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty({ example: 'movies/4f8f4f86-a5db-47fd-81ea-3f0a92f8e9a1.webp' })
  key: string;

  @ApiProperty({
    example:
      'http://localhost:3000/api/assets/images/movies/4f8f4f86-a5db-47fd-81ea-3f0a92f8e9a1.webp',
  })
  url: string;

  @ApiProperty({ example: 'image/webp' })
  contentType: string;

  @ApiProperty({ example: 124512 })
  size: number;
}
