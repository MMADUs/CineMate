import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingDetailResponseDto } from '../../bookings/dto/booking-response.dto';
import { PaymentResponseDto } from '../../payments/dto/payment-response.dto';
import { UserProfileResponseDto } from '../../users/dto/user-response.dto';

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

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  bookingId: string | null;

  @ApiProperty({ example: '2026-05-23 10:00:00' })
  orderDate: string;

  @ApiProperty({ example: '9900' })
  taxAmount: string;

  @ApiProperty({ example: '99900' })
  totalAmount: string;

  @ApiProperty({ example: 'PendingPayment' })
  orderStatus: string;

  @ApiProperty({ type: [FnbOrderItemResponseDto] })
  items: FnbOrderItemResponseDto[];

  @ApiPropertyOptional({ type: PaymentResponseDto, nullable: true })
  payment?: PaymentResponseDto | null;

  @ApiPropertyOptional({ type: BookingDetailResponseDto, nullable: true })
  booking?: BookingDetailResponseDto | null;
}

export class FnbOrderCheckoutResponseDto {
  @ApiProperty({ type: FnbOrderResponseDto })
  order: FnbOrderResponseDto;

  @ApiProperty({ type: PaymentResponseDto })
  payment: PaymentResponseDto;
}

export class AdminFnbOrderResponseDto extends FnbOrderResponseDto {
  @ApiProperty({ type: UserProfileResponseDto })
  user: UserProfileResponseDto;
}
