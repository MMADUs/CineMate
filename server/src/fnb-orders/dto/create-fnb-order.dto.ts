import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
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
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description:
      'Optional booking ID when the snack purchase is connected to a movie booking.',
  })
  bookingId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FnbOrderItemDto)
  @ApiProperty({ type: [FnbOrderItemDto] })
  items: FnbOrderItemDto[];
}
