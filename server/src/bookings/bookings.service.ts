import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray, ne } from 'drizzle-orm';
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
  studios,
  cinemas,
  users,
} from '../database/schema';
import { PaymentsService } from '../payments/payments.service';
import { StorageService } from '../storage/storage.service';
import {
  BookingCheckoutResponseDto,
  BookingDetailResponseDto,
  BookingResponseDto,
  CreatedBookingResponseDto,
  AdminBookingResponseDto,
} from './dto/booking-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: MySql2Database<typeof schema>,
    private readonly paymentsService: PaymentsService,
    private readonly storageService: StorageService,
  ) {}

  /* Checkout Booking Service
   * @desc: Create a pending movie booking and Xendit payment invoice
   * @param: userId, CreateBookingDto
   * @returns: BookingCheckoutResponseDto
   */
  async checkout(
    userId: string,
    dto: CreateBookingDto,
  ): Promise<BookingCheckoutResponseDto> {
    // first create booking with pending status
    const booking = await this.createPendingBooking(userId, dto);

    try {
      // create payment for the booking
      const payment = await this.paymentsService.create(userId, {
        bookingId: booking.bookingId,
        paymentMethod: 'XENDIT_INVOICE',
      });

      return {
        booking: await this.findUserBooking(userId, booking.bookingId),
        payment,
      };
    } catch (error) {
      // if error occured during payment creation, the order status is expired
      await this.db
        .update(bookings)
        .set({ orderStatus: 'Expired' })
        .where(eq(bookings.bookingId, booking.bookingId));

      throw error;
    }
  }

  /* Create Pending Booking Helper
   * @desc: Reserve selected seats with PendingPayment order status
   * @param: userId, CreateBookingDto
   * @returns: CreatedBookingResponseDto
   */
  private async createPendingBooking(
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

      // check if selected seats belong to showtime studio
      if (
        selectedSeats.length !== dto.seatIds.length ||
        selectedSeats.some((seat) => seat.studioId !== showtime.studioId)
      ) {
        throw new BadRequestException(
          'One or more seats do not belong to this showtime studio',
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
            ne(bookings.orderStatus, 'Expired'),
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
        orderStatus: 'PendingPayment',
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
        studio: studios,
        cinema: cinemas,
      })
      .from(bookings)
      .innerJoin(showtimes, eq(bookings.showtimeId, showtimes.showtimeId))
      .innerJoin(movies, eq(showtimes.movieId, movies.movieId))
      .innerJoin(studios, eq(showtimes.studioId, studios.studioId))
      .innerJoin(cinemas, eq(studios.cinemaId, cinemas.cinemaId))
      .leftJoin(payments, eq(bookings.bookingId, payments.bookingId))
      .where(eq(bookings.userId, userId));

    if (!rows.length) return [];

    const bookedSeats = await this.findSeatsForBookings(
      rows.map((row) => row.booking.bookingId),
    );

    return rows.map((row) => ({
      ...this.toBookingResponse(row),
      seats: bookedSeats.filter(
        (seat) => seat.bookingId === row.booking.bookingId,
      ),
    }));
  }

  /* Find All Bookings For Admin
   * @desc: Find all bookings with user, payment, showtime, movie, and seats
   * @param: none
   * @returns: AdminBookingResponseDto[]
   */
  async findAllForAdmin(): Promise<AdminBookingResponseDto[]> {
    const rows = await this.db
      .select({
        booking: bookings,
        payment: payments,
        showtime: showtimes,
        movie: movies,
        studio: studios,
        cinema: cinemas,
        user: users,
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.userId))
      .innerJoin(showtimes, eq(bookings.showtimeId, showtimes.showtimeId))
      .innerJoin(movies, eq(showtimes.movieId, movies.movieId))
      .innerJoin(studios, eq(showtimes.studioId, studios.studioId))
      .innerJoin(cinemas, eq(studios.cinemaId, cinemas.cinemaId))
      .leftJoin(payments, eq(bookings.bookingId, payments.bookingId));

    if (!rows.length) return [];

    const bookedSeats = await this.findSeatsForBookings(
      rows.map((row) => row.booking.bookingId),
    );

    return rows.map((row) => ({
      ...this.toBookingResponse(row),
      seats: bookedSeats.filter(
        (seat) => seat.bookingId === row.booking.bookingId,
      ),
      user: this.toUserResponse(row.user),
    }));
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
        studio: studios,
        cinema: cinemas,
      })
      .from(bookings)
      .innerJoin(showtimes, eq(bookings.showtimeId, showtimes.showtimeId))
      .innerJoin(movies, eq(showtimes.movieId, movies.movieId))
      .innerJoin(studios, eq(showtimes.studioId, studios.studioId))
      .innerJoin(cinemas, eq(studios.cinemaId, cinemas.cinemaId))
      .leftJoin(payments, eq(bookings.bookingId, payments.bookingId))
      .where(eq(bookings.bookingId, bookingId));

    // check if booking doesn't exist
    if (!row) throw new NotFoundException('Booking not found');

    // check if booking doesn't belong to user
    if (row.booking.userId !== userId)
      throw new ForbiddenException('Booking does not belong to this user');

    // get booked seats
    const bookedSeats = await this.db
      .select({
        bookingSeat: bookingSeats,
        seat: seats,
      })
      .from(bookingSeats)
      .innerJoin(seats, eq(bookingSeats.seatId, seats.seatId))
      .where(eq(bookingSeats.bookingId, bookingId));

    return {
      ...this.toBookingResponse(row),
      seats: bookedSeats.map((seat) => this.toBookingSeatResponse(seat)),
    };
  }

  /* Find Seats For Bookings Helper
   * @desc: Get booked seats for multiple booking IDs
   * @param: bookingIds
   * @returns: BookingSeatResponseDto[]
   */
  private async findSeatsForBookings(bookingIds: string[]) {
    if (!bookingIds.length) return [];

    const rows = await this.db
      .select({
        bookingSeat: bookingSeats,
        seat: seats,
      })
      .from(bookingSeats)
      .innerJoin(seats, eq(bookingSeats.seatId, seats.seatId))
      .where(inArray(bookingSeats.bookingId, bookingIds));

    return rows.map((row) => this.toBookingSeatResponse(row));
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
    studio: typeof studios.$inferSelect;
    cinema: typeof cinemas.$inferSelect;
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
        studio: {
          ...row.studio,
          cinema: row.cinema,
        },
      },
    };
  }

  private toBookingSeatResponse(row: {
    bookingSeat: typeof bookingSeats.$inferSelect;
    seat: typeof seats.$inferSelect;
  }) {
    return {
      bookingId: row.bookingSeat.bookingId,
      seatId: row.seat.seatId,
      studioId: row.seat.studioId,
      rowLetter: row.seat.rowLetter,
      seatNumber: row.seat.seatNumber,
    };
  }

  private toUserResponse(user: typeof users.$inferSelect) {
    return {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      phoneNum: user.phoneNum,
      authProvider: user.authProvider,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }
}
