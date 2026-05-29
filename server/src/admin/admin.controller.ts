import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { AdminRefreshGuard } from '../common/guards/admin-refresh.guard';
import type { AuthAdmin } from '../common/interfaces/auth-user.interface';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import {
  AdminLogoutResponseDto,
  AdminRefreshResponseDto,
  AdminResponseDto,
  AdminDashboardResponseDto,
  AdminTransactionsResponseDto,
} from './dto/admin-response.dto';

@ApiTags('Admin')
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
  @ApiOperation({ summary: 'Login admin and set HttpOnly admin cookies' })
  @ApiOkResponse({ type: AdminResponseDto })
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
  @ApiOperation({ summary: 'Rotate admin access and refresh cookies' })
  @ApiOkResponse({ type: AdminRefreshResponseDto })
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
   * @returns: Promise<AdminLogoutResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout admin and clear auth cookies' })
  @ApiOkResponse({ type: AdminLogoutResponseDto })
  logout(
    @CurrentAdmin() admin: AuthAdmin,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AdminLogoutResponseDto> {
    return this.adminService.logout(admin, res);
  }

  /* Admin Profile Controller
   * @desc: Get authenticated admin profile
   * @route: /admin/profile
   * @param: AuthAdmin
   * @returns: Promise<AdminResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get authenticated admin profile' })
  @ApiOkResponse({ type: AdminResponseDto })
  profile(@CurrentAdmin() admin: AuthAdmin): Promise<AdminResponseDto> {
    return this.adminService.profile(admin.adminId);
  }

  /* Dashboard Controller
   * @desc: Get dashboard metrics, chart, and recent sales
   * @route: /admin/dashboard
   * @returns: Promise<AdminDashboardResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard metrics, chart, and recent sales' })
  @ApiOkResponse({ type: AdminDashboardResponseDto })
  dashboard(): Promise<AdminDashboardResponseDto> {
    return this.adminService.dashboard();
  }

  /* Transactions Controller
   * @desc: List booking, F&B, and payment transactions
   * @route: /admin/transactions
   */
  @UseGuards(AdminJwtGuard)
  @Get('transactions')
  @ApiOperation({ summary: 'List booking, F&B, and payment transactions' })
  @ApiOkResponse({ type: AdminTransactionsResponseDto })
  transactions(): Promise<AdminTransactionsResponseDto> {
    return this.adminService.transactions();
  }
}
