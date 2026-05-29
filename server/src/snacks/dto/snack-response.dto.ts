import { ApiProperty } from '@nestjs/swagger';

export class SnackResponseDto {
  @ApiProperty({ example: 1 })
  snackId: number;

  @ApiProperty({ example: 'Caramel Popcorn' })
  snackName: string;

  @ApiProperty({ example: 'Snack' })
  category: string;

  @ApiProperty({ example: '45000' })
  price: string;

  @ApiProperty({ example: 100 })
  stock: number;

  @ApiProperty({
    example: 'snacks/4f8f4f86-a5db-47fd-81ea-3f0a92f8e9a1.webp',
  })
  imageKey: string;

  @ApiProperty({
    example:
      'http://localhost:3000/api/assets/images/snacks/4f8f4f86-a5db-47fd-81ea-3f0a92f8e9a1.webp',
    nullable: true,
  })
  imageUrl: string | null;
}
