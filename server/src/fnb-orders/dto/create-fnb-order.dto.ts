import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 1 })
  snackId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 2 })
  quantity: number;
}

export class CreateFnbOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FnbOrderItemDto)
  @ApiProperty({ type: [FnbOrderItemDto] })
  items: FnbOrderItemDto[];
}
