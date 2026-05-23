import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

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
}
