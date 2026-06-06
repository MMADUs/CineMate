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
    orderStatus: 'PendingPayment',
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
    studioId: 1,
    showDate: '2026-05-28',
    showTime: '19:30',
    price: '50000',
  };
  const cinema = {
    cinemaId: 1,
    cinemaName: 'CineMate',
    location: 'Jakarta',
  };
  const studio = {
    studioId: 1,
    cinemaId: 1,
    studioName: 'Studio 1',
    totalRows: 8,
    seatsPerRow: 12,
  };
  const bookingJoin = {
    booking,
    payment,
    showtime,
    movie,
    studio,
    cinema,
  };
  const movieImageUrl =
    'http://localhost:3000/api/assets/images/movies/135c66f9-c917-43b9-a869-a5f5dc08efcc.jpg';
  const user = { userId, email: 'user@mail.test' };

  it('controller delegates booking operations', async () => {
    const service = {
      checkout: jest.fn().mockResolvedValue({
        booking: { ...booking, seats: [] },
        payment,
      }),
      findUserBookings: jest.fn().mockResolvedValue([booking]),
      findUserBooking: jest.fn().mockResolvedValue({ ...booking, seats: [] }),
    };
    const controller = new BookingsController(
      service as unknown as BookingsService,
    );

    await expect(
      controller.checkout(user, { showtimeId: 1, seatIds: [1] }),
    ).resolves.toEqual({
      booking: { ...booking, seats: [] },
      payment,
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
          selectWhere([{ showtimeId: 1, studioId: 1, price: '50000' }]),
        )
        .mockReturnValueOnce(
          selectWhere([
            { seatId: 10, studioId: 1 },
            { seatId: 11, studioId: 1 },
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
      { create: jest.fn() } as never,
      { buildImageUrl: jest.fn() } as never,
    );

    await expect(
      service.checkout(userId, { showtimeId: 1, seatIds: [10, 11] }),
    ).rejects.toThrow(BadRequestException);
    expect(tx.insert).not.toHaveBeenCalled();
  });

  it('service returns bookings with payment, showtime, and movie data', async () => {
    const bookingSeatsResult = [
      {
        bookingId: 'booking-id',
        seatId: 10,
        studioId: 1,
        rowLetter: 'A',
        seatNumber: 1,
      },
      {
        bookingId: 'booking-id',
        seatId: 11,
        studioId: 1,
        rowLetter: 'A',
        seatNumber: 2,
      },
    ];
    const bookingSeatRows = [
      {
        bookingSeat: { bookingId: 'booking-id', seatId: 10 },
        seat: { seatId: 10, studioId: 1, rowLetter: 'A', seatNumber: 1 },
      },
      {
        bookingSeat: { bookingId: 'booking-id', seatId: 11 },
        seat: { seatId: 11, studioId: 1, rowLetter: 'A', seatNumber: 2 },
      },
    ];
    const db = {
      select: jest
        .fn()
        .mockReturnValueOnce(selectWhere([bookingJoin]))
        .mockReturnValueOnce(selectWhere(bookingSeatRows)),
    };
    const service = new BookingsService(
      db as never,
      { create: jest.fn() } as never,
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
          studio: {
            ...studio,
            cinema,
          },
        },
        seats: bookingSeatsResult,
      },
    ]);
  });
});
