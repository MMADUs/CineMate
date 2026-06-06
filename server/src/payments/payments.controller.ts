import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentWebhookResponseDto } from './dto/payment-response.dto';
import { XenditInvoiceWebhookDto } from './dto/xendit-webhook.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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
  @ApiBody({ type: XenditInvoiceWebhookDto })
  @ApiOkResponse({ type: PaymentWebhookResponseDto })
  handleNotification(
    @Headers('x-callback-token') callbackToken: string | undefined,
    @Headers('webhook-id') webhookId: string | undefined,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<PaymentWebhookResponseDto> {
    console.log('Xendit webhook-id:', webhookId);
    console.log('Xendit raw body:', req.rawBody?.toString('utf8'));
    console.log('Xendit parsed body:', req.body);

    return this.paymentsService.handleXenditNotification(
      callbackToken,
      req.body as Record<string, unknown>,
      webhookId,
    );
  }
}
