import { BadRequestException } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { selectWhere } from '../test-utils/mock-drizzle';

describe('Bookings feature', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const booking = {
    bookingId: 'booking-id',
    userId,
    showtimeId: 1,
    bookingDate: '2026-05-28 00:00:00',
    taxAmount: '5500',
    totalAmount: '55500',
  };
  const payment = {
    paymentId: 1,
    bookingId: booking.bookingId,
    fnbOrderId: null,
    provider: 'XENDIT',
    providerPaymentId: 'provider-id',
    externalId: 'pay_booking-id',
    invoiceUrl: 'https://checkout.test',
    paymentMethod: 'XENDIT_INVOICE',
    amount: booking.totalAmount,
    currency: 'IDR',
    paymentDate: '2026-05-28 00:00:00',
    paymentStatus: 'Pending',
    paidAt: null,
    expiresAt: null,
    failureReason: null,
  };
  const movie = {
    movieId: 1,
    title: 'Interstellar',
    description: 'Space',
    genre: 'Sci-Fi',
    ageRate: 'PG-13',
    durationMinutes: 169,
    imageKey: 'movies/135c66f9-c917-43b9-a869-a5f5dc08efcc.jpg',
    trailerUrl: '',
    releaseDate: '2026-05-01',
    endDate: '2026-06-01',
    status: 'NOW_PLAYING',
  };
  const showtime = {
    showtimeId: 1,
    movieId: movie.movieId,
    hallId: 1,
    showDate: '2026-05-28',
    showTime: '19:30',
    price: '50000',
  };
  const bookingJoin = {
    booking,
    payment,
    showtime,
    movie,
  };
  const movieImageUrl =
    'http://localhost:3000/api/assets/images/movies/135c66f9-c917-43b9-a869-a5f5dc08efcc.jpg';
  const user = { userId, email: 'user@mail.test' };

  it('controller delegates booking operations', async () => {
    const service = {
      create: jest.fn().mockResolvedValue({ ...booking, seatIds: [1] }),
      findUserBookings: jest.fn().mockResolvedValue([booking]),
      findUserBooking: jest.fn().mockResolvedValue({ ...booking, seats: [] }),
    };
    const controller = new BookingsController(
      service as unknown as BookingsService,
    );

    await expect(
      controller.create(user, { showtimeId: 1, seatIds: [1] }),
    ).resolves.toEqual({
      ...booking,
      seatIds: [1],
    });
    await expect(controller.findMine(user)).resolves.toEqual([booking]);
    await expect(controller.findOne(user, 'booking-id')).resolves.toEqual({
      ...booking,
      seats: [],
    });
  });

  it('service rejects bookings when selected seats are already occupied', async () => {
    const tx = {
      select: jest
        .fn()
        .mockReturnValueOnce(
          selectWhere([{ showtimeId: 1, hallId: 1, price: '50000' }]),
        )
        .mockReturnValueOnce(
          selectWhere([
            { seatId: 10, hallId: 1 },
            { seatId: 11, hallId: 1 },
          ]),
        )
        .mockReturnValueOnce(selectWhere([{ seatId: 10 }])),
      insert: jest.fn(),
    };
    const service = new BookingsService(
      {
        transaction: jest.fn(
          (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx),
        ),
      } as never,
      { buildImageUrl: jest.fn() } as never,
    );

    await expect(
      service.create(userId, { showtimeId: 1, seatIds: [10, 11] }),
    ).rejects.toThrow(BadRequestException);
    expect(tx.insert).not.toHaveBeenCalled();
  });

  it('service returns bookings with payment, showtime, and movie data', async () => {
    const where = jest.fn().mockResolvedValue([bookingJoin]);
    const leftJoin = jest.fn().mockReturnValue({ where });
    const secondInnerJoin = jest.fn().mockReturnValue({ leftJoin });
    const firstInnerJoin = jest.fn().mockReturnValue({
      innerJoin: secondInnerJoin,
    });
    const db = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: firstInnerJoin,
        }),
      }),
    };
    const service = new BookingsService(
      db as never,
      {
        buildImageUrl: jest.fn().mockReturnValue(movieImageUrl),
      } as never,
    );

    await expect(service.findUserBookings(userId)).resolves.toEqual([
      {
        ...booking,
        payment,
        showtime: {
          ...showtime,
          movie: {
            ...movie,
            imageUrl: movieImageUrl,
          },
        },
      },
    ]);
  });
});
