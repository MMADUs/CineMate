import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, ne } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import {
  bookingSeats,
  bookings,
  seats,
  showtimes,
  studios,
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
    private readonly db: MySql2Database<typeof schema>,
  ) {}

  /* Find All Showtimes Service
   * @desc: List showtimes with optional movie/date filters
   * @param: QueryShowtimeDto
   * @returns: ShowtimeResponseDto[]
   */
  async findAll(query: QueryShowtimeDto = {}): Promise<ShowtimeResponseDto[]> {
    // get query filters
    const filters = [
      query.movieId ? eq(showtimes.movieId, query.movieId) : undefined,
      query.showDate ? eq(showtimes.showDate, query.showDate) : undefined,
    ].filter(Boolean);

    // apply filters
    return filters.length
      ? await this.db
          .select()
          .from(showtimes)
          .where(and(...filters))
      : await this.db.select().from(showtimes);
  }

  /* Create Showtime Service
   * @desc: Create a showtime
   * @param: CreateShowtimeDto
   * @returns: ShowtimeResponseDto
   */
  async create(dto: CreateShowtimeDto): Promise<ShowtimeResponseDto> {
    const [insertedShowtime] = await this.db
      .insert(showtimes)
      .values({ ...dto, price: String(dto.price) })
      .$returningId();

    return this.findOne(insertedShowtime.showtimeId);
  }

  /* Update Showtime Service
   * @desc: Update a showtime
   * @param: showtimeId, UpdateShowtimeDto
   * @returns: ShowtimeResponseDto
   */
  async update(
    showtimeId: number,
    dto: UpdateShowtimeDto,
  ): Promise<ShowtimeResponseDto> {
    await this.findOne(showtimeId);
    await this.db
      .update(showtimes)
      .set({
        ...dto,
        price: dto.price === undefined ? undefined : String(dto.price),
      })
      .where(eq(showtimes.showtimeId, showtimeId));

    return this.findOne(showtimeId);
  }

  /* Remove Showtime Service
   * @desc: Delete a showtime
   * @param: showtimeId
   * @returns: ShowtimeResponseDto
   */
  async remove(showtimeId: number): Promise<ShowtimeResponseDto> {
    const showtime = await this.findOne(showtimeId);
    await this.db.delete(showtimes).where(eq(showtimes.showtimeId, showtimeId));

    return showtime;
  }

  /* Get Seats Service
   * @desc: Get studio layout and seat availability for a showtime
   * @param: showtimeId
   * @returns: ShowtimeSeatsResponseDto
   */
  async getSeats(showtimeId: number): Promise<ShowtimeSeatsResponseDto> {
    // get showtime
    const showtime = await this.findOne(showtimeId);

    // get studio
    const [studio] = await this.db
      .select()
      .from(studios)
      .where(eq(studios.studioId, showtime.studioId));

    // check if studio doesn't exist
    if (!studio) throw new NotFoundException('Studio not found');

    // get seats
    const studioSeats = await this.db
      .select()
      .from(seats)
      .where(eq(seats.studioId, showtime.studioId));

    // get occupied seats
    const occupied = await this.db
      .select({ seatId: bookingSeats.seatId })
      .from(bookingSeats)
      .innerJoin(bookings, eq(bookingSeats.bookingId, bookings.bookingId))
      .where(
        and(
          eq(bookings.showtimeId, showtimeId),
          ne(bookings.orderStatus, 'Expired'),
        ),
      );

    // create occupied seats set
    const occupiedIds = new Set(occupied.map((seat) => seat.seatId));

    // map seats with availability
    return {
      studio,
      seats: studioSeats.map((seat) => ({
        ...seat,
        isOccupied: occupiedIds.has(seat.seatId),
      })),
    };
  }

  /* Find One Showtime Helper
   * @desc: Get showtime detail by ID
   * @param: showtimeId
   * @returns: ShowtimeResponseDto
   */
  private async findOne(showtimeId: number): Promise<ShowtimeResponseDto> {
    const [showtime] = await this.db
      .select()
      .from(showtimes)
      .where(eq(showtimes.showtimeId, showtimeId));

    // check if showtime doesn't exist
    if (!showtime) throw new NotFoundException('Showtime not found');

    return showtime;
  }
}
