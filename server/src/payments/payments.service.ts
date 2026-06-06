import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { randomUUID } from 'node:crypto';
import { toNumber } from '../common/utils/money';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import {
  bookings,
  fnbOrderItems,
  fnbOrders,
  paymentWebhookEvents,
  payments,
  snacks,
  users,
} from '../database/schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  CreatePaymentResponseDto,
  PaymentWebhookResponseDto,
} from './dto/payment-response.dto';
import { XenditInvoiceWebhookDto } from './dto/xendit-webhook.dto';

interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  status: string;
  invoice_url: string;
  expiry_date?: string;
  amount: number;
  currency?: string;
}

interface CheckoutTarget {
  amount: string;
  description: string;
  bookingId?: string;
  fnbOrderId?: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>,
    private readonly configService: ConfigService,
  ) {}

  /* Create Payment Service
   * @desc: Create a Xendit invoice for a booking or F&B order
   * @param: userId, CreatePaymentDto
   * @returns: Promise<CreatePaymentResponseDto>
   */
  async create(
    userId: string,
    dto: CreatePaymentDto,
  ): Promise<CreatePaymentResponseDto> {
    if (
      (!dto.bookingId && !dto.fnbOrderId) ||
      (dto.bookingId && dto.fnbOrderId)
    ) {
      throw new BadRequestException(
        'Provide exactly one of bookingId or fnbOrderId',
      );
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.userId, userId));

    if (!user) throw new NotFoundException('User not found');

    const target = await this.resolveCheckoutTarget(userId, dto);

    const existing = await this.findExistingPendingPayment(dto);

    if (existing?.invoiceUrl) return existing;

    if (existing)
      throw new BadRequestException('Payment already exists for this order');

    const externalId = `pay_${randomUUID()}`;

    const invoice = await this.createXenditInvoice({
      externalId,
      amount: toNumber(target.amount),
      description: target.description,
      customer: {
        given_names: user.fullName,
        email: user.email,
        mobile_number: user.phoneNum ?? undefined,
      },
    });

    const [insertedPayment] = await this.db
      .insert(payments)
      .values({
        bookingId: target.bookingId,
        fnbOrderId: target.fnbOrderId,
        provider: 'XENDIT',
        providerPaymentId: invoice.id,
        externalId,
        invoiceUrl: invoice.invoice_url,
        paymentMethod: dto.paymentMethod,
        amount: String(invoice.amount),
        currency: invoice.currency ?? 'IDR',
        paymentStatus: 'Pending',
        expiresAt: invoice.expiry_date,
      })
      .$returningId();

    const [payment] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.paymentId, insertedPayment.paymentId));

    return payment as CreatePaymentResponseDto;
  }

  /* Handle Xendit Notification Service
   * @desc: Verify Xendit callback token and update payment/order status
   * @param: callbackToken, payload, webhookId
   * @returns: PaymentWebhookResponseDto
   */
  async handleXenditNotification(
    callbackToken: string | undefined,
    payload: Record<string, unknown>,
    webhookId?: string,
  ): Promise<PaymentWebhookResponseDto> {
    this.verifyCallbackToken(callbackToken);

    const dto = this.parseXenditInvoiceWebhook(payload);

    const [payment] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.externalId, dto.external_id));

    if (!payment) throw new NotFoundException('Payment not found');

    const providerEventId =
      webhookId ?? `${dto.id}:${dto.status}:${dto.paid_at ?? ''}`;

    const [existingEvent] = await this.db
      .select()
      .from(paymentWebhookEvents)
      .where(
        and(
          eq(paymentWebhookEvents.provider, 'XENDIT'),
          eq(paymentWebhookEvents.providerEventId, providerEventId),
        ),
      );

    if (existingEvent) {
      return { received: true, paymentStatus: payment.paymentStatus };
    }

    const nextStatus = this.resolveNextPaymentStatus(
      payment.paymentStatus,
      dto.status,
    );

    await this.db.transaction(async (tx) => {
      await tx.insert(paymentWebhookEvents).values({
        paymentId: payment.paymentId,
        provider: 'XENDIT',
        providerEventId,
        eventType: dto.status,
        payload: JSON.stringify(payload),
      });

      await tx
        .update(payments)
        .set({
          providerPaymentId: dto.payment_id ?? dto.id,
          paymentMethod:
            dto.ewallet_type ??
            dto.payment_channel ??
            dto.payment_method ??
            payment.paymentMethod,
          paymentStatus: nextStatus,
          paidAt: dto.paid_at ?? payment.paidAt,
          failureReason: dto.failure_reason ?? payment.failureReason,
        })
        .where(eq(payments.paymentId, payment.paymentId));

      if (nextStatus === 'Completed') {
        if (payment.bookingId) {
          await tx
            .update(bookings)
            .set({ orderStatus: 'Confirmed' })
            .where(eq(bookings.bookingId, payment.bookingId));
        }

        if (payment.fnbOrderId) {
          await tx
            .update(fnbOrders)
            .set({ orderStatus: 'Confirmed' })
            .where(eq(fnbOrders.fnbOrderId, payment.fnbOrderId));
        }
      }

      if (nextStatus === 'Expired' || nextStatus === 'Failed') {
        if (payment.bookingId) {
          await tx
            .update(bookings)
            .set({ orderStatus: 'Expired' })
            .where(eq(bookings.bookingId, payment.bookingId));
        }

        if (payment.fnbOrderId) {
          if (!this.isFailedOrExpired(payment.paymentStatus)) {
            const items = await tx
              .select()
              .from(fnbOrderItems)
              .where(eq(fnbOrderItems.fnbOrderId, payment.fnbOrderId));

            for (const item of items) {
              await tx
                .update(snacks)
                .set({ stock: sql`${snacks.stock} + ${item.quantity}` })
                .where(eq(snacks.snackId, item.snackId));
            }
          }

          await tx
            .update(fnbOrders)
            .set({ orderStatus: 'Expired' })
            .where(eq(fnbOrders.fnbOrderId, payment.fnbOrderId));
        }
      }
    });

    return { received: true, paymentStatus: nextStatus };
  }

  /* Parse Xendit Invoice Webhook Helper
   * @desc: Extract the invoice fields the app needs from Xendit's variable payload
   * @param: payload
   * @returns: XenditInvoiceWebhookDto
   */
  private parseXenditInvoiceWebhook(
    payload: Record<string, unknown>,
  ): XenditInvoiceWebhookDto {
    const id = this.readRequiredString(payload, 'id');
    const externalId = this.readRequiredString(payload, 'external_id');
    const status = this.readRequiredString(payload, 'status');
    const amount = this.readRequiredNumber(payload, 'amount');

    return {
      id,
      external_id: externalId,
      status,
      amount,
      paid_amount: this.readOptionalNumber(payload, 'paid_amount'),
      paid_at: this.readOptionalString(payload, 'paid_at'),
      payment_method: this.readOptionalString(payload, 'payment_method'),
      payment_channel: this.readOptionalString(payload, 'payment_channel'),
      failure_reason: this.readOptionalString(payload, 'failure_reason'),
      user_id: this.readOptionalString(payload, 'user_id'),
      merchant_name: this.readOptionalString(payload, 'merchant_name'),
      description: this.readOptionalString(payload, 'description'),
      is_high: this.readOptionalBoolean(payload, 'is_high'),
      success_redirect_url: this.readOptionalString(
        payload,
        'success_redirect_url',
      ),
      failure_redirect_url: this.readOptionalString(
        payload,
        'failure_redirect_url',
      ),
      created: this.readOptionalString(payload, 'created'),
      updated: this.readOptionalString(payload, 'updated'),
      currency: this.readOptionalString(payload, 'currency'),
      bank_code: this.readOptionalString(payload, 'bank_code'),
      payment_destination: this.readOptionalString(
        payload,
        'payment_destination',
      ),
      payer_email: this.readOptionalString(payload, 'payer_email'),
      adjusted_received_amount: this.readOptionalNumber(
        payload,
        'adjusted_received_amount',
      ),
      fees_paid_amount: this.readOptionalNumber(payload, 'fees_paid_amount'),
      payment_id: this.readOptionalString(payload, 'payment_id'),
      payment_method_id: this.readOptionalString(payload, 'payment_method_id'),
      ewallet_type: this.readOptionalString(payload, 'ewallet_type'),
    };
  }

  /* Read Required String Helper
   * @desc: Read a required string field from a provider payload
   * @param: payload, key
   * @returns: string
   */
  private readRequiredString(
    payload: Record<string, unknown>,
    key: string,
  ): string {
    const value = payload[key];

    if (typeof value !== 'string' || !value) {
      throw new BadRequestException(`Invalid Xendit webhook field: ${key}`);
    }

    return value;
  }

  /* Read Optional String Helper
   * @desc: Read an optional string field from a provider payload
   * @param: payload, key
   * @returns: string | undefined
   */
  private readOptionalString(
    payload: Record<string, unknown>,
    key: string,
  ): string | undefined {
    const value = payload[key];

    return typeof value === 'string' ? value : undefined;
  }

  /* Read Required Number Helper
   * @desc: Read a required number field from a provider payload
   * @param: payload, key
   * @returns: number
   */
  private readRequiredNumber(
    payload: Record<string, unknown>,
    key: string,
  ): number {
    const value = payload[key];

    if (typeof value !== 'number') {
      throw new BadRequestException(`Invalid Xendit webhook field: ${key}`);
    }

    return value;
  }

  /* Read Optional Number Helper
   * @desc: Read an optional number field from a provider payload
   * @param: payload, key
   * @returns: number | undefined
   */
  private readOptionalNumber(
    payload: Record<string, unknown>,
    key: string,
  ): number | undefined {
    const value = payload[key];

    return typeof value === 'number' ? value : undefined;
  }

  /* Read Optional Boolean Helper
   * @desc: Read an optional boolean field from a provider payload
   * @param: payload, key
   * @returns: boolean | undefined
   */
  private readOptionalBoolean(
    payload: Record<string, unknown>,
    key: string,
  ): boolean | undefined {
    const value = payload[key];

    return typeof value === 'boolean' ? value : undefined;
  }

  /* Resolve Checkout Target Helper
   * @desc: Validate order ownership and determine amount/description
   * @param: userId, CreatePaymentDto
   * @returns: CheckoutTarget
   */
  private async resolveCheckoutTarget(
    userId: string,
    dto: CreatePaymentDto,
  ): Promise<CheckoutTarget> {
    if (dto.bookingId) {
      const [booking] = await this.db
        .select()
        .from(bookings)
        .where(eq(bookings.bookingId, dto.bookingId));

      if (!booking) throw new NotFoundException('Booking not found');

      if (booking.userId !== userId)
        throw new ForbiddenException('Booking does not belong to this user');

      if (booking.orderStatus !== 'PendingPayment')
        throw new BadRequestException('Booking is not payable');

      return {
        bookingId: booking.bookingId,
        amount: booking.totalAmount,
        description: `CineMate booking ${booking.bookingId}`,
      };
    }

    const [order] = await this.db
      .select()
      .from(fnbOrders)
      .where(eq(fnbOrders.fnbOrderId, dto.fnbOrderId!));

    if (!order) throw new NotFoundException('FNB order not found');

    if (order.userId !== userId)
      throw new ForbiddenException('FNB order does not belong to this user');

    if (order.orderStatus !== 'PendingPayment')
      throw new BadRequestException('FNB order is not payable');

    return {
      fnbOrderId: order.fnbOrderId,
      amount: order.totalAmount,
      description: `CineMate F&B order ${order.fnbOrderId}`,
    };
  }

  /* Find Existing Pending Payment Helper
   * @desc: Find an existing payment for the selected order
   * @param: CreatePaymentDto
   * @returns: CreatePaymentResponseDto | null
   */
  private async findExistingPendingPayment(
    dto: CreatePaymentDto,
  ): Promise<CreatePaymentResponseDto | null> {
    if (dto.bookingId) {
      const [payment] = await this.db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.bookingId, dto.bookingId),
            isNotNull(payments.invoiceUrl),
          ),
        );

      return payment?.invoiceUrl ? (payment as CreatePaymentResponseDto) : null;
    }

    const [payment] = await this.db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.fnbOrderId, dto.fnbOrderId!),
          isNotNull(payments.invoiceUrl),
        ),
      );

    return payment?.invoiceUrl ? (payment as CreatePaymentResponseDto) : null;
  }

  /* Create Xendit Invoice Helper
   * @desc: Call Xendit Create Invoice API
   * @param: invoice payload
   * @returns: Promise<XenditInvoiceResponse>
   */
  private async createXenditInvoice(params: {
    externalId: string;
    amount: number;
    description: string;
    customer: {
      given_names: string;
      email: string;
      mobile_number?: string;
    };
  }): Promise<XenditInvoiceResponse> {
    const apiKey = this.configService.get<string>('XENDIT_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'XENDIT_API_KEY is not configured',
      );
    }

    const response = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: params.externalId,
        amount: params.amount,
        description: params.description,
        currency: 'IDR',
        invoice_duration: Number(
          this.configService.get<number>('XENDIT_INVOICE_DURATION_SECONDS') ??
            24 * 60 * 60,
        ),
        customer: params.customer,
        success_redirect_url: this.configService.get<string>(
          'FRONTEND_SUCCESS_URL',
        ),
        failure_redirect_url: this.configService.get<string>(
          'FRONTEND_FAILURE_URL',
        ),
      }),
    });

    const body = (await response.json()) as XenditInvoiceResponse & {
      message?: string;
      error_code?: string;
    };

    if (!response.ok) {
      throw new BadRequestException({
        message: 'Failed to create Xendit invoice',
        providerError: body,
      });
    }

    return body;
  }

  /* Verify Callback Token Helper
   * @desc: Verify Xendit's x-callback-token header
   * @param: callbackToken
   * @returns: void
   */
  private verifyCallbackToken(callbackToken: string | undefined): void {
    const expectedToken = this.configService.get<string>(
      'XENDIT_CALLBACK_TOKEN',
    );

    if (!expectedToken) {
      throw new InternalServerErrorException(
        'XENDIT_CALLBACK_TOKEN is not configured',
      );
    }

    if (callbackToken !== expectedToken) {
      throw new UnauthorizedException('Invalid Xendit callback token');
    }
  }

  /* Map Xendit Status Helper
   * @desc: Convert Xendit invoice status to local payment status
   * @param: status
   * @returns: string
   */
  private mapXenditStatus(status: string): string {
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'SETTLED':
        return 'Completed';
      case 'EXPIRED':
        return 'Expired';
      case 'FAILED':
        return 'Failed';
      default:
        return 'Pending';
    }
  }

  /* Resolve Next Payment Status Helper
   * @desc: Prevent terminal completed payments from being downgraded by later webhook events
   * @param: currentStatus, providerStatus
   * @returns: string
   */
  private resolveNextPaymentStatus(
    currentStatus: string,
    providerStatus: string,
  ): string {
    if (this.isTerminalPaymentStatus(currentStatus)) return currentStatus;

    return this.mapXenditStatus(providerStatus);
  }

  /* Is Terminal Payment Status Helper
   * @desc: Detect whether a payment attempt should no longer transition
   * @param: paymentStatus
   * @returns: boolean
   */
  private isTerminalPaymentStatus(paymentStatus: string): boolean {
    return ['Completed', 'Expired', 'Failed'].includes(paymentStatus);
  }

  /* Is Failed Or Expired Helper
   * @desc: Detect whether reserved stock was already released
   * @param: paymentStatus
   * @returns: boolean
   */
  private isFailedOrExpired(paymentStatus: string): boolean {
    return ['Expired', 'Failed'].includes(paymentStatus);
  }
}
