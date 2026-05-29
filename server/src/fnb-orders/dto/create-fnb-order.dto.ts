import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
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
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 1,
    description:
      'Optional showtime ID when the snack purchase is connected to a movie watch.',
  })
  showtimeId?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FnbOrderItemDto)
  @ApiProperty({ type: [FnbOrderItemDto] })
  items: FnbOrderItemDto[];
}
