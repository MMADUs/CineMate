import { CinemaHallsController } from './cinema-halls.controller';
import { CinemaHallsService } from './cinema-halls.service';
import { insertReturning, selectWhere } from '../test-utils/mock-drizzle';

describe('Cinema halls feature', () => {
  const hall = {
    hallId: 1,
    cinemaName: 'CineMate',
    studioName: 'Studio 1',
    totalRows: 2,
    seatsPerRow: 2,
  };

  it('controller delegates hall operations', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([hall]),
      create: jest.fn().mockResolvedValue(hall),
      update: jest.fn().mockResolvedValue(hall),
      remove: jest.fn().mockResolvedValue(hall),
    };
    const controller = new CinemaHallsController(
      service as unknown as CinemaHallsService,
    );

    await expect(controller.findAll()).resolves.toEqual([hall]);
    await expect(controller.create(hall)).resolves.toEqual(hall);
    await expect(controller.update(1, { totalRows: 2 })).resolves.toEqual(hall);
    await expect(controller.remove(1)).resolves.toEqual(hall);
  });

  it('service creates halls and generates seats in one transaction', async () => {
    const seatValues: unknown[] = [];
    const tx = {
      insert: jest
        .fn()
        .mockReturnValueOnce(insertReturning({ hallId: 1 }))
        .mockReturnValueOnce({
          values: jest.fn((values: unknown) => {
            seatValues.push(values);
            return Promise.resolve();
          }),
        }),
      select: jest.fn().mockReturnValue(selectWhere([hall])),
    };
    const service = new CinemaHallsService({
      transaction: jest.fn((callback: (txArg: typeof tx) => Promise<unknown>) =>
        callback(tx),
      ),
    });

    await expect(service.create(hall)).resolves.toEqual(hall);
    expect(seatValues[0]).toEqual([
      { hallId: 1, rowLetter: 'A', seatNumber: 1 },
      { hallId: 1, rowLetter: 'A', seatNumber: 2 },
      { hallId: 1, rowLetter: 'B', seatNumber: 1 },
      { hallId: 1, rowLetter: 'B', seatNumber: 2 },
    ]);
  });
});
