import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class XenditInvoiceWebhookDto {
  @ApiProperty({ example: '6748105a77f16ebe0cc583a7' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'pay_6fb45aa8-d13d-4f9b-b0a2-3db83cd8d50a' })
  @IsString()
  external_id: string;

  @ApiProperty({
    example: 'PAID',
    enum: ['PENDING', 'PAID', 'SETTLED', 'EXPIRED'],
  })
  @IsString()
  status: string;

  @ApiProperty({ example: 111000 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 111000 })
  @IsOptional()
  @IsNumber()
  paid_amount?: number;

  @ApiPropertyOptional({ example: '2026-05-23T10:05:00.000Z' })
  @IsOptional()
  @IsString()
  paid_at?: string;

  @ApiPropertyOptional({ example: 'EWALLET' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({ example: 'OVO' })
  @IsOptional()
  @IsString()
  payment_channel?: string;

  @ApiPropertyOptional({ example: 'Payment expired' })
  @IsOptional()
  @IsString()
  failure_reason?: string;

  @ApiPropertyOptional({ example: '6a1935e7361fddbd9033d8a7' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ example: 'Nizwa Apps' })
  @IsOptional()
  @IsString()
  merchant_name?: string;

  @ApiPropertyOptional({ example: 'CineMate booking booking-uuid' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_high?: boolean;

  @ApiPropertyOptional({ example: 'http://localhost:5173/payment/success' })
  @IsOptional()
  @IsString()
  success_redirect_url?: string;

  @ApiPropertyOptional({ example: 'http://localhost:5173/payment/failed' })
  @IsOptional()
  @IsString()
  failure_redirect_url?: string;

  @ApiPropertyOptional({ example: '2026-05-31T06:27:51.444Z' })
  @IsOptional()
  @IsString()
  created?: string;

  @ApiPropertyOptional({ example: '2026-05-31T06:28:21.476Z' })
  @IsOptional()
  @IsString()
  updated?: string;

  @ApiPropertyOptional({ example: 'IDR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'PERMATA' })
  @IsOptional()
  @IsString()
  bank_code?: string;

  @ApiPropertyOptional({ example: '888888888888' })
  @IsOptional()
  @IsString()
  payment_destination?: string;

  @ApiPropertyOptional({ example: 'wildan@xendit.co' })
  @IsOptional()
  @IsString()
  payer_email?: string;

  @ApiPropertyOptional({ example: 47500 })
  @IsOptional()
  @IsNumber()
  adjusted_received_amount?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  fees_paid_amount?: number;

  @ApiPropertyOptional({ example: 'ewc_e2d86ef5-62ec-47c3-87f5-707dbbc9e966' })
  @IsOptional()
  @IsString()
  payment_id?: string;

  @ApiPropertyOptional({ example: 'pm-6e722d45-285e-4c12-b749-083438e45b4d' })
  @IsOptional()
  @IsString()
  payment_method_id?: string;

  @ApiPropertyOptional({ example: 'GOPAY' })
  @IsOptional()
  @IsString()
  ewallet_type?: string;
}
