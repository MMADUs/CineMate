import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, gte, inArray, sql } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { randomUUID } from 'node:crypto';
import { calculateTaxedTotal, toNumber } from '../common/utils/money';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import {
  fnbOrderItems,
  fnbOrders,
  showtimes,
  snacks,
} from '../database/schema';
import { CreateFnbOrderDto } from './dto/create-fnb-order.dto';
import { FnbOrderResponseDto } from './dto/fnb-order-response.dto';

@Injectable()
export class FnbOrdersService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: MySql2Database<typeof schema>,
  ) {}

  /* Create FNB Order Service
   * @desc: Create an F&B order and calculate totals server-side
   * @param: userId, CreateFnbOrderDto
   * @returns: FnbOrderResponseDto
   */
  async create(
    userId: string,
    dto: CreateFnbOrderDto,
  ): Promise<FnbOrderResponseDto> {
    // start db transaction
    return await this.db.transaction(async (tx) => {
      // verify optional showtime reference
      if (dto.showtimeId) {
        const [showtime] = await tx
          .select()
          .from(showtimes)
          .where(eq(showtimes.showtimeId, dto.showtimeId));

        if (!showtime) throw new NotFoundException('Showtime not found');
      }

      // aggregate repeated snack items before stock and total calculation
      const quantityBySnackId = new Map<number, number>();
      for (const item of dto.items) {
        quantityBySnackId.set(
          item.snackId,
          (quantityBySnackId.get(item.snackId) ?? 0) + item.quantity,
        );
      }

      // get snack ids
      const ids = [...quantityBySnackId.keys()];

      // get snacks
      const foundSnacks = await tx
        .select()
        .from(snacks)
        .where(inArray(snacks.snackId, ids));

      // check if any snacks are missing
      if (foundSnacks.length !== new Set(ids).size)
        throw new BadRequestException('One or more snacks were not found');

      // create map of snacks
      const byId = new Map(foundSnacks.map((snack) => [snack.snackId, snack]));

      // build order items
      const orderItems = ids.map((snackId) => {
        const snack = byId.get(snackId)!;
        const quantity = quantityBySnackId.get(snackId)!;

        if (snack.stock < quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${snack.snackName}`,
          );
        }

        return {
          snackId,
          quantity,
          subTotalPrice: String(toNumber(snack.price) * quantity),
        };
      });

      // calculate total snack price
      const totals = calculateTaxedTotal(
        orderItems.reduce((sum, item) => sum + toNumber(item.subTotalPrice), 0),
      );

      // create fnb order
      const fnbOrderId = randomUUID();
      await tx.insert(fnbOrders).values({
        fnbOrderId,
        userId,
        showtimeId: dto.showtimeId ?? null,
        ...totals,
      });

      const [order] = await tx
        .select()
        .from(fnbOrders)
        .where(eq(fnbOrders.fnbOrderId, fnbOrderId));

      // decrement stock with a conditional update as a concurrency guard
      for (const item of orderItems) {
        const stockUpdateResult = await tx
          .update(snacks)
          .set({ stock: sql`${snacks.stock} - ${item.quantity}` })
          .where(
            and(
              eq(snacks.snackId, item.snackId),
              gte(snacks.stock, item.quantity),
            ),
          );

        if (this.getAffectedRows(stockUpdateResult) === 0) {
          throw new BadRequestException(
            `Insufficient stock for snack ${item.snackId}`,
          );
        }
      }

      // insert fnb order items
      await tx
        .insert(fnbOrderItems)
        .values(
          orderItems.map((item) => ({ fnbOrderId: order.fnbOrderId, ...item })),
        );

      return { ...order, items: orderItems };
    });
  }

  /* Find User FNB Orders Service
   * @desc: Find all F&B orders for a user
   * @param: userId
   * @returns: FnbOrderResponseDto[]
   */
  async findUserOrders(userId: string): Promise<FnbOrderResponseDto[]> {
    const orders = await this.db
      .select()
      .from(fnbOrders)
      .where(eq(fnbOrders.userId, userId));

    if (!orders.length) return [];

    const items = await this.db
      .select()
      .from(fnbOrderItems)
      .where(
        inArray(
          fnbOrderItems.fnbOrderId,
          orders.map((order) => order.fnbOrderId),
        ),
      );

    return orders.map((order) => ({
      ...order,
      items: items.filter((item) => item.fnbOrderId === order.fnbOrderId),
    }));
  }

  /* Find User FNB Order Service
   * @desc: Find one F&B order detail for a user
   * @param: userId, fnbOrderId
   * @returns: FnbOrderResponseDto
   */
  async findUserOrder(
    userId: string,
    fnbOrderId: string,
  ): Promise<FnbOrderResponseDto> {
    const [order] = await this.db
      .select()
      .from(fnbOrders)
      .where(eq(fnbOrders.fnbOrderId, fnbOrderId));

    if (!order) throw new NotFoundException('F&B order not found');
    if (order.userId !== userId)
      throw new ForbiddenException('F&B order does not belong to this user');

    const items = await this.db
      .select()
      .from(fnbOrderItems)
      .where(eq(fnbOrderItems.fnbOrderId, fnbOrderId));

    return { ...order, items };
  }

  /* Get Affected Rows Helper
   * @desc: Read affected row count from mysql2/drizzle mutation results
   * @param: result
   * @returns: number | undefined
   */
  private getAffectedRows(result: unknown): number | undefined {
    const value: unknown = Array.isArray(result) ? result[0] : result;

    if (typeof value !== 'object' || value === null) return undefined;

    const mutationResult = value as {
      affectedRows?: unknown;
      rowsAffected?: unknown;
    };

    if (typeof mutationResult.affectedRows === 'number')
      return mutationResult.affectedRows;

    if (typeof mutationResult.rowsAffected === 'number')
      return mutationResult.rowsAffected;

    return undefined;
  }
}
