import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class QuerySnackDto {
  @IsOptional()
  @IsIn(['Snack', 'Drink', 'Combo'])
  @ApiPropertyOptional({ example: 'Drink', enum: ['Snack', 'Drink', 'Combo'] })
  category?: string;
}
