import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({ example: 1 })
  paymentId: number;

  @ApiPropertyOptional({ example: 'booking-uuid', nullable: true })
  bookingId: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  fnbOrderId: string | null;

  @ApiProperty({ example: 'XENDIT' })
  provider: string;

  @ApiPropertyOptional({ example: '6748105a77f16ebe0cc583a7', nullable: true })
  providerPaymentId: string | null;

  @ApiProperty({ example: 'pay_6fb45aa8-d13d-4f9b-b0a2-3db83cd8d50a' })
  externalId: string;

  @ApiPropertyOptional({
    example: 'https://checkout-staging.xendit.co/web/6748105a77f16ebe0cc583a7',
    nullable: true,
  })
  invoiceUrl: string | null;

  @ApiProperty({ example: 'XENDIT_INVOICE' })
  paymentMethod: string;

  @ApiProperty({ example: '111000' })
  amount: string;

  @ApiProperty({ example: 'IDR' })
  currency: string;

  @ApiProperty({ example: '2026-05-23 10:00:00' })
  paymentDate: string;

  @ApiProperty({ example: 'Pending' })
  paymentStatus: string;

  @ApiPropertyOptional({ example: '2026-05-23T10:05:00.000Z', nullable: true })
  paidAt: string | null;

  @ApiPropertyOptional({ example: '2026-05-24T10:00:00.000Z', nullable: true })
  expiresAt: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  failureReason: string | null;
}

export class CreatePaymentResponseDto extends PaymentResponseDto {
  @ApiProperty({
    example: 'https://checkout-staging.xendit.co/web/6748105a77f16ebe0cc583a7',
  })
  declare invoiceUrl: string;
}

export class PaymentWebhookResponseDto {
  @ApiProperty({ example: true })
  received: boolean;

  @ApiProperty({ example: 'Completed' })
  paymentStatus: string;
}
