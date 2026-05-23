import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

class FnbOrderItemDto {
  @Type(() => Number) 
  @IsInt() 
  snackId: number;

  @Type(() => Number) 
  @IsInt() 
  @Min(1) 
  quantity: number;
}

export class CreateFnbOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FnbOrderItemDto)
  items: FnbOrderItemDto[];
}
