import { IsIn, IsOptional } from 'class-validator';

export class QuerySnackDto {
  @IsOptional()
  @IsIn(['Snack', 'Drink', 'Combo'])
  category?: string;
}
