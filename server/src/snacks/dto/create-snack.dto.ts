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

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'https://example.com/popcorn.jpg' })
  imageUrl?: string;
}
