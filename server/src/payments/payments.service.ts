import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import { bookings, fnbOrders, payments } from '../database/schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: BetterSQLite3Database<typeof schema>,
  ) {}

  /* Create Payment Service
   * @desc: Create a payment for a booking or F&B order
   * @param: userId, CreatePaymentDto
   * @returns: PaymentResponseDto
   */
  create(userId: number, dto: CreatePaymentDto): PaymentResponseDto {
    if (
      (!dto.bookingId && !dto.fnbOrderId) ||
      (dto.bookingId && dto.fnbOrderId)
    ) {
      throw new BadRequestException(
        'Provide exactly one of bookingId or fnbOrderId',
      );
    }
    return this.db.transaction((tx) => {
      if (dto.bookingId) {
        const booking = tx
          .select()
          .from(bookings)
          .where(eq(bookings.bookingId, dto.bookingId))
          .get();
        if (!booking) throw new NotFoundException('Booking not found');
        if (booking.userId !== userId)
          throw new ForbiddenException('Booking does not belong to this user');
        const existing = tx
          .select()
          .from(payments)
          .where(eq(payments.bookingId, dto.bookingId))
          .get();
        if (existing)
          throw new BadRequestException(
            'Payment already exists for this booking',
          );
        const payment = tx
          .insert(payments)
          .values({
            bookingId: dto.bookingId,
            paymentMethod: dto.paymentMethod,
            amount: booking.totalAmount,
            paymentStatus: 'Completed',
          })
          .returning()
          .get();
        tx.update(bookings)
          .set({ bookingStatus: 'Confirmed' })
          .where(eq(bookings.bookingId, dto.bookingId))
          .run();
        return payment;
      }
      const order = tx
        .select()
        .from(fnbOrders)
        .where(eq(fnbOrders.fnbOrderId, dto.fnbOrderId!))
        .get();
      if (!order) throw new NotFoundException('FNB order not found');
      if (order.userId !== userId)
        throw new ForbiddenException('FNB order does not belong to this user');
      const existing = tx
        .select()
        .from(payments)
        .where(eq(payments.fnbOrderId, dto.fnbOrderId!))
        .get();
      if (existing)
        throw new BadRequestException(
          'Payment already exists for this FNB order',
        );
      const payment = tx
        .insert(payments)
        .values({
          fnbOrderId: dto.fnbOrderId,
          paymentMethod: dto.paymentMethod,
          amount: order.totalAmount,
          paymentStatus: 'Completed',
        })
        .returning()
        .get();
      tx.update(fnbOrders)
        .set({ orderStatus: 'Confirmed' })
        .where(eq(fnbOrders.fnbOrderId, dto.fnbOrderId!))
        .run();
      return payment;
    });
  }
}
