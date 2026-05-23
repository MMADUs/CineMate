import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingResponseDto } from '../../bookings/dto/booking-response.dto';
import { FnbOrderResponseDto } from '../../fnb-orders/dto/fnb-order-response.dto';
import { PaymentResponseDto } from '../../payments/dto/payment-response.dto';

export class AdminResponseDto {
  @ApiProperty({ example: 1 })
  adminId: number;

  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;
}

export class AdminRefreshResponseDto {
  @ApiProperty({ example: 1 })
  adminId: number;

  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;
}

export class AdminLogoutResponseDto {
  @ApiProperty({ example: 'Logged out' })
  message: string;
}

export class DashboardMetricsResponseDto {
  @ApiProperty({ example: 45000000 })
  totalRevenue: number;

  @ApiProperty({ example: 320 })
  ticketsSold: number;

  @ApiProperty({ example: 12 })
  pendingOrders: number;

  @ApiProperty({ example: 8 })
  activeMoviesCount: number;
}

export class DashboardChartPointResponseDto {
  @ApiProperty({ example: '2026-05-23' })
  name: string;

  @ApiProperty({ example: 4500000 })
  total: number;
}

export class AdminTransactionsResponseDto {
  @ApiProperty({ type: [BookingResponseDto] })
  bookings: BookingResponseDto[];

  @ApiProperty({ type: [FnbOrderResponseDto] })
  fnbOrders: Omit<FnbOrderResponseDto, 'items'>[];

  @ApiProperty({ type: [PaymentResponseDto] })
  payments: PaymentResponseDto[];
}

export class AdminLogResponseDto {
  @ApiProperty({ example: 1 })
  logId: number;

  @ApiProperty({ example: 1 })
  adminId: number;

  @ApiProperty({ example: 'CREATE_MOVIE' })
  action: string;

  @ApiProperty({ example: 'Movie' })
  entity: string;

  @ApiProperty({ example: '1' })
  entityId: string;

  @ApiPropertyOptional({ example: '{"title":"Interstellar"}', nullable: true })
  details: string | null;
  
  @ApiProperty({ example: '2026-05-23 10:00:00' })
  createdAt: string;
}

export interface AdminTokenPair {
  accessToken: string;
  refreshToken: string;
}
