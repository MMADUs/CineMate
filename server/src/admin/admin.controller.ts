import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { AdminRefreshGuard } from '../common/guards/admin-refresh.guard';
import type { AuthAdmin } from '../common/interfaces/auth-user.interface';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import {
  AdminLogResponseDto,
  AdminLogoutResponseDto,
  AdminRefreshResponseDto,
  AdminResponseDto,
  AdminTransactionsResponseDto,
  DashboardChartPointResponseDto,
  DashboardMetricsResponseDto,
} from './dto/admin-response.dto';
import { BookingResponseDto } from '../bookings/dto/booking-response.dto';
import { FnbOrderResponseDto } from '../fnb-orders/dto/fnb-order-response.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /* Admin Login Controller
   * @desc: Login an admin
   * @route: /admin/auth/login
   * @param: AdminLoginDto, Response
   * @returns: Promise<AdminResponseDto>
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AdminResponseDto> {
    return this.adminService.login(dto, res);
  }

  /* Admin Refresh Controller
   * @desc: Refresh admin access token
   * @route: /admin/auth/refresh
   * @param: AuthAdmin, Response
   * @returns: Promise<AdminRefreshResponseDto>
   */
  @UseGuards(AdminRefreshGuard)
  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @CurrentAdmin() admin: AuthAdmin,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AdminRefreshResponseDto> {
    return this.adminService.refresh(admin, res);
  }

  /* Admin Logout Controller
   * @desc: Logout an admin
   * @route: /admin/auth/logout
   * @param: AuthAdmin, Response
   * @returns: AdminLogoutResponseDto
   */
  @UseGuards(AdminJwtGuard)
  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @CurrentAdmin() admin: AuthAdmin,
    @Res({ passthrough: true }) res: Response,
  ): AdminLogoutResponseDto {
    return this.adminService.logout(admin, res);
  }

  /* Admin Profile Controller
   * @desc: Get authenticated admin profile
   * @route: /admin/profile
   * @param: AuthAdmin
   * @returns: AdminResponseDto
   */
  @UseGuards(AdminJwtGuard)
  @Get('profile')
  profile(@CurrentAdmin() admin: AuthAdmin): AdminResponseDto {
    return this.adminService.profile(admin.adminId);
  }

  /* Dashboard Metrics Controller
   * @desc: Get dashboard KPI metrics
   * @route: /admin/dashboard/metrics
   * @returns: DashboardMetricsResponseDto
   */
  @UseGuards(AdminJwtGuard)
  @Get('dashboard/metrics')
  metrics(): DashboardMetricsResponseDto {
    return this.adminService.metrics();
  }

  /* Dashboard Chart Controller
   * @desc: Get dashboard revenue chart data
   * @route: /admin/dashboard/chart
   * @returns: DashboardChartPointResponseDto[]
   */
  @UseGuards(AdminJwtGuard)
  @Get('dashboard/chart')
  chart(): DashboardChartPointResponseDto[] {
    return this.adminService.chart();
  }

  /* Transactions Controller
   * @desc: List booking, F&B, and payment transactions
   * @route: /admin/transactions
   */
  @UseGuards(AdminJwtGuard)
  @Get('transactions')
  transactions(): AdminTransactionsResponseDto {
    return this.adminService.transactions();
  }

  /* Cancel Booking Controller
   * @desc: Cancel a booking transaction
   * @route: /admin/transactions/:bookingId/cancel
   * @param: bookingId
   */
  @UseGuards(AdminJwtGuard)
  @Patch('transactions/:bookingId/cancel')
  cancelBooking(@Param('bookingId') bookingId: string): BookingResponseDto {
    return this.adminService.cancelBooking(bookingId);
  }

  /* Verify Booking Controller
   * @desc: Mark a booking transaction as completed
   * @route: /admin/transactions/:bookingId/verify
   * @param: bookingId
   */
  @UseGuards(AdminJwtGuard)
  @Patch('transactions/:bookingId/verify')
  verifyBooking(@Param('bookingId') bookingId: string): BookingResponseDto {
    return this.adminService.verifyBooking(bookingId);
  }

  /* Cancel FNB Order Controller
   * @desc: Cancel an F&B order transaction
   * @route: /admin/transactions/fnb/:fnbOrderId/cancel
   * @param: fnbOrderId
   */
  @UseGuards(AdminJwtGuard)
  @Patch('transactions/fnb/:fnbOrderId/cancel')
  cancelFnbOrder(
    @Param('fnbOrderId') fnbOrderId: string,
  ): Omit<FnbOrderResponseDto, 'items'> {
    return this.adminService.cancelFnbOrder(fnbOrderId);
  }
  
  /* Admin Logs Controller
   * @desc: List admin activity logs
   * @route: /admin/logs
   */
  @UseGuards(AdminJwtGuard)
  @Get('logs')
  logs(): AdminLogResponseDto[] {
    return this.adminService.logs();
  }
}
