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

  @ApiProperty({ example: 'https://example.com/popcorn.jpg' })
  imageUrl: string;
}
