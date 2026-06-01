import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Idempotent } from '../common/decorators/idempotent.decorator';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { JwtAccessGuard } from '../common/guards/jwt-access.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { BookingsService } from './bookings.service';
import {
  BookingCheckoutResponseDto,
  BookingDetailResponseDto,
  BookingResponseDto,
  AdminBookingResponseDto,
} from './dto/booking-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Bookings')
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /* Checkout Booking Controller
   * @desc: Create a movie booking and Xendit payment invoice
   * @route: /bookings/checkout
   * @param: AuthUser, CreateBookingDto
   * @returns: Promise<BookingCheckoutResponseDto>
   */
  @UseGuards(JwtAccessGuard)
  @Post('bookings/checkout')
  @HttpCode(HttpStatus.CREATED)
  @Idempotent()
  @ApiOperation({ summary: 'Checkout movie booking' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description:
      'Required only when IDEMPOTENCY_FLAG=true. Reuse the same UUID for retries of the same booking checkout request.',
  })
  @ApiCreatedResponse({ type: BookingCheckoutResponseDto })
  checkout(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingCheckoutResponseDto> {
    return this.bookingsService.checkout(user.userId, dto);
  }

  /* Find My Bookings Controller
   * @desc: Get authenticated user's booking history
   * @route: /users/orders
   * @param: AuthUser
   * @returns: Promise<BookingResponseDto[]>
   */
  @UseGuards(JwtAccessGuard)
  @Get('users/orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get authenticated user booking history' })
  @ApiOkResponse({ type: [BookingResponseDto] })
  findMine(@CurrentUser() user: AuthUser): Promise<BookingResponseDto[]> {
    return this.bookingsService.findUserBookings(user.userId);
  }

  /* Find One Booking Controller
   * @desc: Get authenticated user's booking detail
   * @route: /users/orders/:bookingId
   * @param: AuthUser, bookingId
   * @returns: Promise<BookingDetailResponseDto>
   */
  @UseGuards(JwtAccessGuard)
  @Get('users/orders/:bookingId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get authenticated user booking detail' })
  @ApiOkResponse({ type: BookingDetailResponseDto })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('bookingId') bookingId: string,
  ): Promise<BookingDetailResponseDto> {
    return this.bookingsService.findUserBooking(user.userId, bookingId);
  }

  /* Admin Find All Bookings Controller
   * @desc: List all bookings with user, payment, showtime, movie, and seats
   * @route: /admin/bookings
   * @returns: Promise<AdminBookingResponseDto[]>
   */
  @UseGuards(AdminJwtGuard)
  @Get('admin/bookings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all bookings for admin' })
  @ApiOkResponse({ type: [AdminBookingResponseDto] })
  adminFindAll(): Promise<AdminBookingResponseDto[]> {
    return this.bookingsService.findAllForAdmin();
  }
}
