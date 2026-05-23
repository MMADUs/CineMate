import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { randomUUID } from 'node:crypto';
import { calculateTaxedTotal, toNumber } from '../common/utils/money';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import { bookingSeats, bookings, seats, showtimes } from '../database/schema';
import {
  BookingDetailResponseDto,
  BookingResponseDto,
  CreatedBookingResponseDto,
} from './dto/booking-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: BetterSQLite3Database<typeof schema>,
  ) {}

  /* Create Booking Service
   * @desc: Create a new movie booking
   * @param: userId, CreateBookingDto
   * @returns: CreatedBookingResponseDto
   */
  create(userId: number, dto: CreateBookingDto): CreatedBookingResponseDto {
    // start db transaction
    return this.db.transaction((tx) => {
      // get showtime
      const showtime = tx
        .select()
        .from(showtimes)
        .where(eq(showtimes.showtimeId, dto.showtimeId))
        .get();

      // check if showtime doesn't exists
      if (!showtime) throw new NotFoundException('Showtime not found');

      // get selected seats
      const selectedSeats = tx
        .select()
        .from(seats)
        .where(inArray(seats.seatId, dto.seatIds))
        .all();

      // check if selected seats belong to showtime hall
      if (
        selectedSeats.length !== dto.seatIds.length ||
        selectedSeats.some((seat) => seat.hallId !== showtime.hallId)
      ) {
        throw new BadRequestException(
          'One or more seats do not belong to this showtime hall',
        );
      }

      // check if selected seats are already booked
      const occupied = tx
        .select({ seatId: bookingSeats.seatId })
        .from(bookingSeats)
        .innerJoin(bookings, eq(bookingSeats.bookingId, bookings.bookingId))
        .where(
          and(
            eq(bookings.showtimeId, dto.showtimeId),
            ne(bookings.bookingStatus, 'Cancelled'),
            inArray(bookingSeats.seatId, dto.seatIds),
          ),
        )
        .all();

      // check if any seat is occupied
      if (occupied.length)
        throw new BadRequestException('One or more seats are already booked');

      // calculate price totals
      const totals = calculateTaxedTotal(
        toNumber(showtime.price) * dto.seatIds.length,
      );

      // create booking
      const booking = tx
        .insert(bookings)
        .values({
          bookingId: randomUUID(),
          userId,
          showtimeId: dto.showtimeId,
          ...totals,
        })
        .returning()
        .get();

      // attach seats to booking
      tx.insert(bookingSeats)
        .values(
          dto.seatIds.map((seatId) => ({
            bookingId: booking.bookingId,
            seatId,
          })),
        )
        .run();

      // return booking info + seat IDs
      return { ...booking, seatIds: dto.seatIds };
    });
  }

  /* Find User Bookings
   * @desc: Find all bookings for a user
   * @param: userId
   * @returns: BookingResponseDto[]
   */
  findUserBookings(userId: number): BookingResponseDto[] {
    return this.db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .all();
  }

  /* Find User Booking
   * @desc: Find one booking detail for a user
   * @param: userId, bookingId
   * @returns: BookingDetailResponseDto
   */
  findUserBooking(userId: number, bookingId: string): BookingDetailResponseDto {
    // get booking data
    const booking = this.db
      .select()
      .from(bookings)
      .where(eq(bookings.bookingId, bookingId))
      .get();

    // check if booking doesn't exist
    if (!booking) throw new NotFoundException('Booking not found');

    // check if booking doesn't belong to user
    if (booking.userId !== userId)
      throw new ForbiddenException('Booking does not belong to this user');

    // get booked seats
    const bookedSeats = this.db
      .select()
      .from(bookingSeats)
      .where(eq(bookingSeats.bookingId, bookingId))
      .all();

    return { ...booking, seats: bookedSeats };
  }
}
