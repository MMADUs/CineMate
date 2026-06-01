import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import { cinemas, seats, studios } from '../database/schema';
import { CreateStudioDto } from './dto/create-studio.dto';
import {
  GeneratedSeatValue,
  StudioResponseDto,
} from './dto/studio-response.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';

@Injectable()
export class StudiosService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: MySql2Database<typeof schema>,
  ) {}

  /* Find All Studios Service
   * @desc: List all studios
   * @param: none
   * @returns: StudioResponseDto[]
   */
  async findAll(): Promise<StudioResponseDto[]> {
    return await this.db.select().from(studios);
  }

  /* Create Studio Service
   * @desc: Create a studio and generate seats
   * @param: CreateStudioDto
   * @returns: StudioResponseDto
   */
  async create(dto: CreateStudioDto): Promise<StudioResponseDto> {
    await this.ensureCinemaExists(dto.cinemaId);

    return await this.db.transaction(async (tx) => {
      const [insertedStudio] = await tx
        .insert(studios)
        .values(dto)
        .$returningId();
      const [studio] = await tx
        .select()
        .from(studios)
        .where(eq(studios.studioId, insertedStudio.studioId));

      const values = this.buildSeats(
        studio.studioId,
        dto.totalRows,
        dto.seatsPerRow,
      );

      if (values.length) await tx.insert(seats).values(values);

      return studio;
    });
  }

  /* Update Studio Service
   * @desc: Update a studio and regenerate seats when dimensions change
   * @param: studioId, UpdateStudioDto
   * @returns: StudioResponseDto
   */
  async update(
    studioId: number,
    dto: UpdateStudioDto,
  ): Promise<StudioResponseDto> {
    return await this.db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(studios)
        .where(eq(studios.studioId, studioId));

      if (!existing) throw new NotFoundException('Studio not found');

      if (dto.cinemaId) await this.ensureCinemaExists(dto.cinemaId);
      await tx.update(studios).set(dto).where(eq(studios.studioId, studioId));
      const [studio] = await tx
        .select()
        .from(studios)
        .where(eq(studios.studioId, studioId));

      if (dto.totalRows || dto.seatsPerRow) {
        await tx.delete(seats).where(eq(seats.studioId, studioId));

        const values = this.buildSeats(
          studioId,
          dto.totalRows ?? existing.totalRows,
          dto.seatsPerRow ?? existing.seatsPerRow,
        );

        if (values.length) await tx.insert(seats).values(values);
      }

      return studio;
    });
  }

  /* Remove Studio Service
   * @desc: Delete a studio
   * @param: studioId
   * @returns: StudioResponseDto
   */
  async remove(studioId: number): Promise<StudioResponseDto> {
    const studio = await this.findOne(studioId);
    await this.db.delete(studios).where(eq(studios.studioId, studioId));

    return studio;
  }

  /* Find One Studio Helper
   * @desc: Find one studio by id
   * @param: studioId
   * @returns: StudioResponseDto
   */
  private async findOne(studioId: number): Promise<StudioResponseDto> {
    const [studio] = await this.db
      .select()
      .from(studios)
      .where(eq(studios.studioId, studioId));

    if (!studio) throw new NotFoundException('Studio not found');

    return studio;
  }

  /* Build Seats Helper
   * @desc: Build generated seat rows for a studio
   * @param: studioId, totalRows, seatsPerRow
   * @returns: GeneratedSeatValue[]
   */
  private buildSeats(
    studioId: number,
    totalRows: number,
    seatsPerRow: number,
  ): GeneratedSeatValue[] {
    const values: GeneratedSeatValue[] = [];

    for (let row = 0; row < totalRows; row++) {
      for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
        values.push({
          studioId,
          rowLetter: String.fromCharCode(65 + row),
          seatNumber,
        });
      }
    }

    return values;
  }

  private async ensureCinemaExists(cinemaId: number): Promise<void> {
    const [cinema] = await this.db
      .select({ cinemaId: cinemas.cinemaId })
      .from(cinemas)
      .where(eq(cinemas.cinemaId, cinemaId));

    if (!cinema) throw new NotFoundException('Cinema not found');
  }
}
