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
  snackName: string;

  @IsIn(['Snack', 'Drink', 'Combo']) 
  category: string;

  @Type(() => Number) 
  @IsNumber() 
  @Min(0) 
  price: number;

  @IsString() 
  @IsOptional() 
  imageUrl?: string;
}
