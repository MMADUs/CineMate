import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FnbOrderItemResponseDto {
  @ApiProperty({ example: 1 })
  snackId: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: '90000' })
  subTotalPrice: string;
}

export class FnbOrderResponseDto {
  @ApiProperty({ example: 'fnb-order-uuid' })
  fnbOrderId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiPropertyOptional({ example: 1, nullable: true })
  showtimeId: number | null;

  @ApiProperty({ example: '2026-05-23 10:00:00' })
  orderDate: string;

  @ApiProperty({ example: '9900' })
  taxAmount: string;

  @ApiProperty({ example: '99900' })
  totalAmount: string;

  @ApiProperty({ example: 'Pending' })
  orderStatus: string;

  @ApiProperty({ type: [FnbOrderItemResponseDto] })
  items: FnbOrderItemResponseDto[];
}
