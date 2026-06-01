import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import { cinemas } from '../database/schema';
import { CinemaResponseDto } from './dto/cinema-response.dto';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';

@Injectable()
export class CinemasService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: MySql2Database<typeof schema>,
  ) {}

  /* Find All Cinemas Service
   * @desc: List all cinemas
   * @param: none
   * @returns: CinemaResponseDto[]
   */
  async findAll(): Promise<CinemaResponseDto[]> {
    return await this.db.select().from(cinemas);
  }

  /* Create Cinema Service
   * @desc: Create a cinema
   * @param: CreateCinemaDto
   * @returns: CinemaResponseDto
   */
  async create(dto: CreateCinemaDto): Promise<CinemaResponseDto> {
    const [insertedCinema] = await this.db
      .insert(cinemas)
      .values(dto)
      .$returningId();

    return this.findOne(insertedCinema.cinemaId);
  }

  /* Update Cinema Service
   * @desc: Update a cinema
   * @param: cinemaId, UpdateCinemaDto
   * @returns: CinemaResponseDto
   */
  async update(
    cinemaId: number,
    dto: UpdateCinemaDto,
  ): Promise<CinemaResponseDto> {
    await this.findOne(cinemaId);
    await this.db
      .update(cinemas)
      .set(dto)
      .where(eq(cinemas.cinemaId, cinemaId));

    return this.findOne(cinemaId);
  }

  /* Remove Cinema Service
   * @desc: Delete a cinema and its studios
   * @param: cinemaId
   * @returns: CinemaResponseDto
   */
  async remove(cinemaId: number): Promise<CinemaResponseDto> {
    const cinema = await this.findOne(cinemaId);
    await this.db.delete(cinemas).where(eq(cinemas.cinemaId, cinemaId));

    return cinema;
  }

  /* Find One Cinema Helper
   * @desc: Find one cinema by id
   * @param: cinemaId
   * @returns: CinemaResponseDto
   */
  async findOne(cinemaId: number): Promise<CinemaResponseDto> {
    const [cinema] = await this.db
      .select()
      .from(cinemas)
      .where(eq(cinemas.cinemaId, cinemaId));

    if (!cinema) throw new NotFoundException('Cinema not found');

    return cinema;
  }
}
