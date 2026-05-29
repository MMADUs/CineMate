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
    showtimeId: null,
    orderDate: '2026-05-28 00:00:00',
    taxAmount: '9900',
    totalAmount: '99900',
    orderStatus: 'Pending',
  };

  it('controller delegates F&B order creation', async () => {
    const service = {
      create: jest.fn().mockResolvedValue({ ...order, items: [] }),
      findUserOrders: jest.fn().mockResolvedValue([{ ...order, items: [] }]),
      findUserOrder: jest.fn().mockResolvedValue({ ...order, items: [] }),
    };
    const controller = new FnbOrdersController(
      service as unknown as FnbOrdersService,
    );

    await expect(
      controller.create(
        { userId, email: 'user@mail.test' },
        { items: [{ snackId: 1, quantity: 2 }] },
      ),
    ).resolves.toEqual({ ...order, items: [] });
    await expect(
      controller.findMine({ userId, email: 'user@mail.test' }),
    ).resolves.toEqual([{ ...order, items: [] }]);
    await expect(
      controller.findOne({ userId, email: 'user@mail.test' }, 'fnb-id'),
    ).resolves.toEqual({ ...order, items: [] });
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
    const service = new FnbOrdersService({
      transaction: jest.fn((callback: (txArg: typeof tx) => Promise<unknown>) =>
        callback(tx),
      ),
    });

    await expect(
      service.create(userId, {
        items: [
          { snackId: 1, quantity: 1 },
          { snackId: 2, quantity: 1 },
        ],
      }),
    ).resolves.toEqual({
      ...order,
      items: [
        { snackId: 1, quantity: 1, subTotalPrice: '45000' },
        { snackId: 2, quantity: 1, subTotalPrice: '45000' },
      ],
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
    const service = new FnbOrdersService({
      transaction: jest.fn((callback: (txArg: typeof tx) => Promise<unknown>) =>
        callback(tx),
      ),
    });

    await expect(
      service.create(userId, { items: [{ snackId: 1, quantity: 2 }] }),
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
        .mockReturnValueOnce(selectWhere([order]))
        .mockReturnValueOnce(selectWhere(items))
        .mockReturnValueOnce(selectWhere([order]))
        .mockReturnValueOnce(selectWhere(items)),
    };
    const service = new FnbOrdersService(db);

    await expect(service.findUserOrders(userId)).resolves.toEqual([
      { ...order, items },
    ]);
    await expect(service.findUserOrder(userId, 'fnb-id')).resolves.toEqual({
      ...order,
      items,
    });
  });

  it('service rejects F&B order detail from another user', async () => {
    const service = new FnbOrdersService({
      select: jest
        .fn()
        .mockReturnValueOnce(selectWhere([{ ...order, userId: otherUserId }])),
    });

    await expect(service.findUserOrder(userId, 'fnb-id')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
