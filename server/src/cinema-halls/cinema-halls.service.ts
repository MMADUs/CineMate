import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
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
    private readonly db: MySql2Database<typeof schema>,
  ) {}

  /* Find All Halls Service
   * @desc: List all cinema halls
   * @param: none
   * @returns: HallResponseDto[]
   */
  async findAll(): Promise<HallResponseDto[]> {
    return await this.db.select().from(cinemaHalls);
  }

  /* Create Hall Service
   * @desc: Create a cinema hall and generate seats
   * @param: CreateHallDto
   * @returns: HallResponseDto
   */
  async create(dto: CreateHallDto): Promise<HallResponseDto> {
    // start db transaction
    return await this.db.transaction(async (tx) => {
      // insert hall
      const [insertedHall] = await tx
        .insert(cinemaHalls)
        .values(dto)
        .$returningId();
      const [hall] = await tx
        .select()
        .from(cinemaHalls)
        .where(eq(cinemaHalls.hallId, insertedHall.hallId));

      // build seats
      const values = this.buildSeats(
        hall.hallId,
        dto.totalRows,
        dto.seatsPerRow,
      );

      // insert seats
      if (values.length) await tx.insert(seats).values(values);

      return hall;
    });
  }

  /* Update Hall Service
   * @desc: Update a cinema hall and regenerate seats when dimensions change
   * @param: hallId, UpdateHallDto
   * @returns: HallResponseDto
   */
  async update(hallId: number, dto: UpdateHallDto): Promise<HallResponseDto> {
    // start db transaction
    return await this.db.transaction(async (tx) => {
      // get existing hall
      const [existing] = await tx
        .select()
        .from(cinemaHalls)
        .where(eq(cinemaHalls.hallId, hallId));

      // check if hall doesn't exist
      if (!existing) throw new NotFoundException('Cinema hall not found');

      // update hall
      await tx
        .update(cinemaHalls)
        .set(dto)
        .where(eq(cinemaHalls.hallId, hallId));
      const [hall] = await tx
        .select()
        .from(cinemaHalls)
        .where(eq(cinemaHalls.hallId, hallId));

      // if dimensions are changed, regenerate seats
      if (dto.totalRows || dto.seatsPerRow) {
        // delete existing seats
        await tx.delete(seats).where(eq(seats.hallId, hallId));

        // build new seats
        const values = this.buildSeats(
          hallId,
          dto.totalRows ?? existing.totalRows,
          dto.seatsPerRow ?? existing.seatsPerRow,
        );

        // insert seats
        if (values.length) await tx.insert(seats).values(values);
      }

      return hall;
    });
  }

  /* Remove Hall Service
   * @desc: Delete a cinema hall
   * @param: hallId
   * @returns: HallResponseDto
   */
  async remove(hallId: number): Promise<HallResponseDto> {
    // get hall before delete
    const [hall] = await this.db
      .select()
      .from(cinemaHalls)
      .where(eq(cinemaHalls.hallId, hallId));

    // check if hall doesn't exist
    if (!hall) throw new NotFoundException('Cinema hall not found');

    // delete hall
    await this.db.delete(cinemaHalls).where(eq(cinemaHalls.hallId, hallId));

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
