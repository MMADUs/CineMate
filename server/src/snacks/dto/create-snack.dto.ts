import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSnackDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Caramel Popcorn' })
  snackName: string;

  @IsIn(['Snack', 'Drink', 'Combo'])
  @ApiProperty({ example: 'Snack', enum: ['Snack', 'Drink', 'Combo'] })
  category: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 45000 })
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 100 })
  stock: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'snacks/4f8f4f86-a5db-47fd-81ea-3f0a92f8e9a1.webp',
  })
  imageKey?: string;
}
