import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
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
    private readonly db: MySql2Database<typeof schema>,
  ) {}

  /* Find All Snacks Service
   * @desc: List snacks with optional category filter
   * @param: QuerySnackDto
   * @returns: SnackResponseDto[]
   */
  async findAll(query: QuerySnackDto = {}): Promise<SnackResponseDto[]> {
    return query.category
      ? await this.db
          .select()
          .from(snacks)
          .where(eq(snacks.category, query.category))
      : await this.db.select().from(snacks);
  }

  /* Create Snack Service
   * @desc: Create a snack
   * @param: CreateSnackDto
   * @returns: SnackResponseDto
   */
  async create(dto: CreateSnackDto): Promise<SnackResponseDto> {
    const [insertedSnack] = await this.db
      .insert(snacks)
      .values({
        ...dto,
        price: String(dto.price),
        imageUrl: dto.imageUrl ?? '',
      })
      .$returningId();

    return this.findOne(insertedSnack.snackId);
  }

  /* Update Snack Service
   * @desc: Update a snack
   * @param: snackId, UpdateSnackDto
   * @returns: SnackResponseDto
   */
  async update(
    snackId: number,
    dto: UpdateSnackDto,
  ): Promise<SnackResponseDto> {
    await this.findOne(snackId);
    await this.db
      .update(snacks)
      .set({
        ...dto,
        price: dto.price === undefined ? undefined : String(dto.price),
      })
      .where(eq(snacks.snackId, snackId));

    return this.findOne(snackId);
  }

  /* Remove Snack Service
   * @desc: Delete a snack
   * @param: snackId
   * @returns: SnackResponseDto
   */
  async remove(snackId: number): Promise<SnackResponseDto> {
    const snack = await this.findOne(snackId);
    await this.db.delete(snacks).where(eq(snacks.snackId, snackId));

    return snack;
  }

  /* Find One Snack Helper
   * @desc: Get snack detail by ID
   * @param: snackId
   * @returns: SnackResponseDto
   */
  private async findOne(snackId: number): Promise<SnackResponseDto> {
    const [snack] = await this.db
      .select()
      .from(snacks)
      .where(eq(snacks.snackId, snackId));

    // check if snack doesn't exist
    if (!snack) throw new NotFoundException('Snack not found');

    return snack;
  }
}
