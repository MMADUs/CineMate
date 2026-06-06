import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { FnbOrdersController } from './fnb-orders.controller';
import { FnbOrdersService } from './fnb-orders.service';
import { selectWhere } from '../test-utils/mock-drizzle';

describe('F&B orders feature', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const otherUserId = '660e8400-e29b-41d4-a716-446655440000';
  const order = {
    fnbOrderId: 'fnb-id',
    userId,
    bookingId: null,
    orderDate: '2026-05-28 00:00:00',
    taxAmount: '9900',
    totalAmount: '99900',
    orderStatus: 'PendingPayment',
  };
  const payment = {
    paymentId: 1,
    bookingId: null,
    fnbOrderId: order.fnbOrderId,
    provider: 'XENDIT',
    providerPaymentId: 'invoice-id',
    externalId: 'pay-id',
    invoiceUrl: 'https://checkout.test',
    paymentMethod: 'XENDIT_INVOICE',
    amount: order.totalAmount,
    currency: 'IDR',
    paymentDate: '2026-05-28 00:00:00',
    paymentStatus: 'Pending',
    paidAt: null,
    expiresAt: null,
    failureReason: null,
  };

  it('controller delegates F&B order creation', async () => {
    const service = {
      checkout: jest.fn().mockResolvedValue({
        order: { ...order, items: [], payment, booking: null },
        payment,
      }),
      findUserOrders: jest
        .fn()
        .mockResolvedValue([{ ...order, items: [], booking: null }]),
      findUserOrder: jest
        .fn()
        .mockResolvedValue({ ...order, items: [], booking: null }),
    };
    const controller = new FnbOrdersController(
      service as unknown as FnbOrdersService,
    );

    await expect(
      controller.checkout(
        { userId, email: 'user@mail.test' },
        { items: [{ snackId: 1, quantity: 2 }] },
      ),
    ).resolves.toEqual({
      order: { ...order, items: [], payment, booking: null },
      payment,
    });
    await expect(
      controller.findMine({ userId, email: 'user@mail.test' }),
    ).resolves.toEqual([{ ...order, items: [], booking: null }]);
    await expect(
      controller.findOne({ userId, email: 'user@mail.test' }, 'fnb-id'),
    ).resolves.toEqual({ ...order, items: [], booking: null });
  });

  it('service creates orders with server-side totals and decrements stock', async () => {
    const insertedValues: unknown[] = [];
    const tx = {
      select: jest
        .fn()
        .mockReturnValueOnce(
          selectWhere([
            { snackId: 1, snackName: 'Popcorn', price: '45000', stock: 10 },
            { snackId: 2, snackName: 'Soda', price: '45000', stock: 10 },
          ]),
        )
        .mockReturnValueOnce(selectWhere([order])),
      insert: jest.fn().mockReturnValue({
        values: jest.fn((value: unknown) => {
          insertedValues.push(value);
          return Promise.resolve();
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ affectedRows: 1 }),
        }),
      }),
    };
    const service = new FnbOrdersService(
      {
        transaction: jest.fn(
          (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
        ),
        select: jest
          .fn()
          .mockReturnValueOnce(
            selectWhere([
              {
                order,
                payment,
                booking: null,
                showtime: null,
                movie: null,
                studio: null,
                cinema: null,
              },
            ]),
          )
          .mockReturnValueOnce(
            selectWhere([
              { snackId: 1, quantity: 1, subTotalPrice: '45000' },
              { snackId: 2, quantity: 1, subTotalPrice: '45000' },
            ]),
          ),
      } as never,
      { create: jest.fn().mockResolvedValue(payment) } as never,
      { buildImageUrl: jest.fn() } as never,
    );

    await expect(
      service.checkout(userId, {
        items: [
          { snackId: 1, quantity: 1 },
          { snackId: 2, quantity: 1 },
        ],
      }),
    ).resolves.toEqual({
      order: {
        ...order,
        items: [
          { snackId: 1, quantity: 1, subTotalPrice: '45000' },
          { snackId: 2, quantity: 1, subTotalPrice: '45000' },
        ],
        payment,
        booking: null,
      },
      payment,
    });
    expect(insertedValues[0]).toEqual(
      expect.objectContaining({ taxAmount: '9900', totalAmount: '99900' }),
    );
  });

  it('service rejects orders when snack stock is insufficient', async () => {
    const tx = {
      select: jest
        .fn()
        .mockReturnValueOnce(
          selectWhere([
            { snackId: 1, snackName: 'Popcorn', price: '45000', stock: 1 },
          ]),
        ),
      insert: jest.fn(),
      update: jest.fn(),
    };
    const service = new FnbOrdersService(
      {
        transaction: jest.fn(
          (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
        ),
      } as never,
      { create: jest.fn() } as never,
    );

    await expect(
      service.checkout(userId, { items: [{ snackId: 1, quantity: 2 }] }),
    ).rejects.toThrow(BadRequestException);
    expect(tx.insert).not.toHaveBeenCalled();
  });

  it('service lists and reads authenticated user F&B orders with items', async () => {
    const items = [
      {
        fnbOrderId: 'fnb-id',
        snackId: 1,
        quantity: 2,
        subTotalPrice: '90000',
      },
    ];
    const db = {
      select: jest
        .fn()
        .mockReturnValueOnce(
          selectWhere([
            {
              order,
              payment,
              booking: null,
              showtime: null,
              movie: null,
              studio: null,
              cinema: null,
            },
          ]),
        )
        .mockReturnValueOnce(selectWhere(items))
        .mockReturnValueOnce(
          selectWhere([
            {
              order,
              payment,
              booking: null,
              showtime: null,
              movie: null,
              studio: null,
              cinema: null,
            },
          ]),
        )
        .mockReturnValueOnce(selectWhere(items)),
    };
    const service = new FnbOrdersService(
      db as never,
      {
        create: jest.fn(),
      } as never,
      { buildImageUrl: jest.fn() } as never,
    );

    await expect(service.findUserOrders(userId)).resolves.toEqual([
      { ...order, items, payment, booking: null },
    ]);
    await expect(service.findUserOrder(userId, 'fnb-id')).resolves.toEqual({
      ...order,
      items,
      payment,
      booking: null,
    });
  });

  it('service rejects F&B order detail from another user', async () => {
    const service = new FnbOrdersService(
      {
        select: jest.fn().mockReturnValueOnce(
          selectWhere([
            {
              order: { ...order, userId: otherUserId },
              payment: null,
              booking: null,
              showtime: null,
              movie: null,
              studio: null,
              cinema: null,
            },
          ]),
        ),
      } as never,
      { create: jest.fn() } as never,
      { buildImageUrl: jest.fn() } as never,
    );

    await expect(service.findUserOrder(userId, 'fnb-id')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
