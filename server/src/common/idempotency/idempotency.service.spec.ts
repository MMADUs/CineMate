import { ConflictException, ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { IdempotencyService } from './idempotency.service';

describe('IdempotencyService', () => {
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'IDEMPOTENCY_FLAG') return 'true';
      if (key === 'IDEMPOTENCY_TTL_HOURS') return 24;
      return undefined;
    }),
  } as unknown as ConfigService;

  const createService = (db: unknown = {}) =>
    new IdempotencyService(db, configService);

  it('reads feature flag from config', () => {
    expect(createService().isEnabled()).toBe(true);
  });

  it('hashes equivalent request bodies consistently regardless of object key order', () => {
    const service = createService();

    expect(
      service.hashRequest('POST', '/api/bookings', {
        showtimeId: 1,
        seatIds: [1, 2],
      }),
    ).toBe(
      service.hashRequest('POST', '/api/bookings', {
        seatIds: [1, 2],
        showtimeId: 1,
      }),
    );
  });

  it('builds authenticated idempotency scopes', () => {
    const service = createService();

    expect(
      service.buildScope({ userId: '550e8400-e29b-41d4-a716-446655440000' }),
    ).toBe('user:550e8400-e29b-41d4-a716-446655440000');
    expect(service.buildScope({ adminId: 2 })).toBe('admin:2');
    expect(() => service.buildScope(undefined)).toThrow(
      ServiceUnavailableException,
    );
  });

  it('returns cached body for completed duplicate requests', () => {
    const service = createService();

    expect(
      service.resolveDuplicateRecord(
        {
          idempotencyKeyId: 1,
          key: 'key',
          scope: 'user:1',
          method: 'POST',
          route: '/api/bookings',
          requestHash: 'hash',
          status: 'COMPLETED',
          responseStatus: 201,
          responseBody: JSON.stringify({ bookingId: 'booking-id' }),
        },
        'hash',
      ),
    ).toEqual({ bookingId: 'booking-id' });
  });

  it('rejects key reuse with a different request body', () => {
    const service = createService();

    expect(() =>
      service.resolveDuplicateRecord(
        {
          idempotencyKeyId: 1,
          key: 'key',
          scope: 'user:1',
          method: 'POST',
          route: '/api/bookings',
          requestHash: 'first-hash',
          status: 'COMPLETED',
          responseStatus: 201,
          responseBody: '{}',
        },
        'second-hash',
      ),
    ).toThrow(ConflictException);
  });

  it('creates processing records with expiry metadata', async () => {
    const record = {
      idempotencyKeyId: 1,
      key: 'key',
      scope: 'user:1',
      method: 'POST',
      route: '/api/bookings',
      requestHash: 'hash',
      status: 'PROCESSING',
      responseStatus: null,
      responseBody: null,
    };
    const values = jest.fn().mockReturnValue({
      $returningId: jest
        .fn()
        .mockResolvedValue([{ idempotencyKeyId: record.idempotencyKeyId }]),
    });
    const where = jest.fn().mockResolvedValue([record]);
    const db = {
      insert: jest.fn().mockReturnValue({ values }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({ where }),
      }),
    };
    const service = createService(db);

    await expect(
      service.createProcessingRecord({
        key: 'key',
        scope: 'user:1',
        method: 'POST',
        route: '/api/bookings',
        requestHash: 'hash',
      }),
    ).resolves.toEqual(record);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'key',
        status: 'PROCESSING',
      }),
    );
  });
});
