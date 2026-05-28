import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: 1 })
  userId: number;

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
