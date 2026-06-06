import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiPropertyOptional({
    description:
      'Booking ID to pay. Provide exactly one of bookingId or fnbOrderId.',
    example: 'e4d5e3a4-2f4e-4a5d-9a68-0d328fa2a111',
  })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({
    description:
      'F&B order ID to pay. Provide exactly one of bookingId or fnbOrderId.',
    example: 'e4d5e3a4-2f4e-4a5d-9a68-0d328fa2a222',
  })
  @IsOptional()
  @IsString()
  fnbOrderId?: string;

  @ApiProperty({
    description:
      'Checkout channel label. Xendit hosted checkout still lets the user choose the final channel.',
    example: 'XENDIT_INVOICE',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}
