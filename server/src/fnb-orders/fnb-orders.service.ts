import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { randomUUID } from 'node:crypto';
import { calculateTaxedTotal, toNumber } from '../common/utils/money';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import { fnbOrderItems, fnbOrders, snacks } from '../database/schema';
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
    userId: number,
    dto: CreateFnbOrderDto,
  ): Promise<FnbOrderResponseDto> {
    // start db transaction
    return await this.db.transaction(async (tx) => {
      // get snack ids
      const ids = dto.items.map((item) => item.snackId);

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
      const orderItems = dto.items.map((item) => {
        const snack = byId.get(item.snackId)!;
        return {
          snackId: item.snackId,
          quantity: item.quantity,
          subTotalPrice: String(toNumber(snack.price) * item.quantity),
        };
      });

      // calculate total snack price
      const totals = calculateTaxedTotal(
        orderItems.reduce((sum, item) => sum + toNumber(item.subTotalPrice), 0),
      );

      // create fnb order
      const fnbOrderId = randomUUID();
      await tx.insert(fnbOrders).values({ fnbOrderId, userId, ...totals });

      const [order] = await tx
        .select()
        .from(fnbOrders)
        .where(eq(fnbOrders.fnbOrderId, fnbOrderId));

      // insert fnb order items
      await tx
        .insert(fnbOrderItems)
        .values(
          orderItems.map((item) => ({ fnbOrderId: order.fnbOrderId, ...item })),
        );

      return { ...order, items: orderItems };
    });
  }
}
