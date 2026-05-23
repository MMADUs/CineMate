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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAccessGuard } from '../common/guards/jwt-access.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { BookingsService } from './bookings.service';
import {
  BookingDetailResponseDto,
  BookingResponseDto,
  CreatedBookingResponseDto,
} from './dto/booking-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@UseGuards(JwtAccessGuard)
@ApiTags('Bookings')
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /* Create Booking Controller
   * @desc: Create a movie booking
   * @route: /bookings
   * @param: AuthUser, CreateBookingDto
   * @returns: CreatedBookingResponseDto
   */
  @Post('bookings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create movie booking' })
  @ApiCreatedResponse({ type: CreatedBookingResponseDto })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateBookingDto,
  ): CreatedBookingResponseDto {
    return this.bookingsService.create(user.userId, dto);
  }

  /* Find My Bookings Controller
   * @desc: Get authenticated user's booking history
   * @route: /users/orders
   * @param: AuthUser
   * @returns: BookingResponseDto[]
   */
  @Get('users/orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get authenticated user booking history' })
  @ApiOkResponse({ type: [BookingResponseDto] })
  findMine(@CurrentUser() user: AuthUser): BookingResponseDto[] {
    return this.bookingsService.findUserBookings(user.userId);
  }

  /* Find One Booking Controller
   * @desc: Get authenticated user's booking detail
   * @route: /users/orders/:bookingId
   * @param: AuthUser, bookingId
   * @returns: BookingDetailResponseDto
   */
  @Get('users/orders/:bookingId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get authenticated user booking detail' })
  @ApiOkResponse({ type: BookingDetailResponseDto })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('bookingId') bookingId: string,
  ): BookingDetailResponseDto {
    return this.bookingsService.findUserBooking(user.userId, bookingId);
  }
}
