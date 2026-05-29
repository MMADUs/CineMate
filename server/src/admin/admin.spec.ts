import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { selectWhere } from '../test-utils/mock-drizzle';

describe('Admin feature', () => {
  const response = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;
  const admin = { adminId: 1, email: 'admin@mail.test', username: 'admin' };

  it('controller delegates admin auth, dashboard, transaction, and log operations', async () => {
    const service = {
      login: jest.fn().mockResolvedValue(admin),
      refresh: jest.fn().mockResolvedValue(admin),
      logout: jest.fn().mockResolvedValue({ message: 'Logged out' }),
      profile: jest.fn().mockResolvedValue(admin),
      dashboard: jest
        .fn()
        .mockResolvedValue({ metrics: {}, chart: [], recentSales: [] }),
      transactions: jest
        .fn()
        .mockResolvedValue({ bookings: [], fnbOrders: [], payments: [] }),
    };
    const controller = new AdminController(service as unknown as AdminService);

    await expect(
      controller.login({ email: admin.email, password: 'secret' }, response),
    ).resolves.toEqual(admin);
    await expect(controller.refresh(admin, response)).resolves.toEqual(admin);
    await expect(controller.logout(admin, response)).resolves.toEqual({
      message: 'Logged out',
    });
    await expect(controller.profile(admin)).resolves.toEqual(admin);
    await expect(controller.dashboard()).resolves.toEqual({
      metrics: {},
      chart: [],
      recentSales: [],
    });
    await expect(controller.transactions()).resolves.toEqual({
      bookings: [],
      fnbOrders: [],
      payments: [],
    });
  });

  it('service computes dashboard metrics and lists transactions', async () => {
    const booking = { bookingId: 'booking-id' };
    const fnbOrder = { fnbOrderId: 'fnb-id' };
    const payment = { paymentId: 1 };
    const db = {
      select: jest
        .fn()
        .mockReturnValueOnce(selectWhere([{ value: '100000' }]))
        .mockReturnValueOnce(selectWhere([{ value: 2 }]))
        .mockReturnValueOnce(selectWhere([{ value: 3 }]))
        .mockReturnValueOnce(selectWhere([{ value: 4 }]))
        .mockReturnValueOnce({ from: jest.fn().mockResolvedValue([booking]) })
        .mockReturnValueOnce({ from: jest.fn().mockResolvedValue([fnbOrder]) })
        .mockReturnValueOnce({ from: jest.fn().mockResolvedValue([payment]) }),
    };
    const service = new AdminService(
      db,
      { signAsync: jest.fn() } as unknown as JwtService,
      { get: jest.fn() } as unknown as ConfigService,
    );

    await expect(service.metrics()).resolves.toEqual({
      totalRevenue: 100000,
      ticketsSold: 2,
      pendingOrders: 3,
      activeMoviesCount: 4,
    });
    await expect(service.transactions()).resolves.toEqual({
      bookings: [booking],
      fnbOrders: [fnbOrder],
      payments: [payment],
    });
  });

  it('service combines dashboard metrics, chart, and recent sales in one response', async () => {
    const service = new AdminService(
      {},
      { signAsync: jest.fn() } as unknown as JwtService,
      { get: jest.fn() } as unknown as ConfigService,
    );
    const metrics = {
      totalRevenue: 100000,
      ticketsSold: 2,
      pendingOrders: 1,
      activeMoviesCount: 4,
    };
    const chart = [{ name: '2026-05-29', total: 100000 }];
    const recentSales = [{ paymentId: 1 }];
    jest.spyOn(service, 'metrics').mockResolvedValue(metrics);
    jest.spyOn(service, 'chart').mockResolvedValue(chart);
    jest.spyOn(service, 'recentSales').mockResolvedValue(recentSales);

    await expect(service.dashboard()).resolves.toEqual({
      metrics,
      chart,
      recentSales,
    });
  });
});
