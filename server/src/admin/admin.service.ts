import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { desc, eq, sql } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { Response } from 'express';
import { BookingResponseDto } from '../bookings/dto/booking-response.dto';
import { AuthAdmin } from '../common/interfaces/auth-user.interface';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import {
  adminLogs,
  admins,
  bookingSeats,
  bookings,
  fnbOrders,
  movies,
  payments,
} from '../database/schema';
import { FnbOrderResponseDto } from '../fnb-orders/dto/fnb-order-response.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import {
  AdminLogResponseDto,
  AdminLogoutResponseDto,
  AdminRefreshResponseDto,
  AdminResponseDto,
  AdminTokenPair,
  AdminTransactionsResponseDto,
  DashboardChartPointResponseDto,
  DashboardMetricsResponseDto,
} from './dto/admin-response.dto';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: BetterSQLite3Database<typeof schema>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /* Admin Login Service
   * @desc: Login an admin and set admin auth cookies
   * @param: AdminLoginDto, Response
   * @returns: Promise<AdminResponseDto>
   */
  async login(dto: AdminLoginDto, res: Response): Promise<AdminResponseDto> {
    const admin = this.db
      .select()
      .from(admins)
      .where(eq(admins.email, dto.email))
      .get();

    // check if admin exists and password is correct
    if (!admin || !(await argon2.verify(admin.password, dto.password)))
      throw new UnauthorizedException('Invalid admin credentials');

    // issue tokens
    const tokens = await this.issueTokens(admin.adminId, admin.email);

    // hash refresh token and update admin
    this.db
      .update(admins)
      .set({ refreshTokenHash: await argon2.hash(tokens.refreshToken) })
      .where(eq(admins.adminId, admin.adminId))
      .run();

    // set cookies
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return this.serializeAdmin(admin);
  }

  /* Admin Refresh Service
   * @desc: Rotate admin access and refresh cookies
   * @param: AuthAdmin, Response
   * @returns: Promise<AdminRefreshResponseDto>
   */
  async refresh(
    admin: AuthAdmin,
    res: Response,
  ): Promise<AdminRefreshResponseDto> {
    const found = this.db
      .select()
      .from(admins)
      .where(eq(admins.adminId, admin.adminId))
      .get();

    // check if admin exists and refresh token is valid
    if (
      !found?.refreshTokenHash ||
      !admin.refreshToken ||
      !(await argon2.verify(found.refreshTokenHash, admin.refreshToken))
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // issue new tokens
    const tokens = await this.issueTokens(found.adminId, found.email);

    // update hash refresh token
    this.db
      .update(admins)
      .set({ refreshTokenHash: await argon2.hash(tokens.refreshToken) })
      .where(eq(admins.adminId, found.adminId))
      .run();

    // set new cookies
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      adminId: found.adminId,
      email: found.email,
      username: found.username,
    };
  }

  /* Admin Logout Service
   * @desc: Clear admin refresh token hash and cookies
   * @param: AuthAdmin, Response
   * @returns: AdminLogoutResponseDto
   */
  logout(admin: AuthAdmin, res: Response): AdminLogoutResponseDto {
    this.db
      .update(admins)
      .set({ refreshTokenHash: null })
      .where(eq(admins.adminId, admin.adminId))
      .run();

    // clear cookies
    this.clearCookies(res);

    return { message: 'Logged out' };
  }

  /* Admin Profile Service
   * @desc: Get authenticated admin profile
   * @param: adminId
   * @returns: AdminResponseDto
   */
  profile(adminId: number): AdminResponseDto {
    const admin = this.db
      .select()
      .from(admins)
      .where(eq(admins.adminId, adminId))
      .get();

    // check if admin exists
    if (!admin) throw new UnauthorizedException();

    return this.serializeAdmin(admin);
  }

  /* Dashboard Metrics Service
   * @desc: Get admin dashboard KPI metrics
   * @param: none
   * @returns: DashboardMetricsResponseDto
   */
  metrics(): DashboardMetricsResponseDto {
    // get total revenue from completed payments
    const totalRevenue =
      this.db
        .select({ value: sql<number>`coalesce(sum(${payments.amount}), 0)` })
        .from(payments)
        .where(eq(payments.paymentStatus, 'Completed'))
        .get()?.value ?? 0;

    // get total tickets sold
    const ticketsSold =
      this.db
        .select({ value: sql<number>`count(*)` })
        .from(bookingSeats)
        .innerJoin(bookings, eq(bookingSeats.bookingId, bookings.bookingId))
        .where(sql`${bookings.bookingStatus} in ('Confirmed', 'Completed')`)
        .get()?.value ?? 0;

    // get pending orders
    const pendingOrders =
      this.db
        .select({ value: sql<number>`count(*)` })
        .from(bookings)
        .where(eq(bookings.bookingStatus, 'Pending'))
        .get()?.value ?? 0;

    // get now playing movies
    const activeMoviesCount =
      this.db
        .select({ value: sql<number>`count(*)` })
        .from(movies)
        .where(eq(movies.status, 'NOW_PLAYING'))
        .get()?.value ?? 0;

    return {
      totalRevenue: Number(totalRevenue),
      ticketsSold: Number(ticketsSold),
      pendingOrders: Number(pendingOrders),
      activeMoviesCount: Number(activeMoviesCount),
    };
  }

  /* Dashboard Chart Service
   * @desc: Get revenue chart data grouped by payment date
   * @param: none
   * @returns: DashboardChartPointResponseDto[]
   */
  chart(): DashboardChartPointResponseDto[] {
    const rows = this.db
      .select({
        date: sql<string>`date(${payments.paymentDate})`,
        total: sql<number>`sum(${payments.amount})`,
      })
      .from(payments)
      .where(eq(payments.paymentStatus, 'Completed'))
      .groupBy(sql`date(${payments.paymentDate})`)
      .all();

    return rows.map((row) => ({ name: row.date, total: Number(row.total) }));
  }

  /* Transactions Service
   * @desc: List bookings, F&B orders, and payments
   * @param: none
   * @returns: AdminTransactionsResponseDto
   */
  transactions(): AdminTransactionsResponseDto {
    return {
      bookings: this.db.select().from(bookings).all(),
      fnbOrders: this.db.select().from(fnbOrders).all(),
      payments: this.db.select().from(payments).all(),
    };
  }

  /* Cancel Booking Service
   * @desc: Cancel a booking transaction
   * @param: bookingId
   * @returns: BookingResponseDto
   */
  cancelBooking(bookingId: string): BookingResponseDto {
    const booking = this.db
      .update(bookings)
      .set({ bookingStatus: 'Cancelled' })
      .where(eq(bookings.bookingId, bookingId))
      .returning()
      .get();

    return booking;
  }

  /* Verify Booking Service
   * @desc: Mark a booking transaction as completed
   * @param: bookingId
   * @returns: BookingResponseDto
   */
  verifyBooking(bookingId: string): BookingResponseDto {
    const booking = this.db
      .update(bookings)
      .set({ bookingStatus: 'Completed' })
      .where(eq(bookings.bookingId, bookingId))
      .returning()
      .get();

    return booking;
  }

  /* Cancel FNB Order Service
   * @desc: Cancel an F&B order transaction
   * @param: fnbOrderId
   * @returns: Omit<FnbOrderResponseDto, 'items'>
   */
  cancelFnbOrder(fnbOrderId: string): Omit<FnbOrderResponseDto, 'items'> {
    const order = this.db
      .update(fnbOrders)
      .set({ orderStatus: 'Cancelled' })
      .where(eq(fnbOrders.fnbOrderId, fnbOrderId))
      .returning()
      .get();

    return order;
  }

  /* Admin Logs Service
   * @desc: List admin activity logs
   * @param: none
   * @returns: AdminLogResponseDto[]
   */
  logs(): AdminLogResponseDto[] {
    return this.db
      .select()
      .from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .all();
  }

  /* Issue Admin Tokens Helper
   * @desc: Issue admin access and refresh tokens
   * @param: adminId, email
   * @returns: Promise<AdminTokenPair>
   */
  private async issueTokens(
    adminId: number,
    email: string,
  ): Promise<AdminTokenPair> {
    const payload = { sub: adminId, email };

    // issue access token
    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_ADMIN_ACCESS_SECRET') ??
        'dev-admin-access-secret',
      expiresIn: 15 * 60,
    });

    // issue refresh token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_ADMIN_REFRESH_SECRET') ??
        'dev-admin-refresh-secret',
      expiresIn: 7 * 24 * 60 * 60,
    });

    return { accessToken, refreshToken };
  }

  /* Set Admin Cookies Helper
   * @desc: Set admin access and refresh token cookies
   * @param: Response, accessToken, refreshToken
   * @returns: void
   */
  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const secure = this.configService.get<string>('NODE_ENV') === 'production';

    // set access token cookie
    res.cookie('admin_access_token', accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    // set refresh token cookie
    res.cookie('admin_refresh_token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  /* Clear Cookies Helper
   * @desc: Clear access and refresh tokens from cookies
   * @param: Response
   * @returns: void
   */
  private clearCookies(res: Response): void {
    res.clearCookie('admin_access_token', { path: '/' });
    res.clearCookie('admin_refresh_token', { path: '/' });
  }

  /* Serialize User Helper
   * @desc: Remove sensitive fields from user response
   * @param: user
   * @returns: UserProfileResponseDto
   */
  private serializeAdmin<
    T extends AdminResponseDto & {
      password?: string;
      refreshTokenHash?: string | null;
    },
  >(admin: T): AdminResponseDto {
    const safeAdmin = { ...admin };

    // remove sensitive fields
    delete safeAdmin.password;
    delete safeAdmin.refreshTokenHash;

    return safeAdmin;
  }
}
