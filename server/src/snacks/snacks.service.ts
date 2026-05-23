import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import { snacks } from '../database/schema';
import { CreateSnackDto } from './dto/create-snack.dto';
import { QuerySnackDto } from './dto/query-snack.dto';
import { SnackResponseDto } from './dto/snack-response.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';

@Injectable()
export class SnacksService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: BetterSQLite3Database<typeof schema>,
  ) {}

  /* Find All Snacks Service
   * @desc: List snacks with optional category filter
   * @param: QuerySnackDto
   * @returns: SnackResponseDto[]
   */
  findAll(query: QuerySnackDto = {}): SnackResponseDto[] {
    return query.category
      ? this.db
          .select()
          .from(snacks)
          .where(eq(snacks.category, query.category))
          .all()
      : this.db.select().from(snacks).all();
  }

  /* Create Snack Service
   * @desc: Create a snack
   * @param: CreateSnackDto
   * @returns: SnackResponseDto
   */
  create(dto: CreateSnackDto): SnackResponseDto {
    const snack = this.db
      .insert(snacks)
      .values({
        ...dto,
        price: String(dto.price),
        imageUrl: dto.imageUrl ?? '',
      })
      .returning()
      .get();

    return snack;
  }

  /* Update Snack Service
   * @desc: Update a snack
   * @param: snackId, UpdateSnackDto
   * @returns: SnackResponseDto
   */
  update(snackId: number, dto: UpdateSnackDto): SnackResponseDto {
    const snack = this.db
      .update(snacks)
      .set({
        ...dto,
        price: dto.price === undefined ? undefined : String(dto.price),
      })
      .where(eq(snacks.snackId, snackId))
      .returning()
      .get();

    // check if snack doesn't exist
    if (!snack) throw new NotFoundException('Snack not found');

    return snack;
  }

  /* Remove Snack Service
   * @desc: Delete a snack
   * @param: snackId
   * @returns: SnackResponseDto
   */
  remove(snackId: number): SnackResponseDto {
    const snack = this.db
      .delete(snacks)
      .where(eq(snacks.snackId, snackId))
      .returning()
      .get();

    // check if snack doesn't exist
    if (!snack) throw new NotFoundException('Snack not found');

    return snack;
  }
}
