import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Idempotent } from '../common/decorators/idempotent.decorator';
import { JwtAccessGuard } from '../common/guards/jwt-access.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  CreatePaymentResponseDto,
  PaymentWebhookResponseDto,
} from './dto/payment-response.dto';
import { XenditInvoiceWebhookDto } from './dto/xendit-webhook.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /* Create Payment Controller
   * @desc: Create a Xendit invoice for a booking or F&B order
   * @route: /payments
   * @param: AuthUser, CreatePaymentDto
   */
  @UseGuards(JwtAccessGuard)
  @Post()
  @Idempotent()
  @ApiOperation({
    summary: 'Create Xendit hosted checkout invoice',
    description:
      'Creates a pending local payment and a Xendit invoice. The frontend should redirect/open invoiceUrl. Booking/order is confirmed only after webhook payment success.',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description:
      'Required only when IDEMPOTENCY_FLAG=true. Reuse the same UUID for retries of the same payment invoice request.',
  })
  @ApiCreatedResponse({ type: CreatePaymentResponseDto })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePaymentDto,
  ): Promise<CreatePaymentResponseDto> {
    return this.paymentsService.create(user.userId, dto);
  }

  /* Xendit Notification Controller
   * @desc: Receive Xendit invoice payment webhook
   * @route: /payments/notification
   * @param: x-callback-token, XenditInvoiceWebhookDto
   */
  @Post('notification')
  @ApiOperation({
    summary: 'Receive Xendit invoice webhook',
    description:
      'Xendit calls this endpoint when an invoice is PAID, SETTLED, EXPIRED, or FAILED. The backend verifies x-callback-token before updating payment and order status.',
  })
  @ApiHeader({
    name: 'x-callback-token',
    required: true,
    description: 'Xendit callback verification token from dashboard settings.',
  })
  @ApiOkResponse({ type: PaymentWebhookResponseDto })
  handleNotification(
    @Headers('x-callback-token') callbackToken: string | undefined,
    @Body() dto: XenditInvoiceWebhookDto,
  ): Promise<PaymentWebhookResponseDto> {
    return this.paymentsService.handleXenditNotification(callbackToken, dto);
  }
}
