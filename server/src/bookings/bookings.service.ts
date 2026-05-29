import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { randomUUID } from 'node:crypto';
import { calculateTaxedTotal, toNumber } from '../common/utils/money';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import {
  bookingSeats,
  bookings,
  movies,
  payments,
  seats,
  showtimes,
} from '../database/schema';
import { StorageService } from '../storage/storage.service';
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
    private readonly db: MySql2Database<typeof schema>,
    private readonly storageService: StorageService,
  ) {}

  /* Create Booking Service
   * @desc: Create a new movie booking
   * @param: userId, CreateBookingDto
   * @returns: CreatedBookingResponseDto
   */
  async create(
    userId: string,
    dto: CreateBookingDto,
  ): Promise<CreatedBookingResponseDto> {
    // start db transaction
    return await this.db.transaction(async (tx) => {
      // get showtime
      const [showtime] = await tx
        .select()
        .from(showtimes)
        .where(eq(showtimes.showtimeId, dto.showtimeId));

      // check if showtime doesn't exists
      if (!showtime) throw new NotFoundException('Showtime not found');

      // get selected seats
      const selectedSeats = await tx
        .select()
        .from(seats)
        .where(inArray(seats.seatId, dto.seatIds));

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
      const occupied = await tx
        .select({ seatId: bookingSeats.seatId })
        .from(bookingSeats)
        .innerJoin(bookings, eq(bookingSeats.bookingId, bookings.bookingId))
        .where(
          and(
            eq(bookings.showtimeId, dto.showtimeId),
            inArray(bookingSeats.seatId, dto.seatIds),
          ),
        );

      // check if any seat is occupied
      if (occupied.length)
        throw new BadRequestException('One or more seats are already booked');

      // calculate price totals
      const totals = calculateTaxedTotal(
        toNumber(showtime.price) * dto.seatIds.length,
      );

      // create booking
      const bookingId = randomUUID();
      await tx.insert(bookings).values({
        bookingId,
        userId,
        showtimeId: dto.showtimeId,
        ...totals,
      });

      const [booking] = await tx
        .select()
        .from(bookings)
        .where(eq(bookings.bookingId, bookingId));

      // attach seats to booking
      await tx.insert(bookingSeats).values(
        dto.seatIds.map((seatId) => ({
          bookingId: booking.bookingId,
          seatId,
        })),
      );

      // return booking info + seat IDs
      return { ...booking, seatIds: dto.seatIds };
    });
  }

  /* Find User Bookings
   * @desc: Find all bookings for a user
   * @param: userId
   * @returns: BookingResponseDto[]
   */
  async findUserBookings(userId: string): Promise<BookingResponseDto[]> {
    const rows = await this.db
      .select({
        booking: bookings,
        payment: payments,
        showtime: showtimes,
        movie: movies,
      })
      .from(bookings)
      .innerJoin(showtimes, eq(bookings.showtimeId, showtimes.showtimeId))
      .innerJoin(movies, eq(showtimes.movieId, movies.movieId))
      .leftJoin(payments, eq(bookings.bookingId, payments.bookingId))
      .where(eq(bookings.userId, userId));

    return rows.map((row) => this.toBookingResponse(row));
  }

  /* Find User Booking
   * @desc: Find one booking detail for a user
   * @param: userId, bookingId
   * @returns: BookingDetailResponseDto
   */
  async findUserBooking(
    userId: string,
    bookingId: string,
  ): Promise<BookingDetailResponseDto> {
    const [row] = await this.db
      .select({
        booking: bookings,
        payment: payments,
        showtime: showtimes,
        movie: movies,
      })
      .from(bookings)
      .innerJoin(showtimes, eq(bookings.showtimeId, showtimes.showtimeId))
      .innerJoin(movies, eq(showtimes.movieId, movies.movieId))
      .leftJoin(payments, eq(bookings.bookingId, payments.bookingId))
      .where(eq(bookings.bookingId, bookingId));

    // check if booking doesn't exist
    if (!row) throw new NotFoundException('Booking not found');

    // check if booking doesn't belong to user
    if (row.booking.userId !== userId)
      throw new ForbiddenException('Booking does not belong to this user');

    // get booked seats
    const bookedSeats = await this.db
      .select()
      .from(bookingSeats)
      .where(eq(bookingSeats.bookingId, bookingId));

    return { ...this.toBookingResponse(row), seats: bookedSeats };
  }

  /* To Booking Response Helper
   * @desc: Map booking joins into booking response with payment, showtime, and movie
   * @param: joined booking row
   * @returns: BookingResponseDto
   */
  private toBookingResponse(row: {
    booking: typeof bookings.$inferSelect;
    payment: typeof payments.$inferSelect | null;
    showtime: typeof showtimes.$inferSelect;
    movie: typeof movies.$inferSelect;
  }): BookingResponseDto {
    return {
      ...row.booking,
      payment: row.payment,
      showtime: {
        ...row.showtime,
        movie: {
          ...row.movie,
          imageUrl: this.storageService.buildImageUrl(row.movie.imageKey),
        },
      },
    };
  }
}
