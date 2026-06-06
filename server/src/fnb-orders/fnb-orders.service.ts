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
  payments,
  snacks,
  users,
  bookings,
  showtimes,
  movies,
  studios,
  cinemas,
  bookingSeats,
  seats,
} from '../database/schema';
import { PaymentsService } from '../payments/payments.service';
import { StorageService } from '../storage/storage.service';
import { CreateFnbOrderDto } from './dto/create-fnb-order.dto';
import {
  AdminFnbOrderResponseDto,
  FnbOrderCheckoutResponseDto,
  FnbOrderResponseDto,
} from './dto/fnb-order-response.dto';

@Injectable()
export class FnbOrdersService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: MySql2Database<typeof schema>,
    private readonly paymentsService: PaymentsService,
    private readonly storageService: StorageService,
  ) {}

  /* Checkout FNB Order Service
   * @desc: Create a pending F&B order and Xendit payment invoice
   * @param: userId, CreateFnbOrderDto
   * @returns: FnbOrderCheckoutResponseDto
   */
  async checkout(
    userId: string,
    dto: CreateFnbOrderDto,
  ): Promise<FnbOrderCheckoutResponseDto> {
    // first create order with pending status
    const order = await this.createPendingOrder(userId, dto);

    try {
      // create payment for the order
      const payment = await this.paymentsService.create(userId, {
        fnbOrderId: order.fnbOrderId,
        paymentMethod: 'XENDIT_INVOICE',
      });

      return {
        order: await this.findUserOrder(userId, order.fnbOrderId),
        payment,
      };
    } catch (error) {
      // if error occured during payment creation, restore stock
      await this.expireOrderAndRestoreStock(order.fnbOrderId);
      throw error;
    }
  }

  /* Create Pending FNB Order Helper
   * @desc: Reserve snack stock with PendingPayment order status
   * @param: userId, CreateFnbOrderDto
   * @returns: FnbOrderResponseDto
   */
  private async createPendingOrder(
    userId: string,
    dto: CreateFnbOrderDto,
  ): Promise<FnbOrderResponseDto> {
    // start db transaction
    return await this.db.transaction(async (tx) => {
      // verify optional booking reference
      if (dto.bookingId) {
        const [booking] = await tx
          .select()
          .from(bookings)
          .where(eq(bookings.bookingId, dto.bookingId));

        if (!booking) throw new NotFoundException('Booking not found');

        if (booking.userId !== userId)
          throw new ForbiddenException('Booking does not belong to this user');
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
        bookingId: dto.bookingId ?? null,
        orderStatus: 'PendingPayment',
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
    const rows = await this.db
      .select({
        order: fnbOrders,
        payment: payments,
        booking: bookings,
        showtime: showtimes,
        movie: movies,
        studio: studios,
        cinema: cinemas,
      })
      .from(fnbOrders)
      .leftJoin(payments, eq(fnbOrders.fnbOrderId, payments.fnbOrderId))
      .leftJoin(bookings, eq(fnbOrders.bookingId, bookings.bookingId))
      .leftJoin(showtimes, eq(bookings.showtimeId, showtimes.showtimeId))
      .leftJoin(movies, eq(showtimes.movieId, movies.movieId))
      .leftJoin(studios, eq(showtimes.studioId, studios.studioId))
      .leftJoin(cinemas, eq(studios.cinemaId, cinemas.cinemaId))
      .where(eq(fnbOrders.userId, userId));

    if (!rows.length) return [];

    const items = await this.db
      .select()
      .from(fnbOrderItems)
      .where(
        inArray(
          fnbOrderItems.fnbOrderId,
          rows.map((row) => row.order.fnbOrderId),
        ),
      );

    const bookingSeats = await this.findSeatsForBookings(
      rows
        .map((row) => row.booking?.bookingId)
        .filter((bookingId): bookingId is string => Boolean(bookingId)),
    );

    return rows.map((row) =>
      this.toFnbOrderResponse(
        row,
        items.filter((item) => item.fnbOrderId === row.order.fnbOrderId),
        bookingSeats,
      ),
    );
  }

  /* Find All FNB Orders For Admin
   * @desc: Find all F&B orders with user, items, and payment
   * @param: none
   * @returns: AdminFnbOrderResponseDto[]
   */
  async findAllForAdmin(): Promise<AdminFnbOrderResponseDto[]> {
    const rows = await this.db
      .select({
        order: fnbOrders,
        payment: payments,
        booking: bookings,
        showtime: showtimes,
        movie: movies,
        studio: studios,
        cinema: cinemas,
        user: users,
      })
      .from(fnbOrders)
      .innerJoin(users, eq(fnbOrders.userId, users.userId))
      .leftJoin(payments, eq(fnbOrders.fnbOrderId, payments.fnbOrderId))
      .leftJoin(bookings, eq(fnbOrders.bookingId, bookings.bookingId))
      .leftJoin(showtimes, eq(bookings.showtimeId, showtimes.showtimeId))
      .leftJoin(movies, eq(showtimes.movieId, movies.movieId))
      .leftJoin(studios, eq(showtimes.studioId, studios.studioId))
      .leftJoin(cinemas, eq(studios.cinemaId, cinemas.cinemaId));

    if (!rows.length) return [];

    const items = await this.db
      .select()
      .from(fnbOrderItems)
      .where(
        inArray(
          fnbOrderItems.fnbOrderId,
          rows.map((row) => row.order.fnbOrderId),
        ),
      );

    const bookingSeats = await this.findSeatsForBookings(
      rows
        .map((row) => row.booking?.bookingId)
        .filter((bookingId): bookingId is string => Boolean(bookingId)),
    );

    return rows.map((row) => ({
      ...this.toFnbOrderResponse(
        row,
        items.filter((item) => item.fnbOrderId === row.order.fnbOrderId),
        bookingSeats,
      ),
      user: this.toUserResponse(row.user),
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
    const [row] = await this.db
      .select({
        order: fnbOrders,
        payment: payments,
        booking: bookings,
        showtime: showtimes,
        movie: movies,
        studio: studios,
        cinema: cinemas,
      })
      .from(fnbOrders)
      .leftJoin(payments, eq(fnbOrders.fnbOrderId, payments.fnbOrderId))
      .leftJoin(bookings, eq(fnbOrders.bookingId, bookings.bookingId))
      .leftJoin(showtimes, eq(bookings.showtimeId, showtimes.showtimeId))
      .leftJoin(movies, eq(showtimes.movieId, movies.movieId))
      .leftJoin(studios, eq(showtimes.studioId, studios.studioId))
      .leftJoin(cinemas, eq(studios.cinemaId, cinemas.cinemaId))
      .where(eq(fnbOrders.fnbOrderId, fnbOrderId));

    if (!row) throw new NotFoundException('F&B order not found');

    if (row.order.userId !== userId)
      throw new ForbiddenException('F&B order does not belong to this user');

    const items = await this.db
      .select()
      .from(fnbOrderItems)
      .where(eq(fnbOrderItems.fnbOrderId, fnbOrderId));

    const bookedSeats = row.booking
      ? await this.findSeatsForBookings([row.booking.bookingId])
      : [];

    return this.toFnbOrderResponse(row, items, bookedSeats);
  }

  /* Expire Order And Restore Stock Helper
   * @desc: Mark pending F&B order expired and restore reserved stock
   * @param: fnbOrderId
   * @returns: Promise<void>
   */
  private async expireOrderAndRestoreStock(fnbOrderId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      // get order items
      const orderItems = await tx
        .select()
        .from(fnbOrderItems)
        .where(eq(fnbOrderItems.fnbOrderId, fnbOrderId));

      // restore stock
      for (const item of orderItems) {
        await tx
          .update(snacks)
          .set({ stock: sql`${snacks.stock} + ${item.quantity}` })
          .where(eq(snacks.snackId, item.snackId));
      }

      // update order status
      await tx
        .update(fnbOrders)
        .set({ orderStatus: 'Expired' })
        .where(eq(fnbOrders.fnbOrderId, fnbOrderId));
    });
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

  /* Find Seats For Bookings Helper
   * @desc: Get booked seat details for multiple booking IDs
   * @param: bookingIds
   * @returns: booking seat response values
   */
  private async findSeatsForBookings(bookingIds: string[]) {
    if (!bookingIds.length) return [];

    const rows = await this.db
      .select({
        bookingSeat: bookingSeats,
        seat: seats,
      })
      .from(bookingSeats)
      .innerJoin(seats, eq(bookingSeats.seatId, seats.seatId))
      .where(inArray(bookingSeats.bookingId, bookingIds));

    return rows.map((row) => this.toBookingSeatResponse(row));
  }

  /* To FNB Order Response Helper
   * @desc: Map F&B joins into response with optional booking context
   * @param: joined row, items, booked seats
   * @returns: FnbOrderResponseDto
   */
  private toFnbOrderResponse(
    row: {
      order: typeof fnbOrders.$inferSelect;
      payment: typeof payments.$inferSelect | null;
      booking: typeof bookings.$inferSelect | null;
      showtime: typeof showtimes.$inferSelect | null;
      movie: typeof movies.$inferSelect | null;
      studio: typeof studios.$inferSelect | null;
      cinema: typeof cinemas.$inferSelect | null;
    },
    items: (typeof fnbOrderItems.$inferSelect)[],
    bookedSeats: {
      bookingId: string;
      seatId: number;
      studioId: number;
      rowLetter: string;
      seatNumber: number;
    }[],
  ): FnbOrderResponseDto {
    return {
      ...row.order,
      payment: row.payment,
      items,
      booking:
        row.booking && row.showtime && row.movie && row.studio && row.cinema
          ? {
              ...row.booking,
              payment: null,
              seats: bookedSeats.filter(
                (seat) => seat.bookingId === row.booking!.bookingId,
              ),
              showtime: {
                ...row.showtime,
                movie: {
                  ...row.movie,
                  imageUrl: this.storageService.buildImageUrl(
                    row.movie.imageKey,
                  ),
                },
                studio: {
                  ...row.studio,
                  cinema: row.cinema,
                },
              },
            }
          : null,
    };
  }

  private toBookingSeatResponse(row: {
    bookingSeat: typeof bookingSeats.$inferSelect;
    seat: typeof seats.$inferSelect;
  }) {
    return {
      bookingId: row.bookingSeat.bookingId,
      seatId: row.seat.seatId,
      studioId: row.seat.studioId,
      rowLetter: row.seat.rowLetter,
      seatNumber: row.seat.seatNumber,
    };
  }

  private toUserResponse(user: typeof users.$inferSelect) {
    return {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      phoneNum: user.phoneNum,
      authProvider: user.authProvider,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }
}
