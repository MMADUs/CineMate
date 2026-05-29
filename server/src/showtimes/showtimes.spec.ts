import { ShowtimesController } from './showtimes.controller';
import { ShowtimesService } from './showtimes.service';
import { selectWhere } from '../test-utils/mock-drizzle';

describe('Showtimes feature', () => {
  const showtime = {
    showtimeId: 1,
    movieId: 1,
    hallId: 1,
    showDate: '2026-05-28',
    showTime: '19:00',
    price: '50000',
  };
  const hall = {
    hallId: 1,
    cinemaName: 'CineMate',
    studioName: 'Studio 1',
    totalRows: 1,
    seatsPerRow: 2,
  };

  it('controller delegates showtime operations', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([showtime]),
      getSeats: jest.fn().mockResolvedValue({ hall, seats: [] }),
      create: jest.fn().mockResolvedValue(showtime),
      update: jest.fn().mockResolvedValue(showtime),
      remove: jest.fn().mockResolvedValue(showtime),
    };
    const controller = new ShowtimesController(
      service as unknown as ShowtimesService,
    );

    await expect(controller.findAll({ movieId: 1 })).resolves.toEqual([
      showtime,
    ]);
    await expect(controller.getSeats(1)).resolves.toEqual({ hall, seats: [] });
    await expect(controller.adminFindAll()).resolves.toEqual([showtime]);
    await expect(controller.create(showtime)).resolves.toEqual(showtime);
    await expect(controller.update(1, { price: 50000 })).resolves.toEqual(
      showtime,
    );
    await expect(controller.remove(1)).resolves.toEqual(showtime);
  });

  it('service marks occupied seats in showtime seat layout', async () => {
    const service = new ShowtimesService({
      select: jest
        .fn()
        .mockReturnValueOnce(selectWhere([showtime]))
        .mockReturnValueOnce(selectWhere([hall]))
        .mockReturnValueOnce(
          selectWhere([
            { seatId: 10, hallId: 1, rowLetter: 'A', seatNumber: 1 },
            { seatId: 11, hallId: 1, rowLetter: 'A', seatNumber: 2 },
          ]),
        )
        .mockReturnValueOnce(selectWhere([{ seatId: 10 }])),
    });

    await expect(service.getSeats(1)).resolves.toEqual({
      hall,
      seats: [
        {
          seatId: 10,
          hallId: 1,
          rowLetter: 'A',
          seatNumber: 1,
          isOccupied: true,
        },
        {
          seatId: 11,
          hallId: 1,
          rowLetter: 'A',
          seatNumber: 2,
          isOccupied: false,
        },
      ],
    });
  });
});
