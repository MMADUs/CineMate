import type { ConfigService } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { selectWhere } from '../test-utils/mock-drizzle';

describe('Payments feature', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const payment = {
    paymentId: 1,
    bookingId: 'booking-id',
    fnbOrderId: null,
    provider: 'XENDIT',
    providerPaymentId: 'invoice-id',
    externalId: 'pay-id',
    invoiceUrl: 'https://checkout.test',
    paymentMethod: 'QRIS',
    amount: '55500',
    currency: 'IDR',
    paymentDate: '2026-05-28 00:00:00',
    paymentStatus: 'Pending',
    paidAt: null,
    expiresAt: null,
    failureReason: null,
  };

  it('controller delegates webhook handling', async () => {
    const service = {
      handleXenditNotification: jest.fn().mockResolvedValue({
        received: true,
        paymentStatus: 'Completed',
      }),
    };
    const controller = new PaymentsController(
      service as unknown as PaymentsService,
    );

    await expect(
      controller.handleNotification('callback-token', 'webhook-id', {
        rawBody: Buffer.from('{}'),
        body: {
          id: 'invoice-id',
          external_id: 'pay-id',
          status: 'PAID',
        },
      } as never),
    ).resolves.toEqual({ received: true, paymentStatus: 'Completed' });
    expect(service.handleXenditNotification).toHaveBeenCalledWith(
      'callback-token',
      {
        id: 'invoice-id',
        external_id: 'pay-id',
        status: 'PAID',
      },
      'webhook-id',
    );
  });

  it('service returns existing invoice without calling Xendit again', async () => {
    const db = {
      select: jest
        .fn()
        .mockReturnValueOnce(
          selectWhere([
            {
              userId,
              email: 'user@mail.test',
              fullName: 'User',
              phoneNum: '08123456789',
            },
          ]),
        )
        .mockReturnValueOnce(
          selectWhere([
            {
              bookingId: 'booking-id',
              userId,
              totalAmount: '55500',
              orderStatus: 'PendingPayment',
            },
          ]),
        )
        .mockReturnValueOnce(selectWhere([payment])),
    };
    const configService = { get: jest.fn() } as unknown as ConfigService;
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    const service = new PaymentsService(db, configService);

    await expect(
      service.create(userId, {
        bookingId: 'booking-id',
        paymentMethod: 'QRIS',
      }),
    ).resolves.toEqual(payment);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('service ignores duplicate Xendit webhook events', async () => {
    const db = {
      select: jest
        .fn()
        .mockReturnValueOnce(
          selectWhere([{ ...payment, paymentStatus: 'Completed' }]),
        )
        .mockReturnValueOnce(selectWhere([{ eventId: 1 }])),
      transaction: jest.fn(),
    };
    const configService = {
      get: jest.fn((key: string) =>
        key === 'XENDIT_CALLBACK_TOKEN' ? 'callback-token' : undefined,
      ),
    } as unknown as ConfigService;
    const service = new PaymentsService(db, configService);

    await expect(
      service.handleXenditNotification('callback-token', {
        id: 'invoice-id',
        external_id: 'pay-id',
        status: 'PAID',
        amount: 55500,
      }),
    ).resolves.toEqual({ received: true, paymentStatus: 'Completed' });
    expect(db.transaction).not.toHaveBeenCalled();
  });
});
