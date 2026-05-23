import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import { cinemaHalls, seats } from '../database/schema';
import { CreateHallDto } from './dto/create-hall.dto';
import { GeneratedSeatValue, HallResponseDto } from './dto/hall-response.dto';
import { UpdateHallDto } from './dto/update-hall.dto';

@Injectable()
export class CinemaHallsService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: BetterSQLite3Database<typeof schema>,
  ) {}

  /* Find All Halls Service
   * @desc: List all cinema halls
   * @param: none
   * @returns: HallResponseDto[]
   */
  findAll(): HallResponseDto[] {
    return this.db.select().from(cinemaHalls).all();
  }

  /* Create Hall Service
   * @desc: Create a cinema hall and generate seats
   * @param: CreateHallDto
   * @returns: HallResponseDto
   */
  create(dto: CreateHallDto): HallResponseDto {
    // start db transaction
    return this.db.transaction((tx) => {
      // insert hall
      const hall = tx.insert(cinemaHalls).values(dto).returning().get();

      // build seats
      const values = this.buildSeats(
        hall.hallId,
        dto.totalRows,
        dto.seatsPerRow,
      );

      // insert seats
      if (values.length) tx.insert(seats).values(values).run();

      return hall;
    });
  }

  /* Update Hall Service
   * @desc: Update a cinema hall and regenerate seats when dimensions change
   * @param: hallId, UpdateHallDto
   * @returns: HallResponseDto
   */
  update(hallId: number, dto: UpdateHallDto): HallResponseDto {
    // start db transaction
    return this.db.transaction((tx) => {
      // get existing hall
      const existing = tx
        .select()
        .from(cinemaHalls)
        .where(eq(cinemaHalls.hallId, hallId))
        .get();

      // check if hall doesn't exist
      if (!existing) throw new NotFoundException('Cinema hall not found');

      // update hall
      const hall = tx
        .update(cinemaHalls)
        .set(dto)
        .where(eq(cinemaHalls.hallId, hallId))
        .returning()
        .get();

      // if dimensions are changed, regenerate seats
      if (dto.totalRows || dto.seatsPerRow) {
        // delete existing seats
        tx.delete(seats).where(eq(seats.hallId, hallId)).run();

        // build new seats
        const values = this.buildSeats(
          hallId,
          dto.totalRows ?? existing.totalRows,
          dto.seatsPerRow ?? existing.seatsPerRow,
        );

        // insert seats
        if (values.length) tx.insert(seats).values(values).run();
      }

      return hall;
    });
  }

  /* Remove Hall Service
   * @desc: Delete a cinema hall
   * @param: hallId
   * @returns: HallResponseDto
   */
  remove(hallId: number): HallResponseDto {
    // delete hall
    const hall = this.db
      .delete(cinemaHalls)
      .where(eq(cinemaHalls.hallId, hallId))
      .returning()
      .get();

    // check if hall doesn't exist
    if (!hall) throw new NotFoundException('Cinema hall not found');

    return hall;
  }

  /* Build Seats Helper
   * @desc: Build generated seat rows for a hall
   * @param: hallId, totalRows, seatsPerRow
   * @returns: GeneratedSeatValue[]
   */
  private buildSeats(
    hallId: number,
    totalRows: number,
    seatsPerRow: number,
  ): GeneratedSeatValue[] {
    // seat values
    const values: GeneratedSeatValue[] = [];

    // build seats
    for (let row = 0; row < totalRows; row++) {
      for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
        values.push({
          hallId,
          rowLetter: String.fromCharCode(65 + row), // 'A' = 65 (ASCII)
          seatNumber,
        });
      }
    }

    return values;
  }
}
