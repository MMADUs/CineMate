import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, ne } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import {
  bookingSeats,
  bookings,
  cinemaHalls,
  seats,
  showtimes,
} from '../database/schema';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { QueryShowtimeDto } from './dto/query-showtime.dto';
import {
  ShowtimeResponseDto,
  ShowtimeSeatsResponseDto,
} from './dto/showtime-response.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';

@Injectable()
export class ShowtimesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: BetterSQLite3Database<typeof schema>,
  ) {}

  /* Find All Showtimes Service
   * @desc: List showtimes with optional movie/date filters
   * @param: QueryShowtimeDto
   * @returns: ShowtimeResponseDto[]
   */
  findAll(query: QueryShowtimeDto = {}): ShowtimeResponseDto[] {
    // get query filters
    const filters = [
      query.movieId ? eq(showtimes.movieId, query.movieId) : undefined,
      query.showDate ? eq(showtimes.showDate, query.showDate) : undefined,
    ].filter(Boolean);

    // apply filters
    return filters.length
      ? this.db
          .select()
          .from(showtimes)
          .where(and(...filters))
          .all()
      : this.db.select().from(showtimes).all();
  }

  /* Create Showtime Service
   * @desc: Create a showtime
   * @param: CreateShowtimeDto
   * @returns: ShowtimeResponseDto
   */
  create(dto: CreateShowtimeDto): ShowtimeResponseDto {
    const showtime = this.db
      .insert(showtimes)
      .values({ ...dto, price: String(dto.price) })
      .returning()
      .get();

    return showtime;
  }

  /* Update Showtime Service
   * @desc: Update a showtime
   * @param: showtimeId, UpdateShowtimeDto
   * @returns: ShowtimeResponseDto
   */
  update(showtimeId: number, dto: UpdateShowtimeDto): ShowtimeResponseDto {
    const showtime = this.db
      .update(showtimes)
      .set({
        ...dto,
        price: dto.price === undefined ? undefined : String(dto.price),
      })
      .where(eq(showtimes.showtimeId, showtimeId))
      .returning()
      .get();

    // check if showtime doesn't exist
    if (!showtime) throw new NotFoundException('Showtime not found');

    return showtime;
  }

  /* Remove Showtime Service
   * @desc: Delete a showtime
   * @param: showtimeId
   * @returns: ShowtimeResponseDto
   */
  remove(showtimeId: number): ShowtimeResponseDto {
    const showtime = this.db
      .delete(showtimes)
      .where(eq(showtimes.showtimeId, showtimeId))
      .returning()
      .get();

    // check if showtime doesn't exist
    if (!showtime) throw new NotFoundException('Showtime not found');

    return showtime;
  }

  /* Get Seats Service
   * @desc: Get hall layout and seat availability for a showtime
   * @param: showtimeId
   * @returns: ShowtimeSeatsResponseDto
   */
  getSeats(showtimeId: number): ShowtimeSeatsResponseDto {
    // get showtime
    const showtime = this.db
      .select()
      .from(showtimes)
      .where(eq(showtimes.showtimeId, showtimeId))
      .get();

    // check if showtime doesn't exist
    if (!showtime) throw new NotFoundException('Showtime not found');

    // get cinema hall
    const hall = this.db
      .select()
      .from(cinemaHalls)
      .where(eq(cinemaHalls.hallId, showtime.hallId))
      .get();

    // check if cinema hall doesn't exist
    if (!hall) throw new NotFoundException('Cinema hall not found');

    // get seats
    const hallSeats = this.db
      .select()
      .from(seats)
      .where(eq(seats.hallId, showtime.hallId))
      .all();

    // get occupied seats
    const occupied = this.db
      .select({ seatId: bookingSeats.seatId })
      .from(bookingSeats)
      .innerJoin(bookings, eq(bookingSeats.bookingId, bookings.bookingId))
      .where(
        and(
          eq(bookings.showtimeId, showtimeId),
          ne(bookings.bookingStatus, 'Cancelled'),
        ),
      )
      .all();

    // create occupied seats set
    const occupiedIds = new Set(occupied.map((seat) => seat.seatId));

    // map seats with availability
    return {
      hall,
      seats: hallSeats.map((seat) => ({
        ...seat,
        isOccupied: occupiedIds.has(seat.seatId),
      })),
    };
  }
}
