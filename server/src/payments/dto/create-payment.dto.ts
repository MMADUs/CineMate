import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsOptional() @IsString() bookingId?: string;
  @IsOptional() @IsString() fnbOrderId?: string;
  @IsString() @IsNotEmpty() paymentMethod: string;
}
