import { BookingResponseDto } from '../../bookings/dto/booking-response.dto';
import { FnbOrderResponseDto } from '../../fnb-orders/dto/fnb-order-response.dto';
import { PaymentResponseDto } from '../../payments/dto/payment-response.dto';

export class AdminResponseDto {
  adminId: number;
  username: string;
  email: string;
}

export class AdminRefreshResponseDto {
  adminId: number;
  username: string;
  email: string;
}

export class AdminLogoutResponseDto {
  message: string;
}

export class DashboardMetricsResponseDto {
  totalRevenue: number;
  ticketsSold: number;
  pendingOrders: number;
  activeMoviesCount: number;
}

export class DashboardChartPointResponseDto {
  name: string;
  total: number;
}

export class AdminTransactionsResponseDto {
  bookings: BookingResponseDto[];
  fnbOrders: Omit<FnbOrderResponseDto, 'items'>[];
  payments: PaymentResponseDto[];
}

export class AdminLogResponseDto {
  logId: number;
  adminId: number;
  action: string;
  entity: string;
  entityId: string;
  details: string | null;
  createdAt: string;
}

export interface AdminTokenPair {
  accessToken: string;
  refreshToken: string;
}
