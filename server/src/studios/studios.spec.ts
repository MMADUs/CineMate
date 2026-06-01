import { StudiosController } from './studios.controller';
import { StudiosService } from './studios.service';
import { insertReturning, selectWhere } from '../test-utils/mock-drizzle';

describe('Studios feature', () => {
  const cinema = {
    cinemaId: 1,
    cinemaName: 'CineMate',
    location: 'Jakarta',
  };
  const studio = {
    studioId: 1,
    cinemaId: 1,
    studioName: 'Studio 1',
    totalRows: 2,
    seatsPerRow: 2,
  };

  it('controller delegates studio operations', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([studio]),
      create: jest.fn().mockResolvedValue(studio),
      update: jest.fn().mockResolvedValue(studio),
      remove: jest.fn().mockResolvedValue(studio),
    };
    const controller = new StudiosController(
      service as unknown as StudiosService,
    );

    await expect(controller.findAll()).resolves.toEqual([studio]);
    await expect(controller.create(studio)).resolves.toEqual(studio);
    await expect(controller.update(1, { totalRows: 2 })).resolves.toEqual(
      studio,
    );
    await expect(controller.remove(1)).resolves.toEqual(studio);
  });

  it('service creates studios and generates seats in one transaction', async () => {
    const seatValues: unknown[] = [];
    const tx = {
      insert: jest
        .fn()
        .mockReturnValueOnce(insertReturning({ studioId: 1 }))
        .mockReturnValueOnce({
          values: jest.fn((values: unknown) => {
            seatValues.push(values);
            return Promise.resolve();
          }),
        }),
      select: jest.fn().mockReturnValue(selectWhere([studio])),
    };
    const service = new StudiosService({
      select: jest.fn().mockReturnValue(selectWhere([cinema])),
      transaction: jest.fn((callback: (txArg: typeof tx) => Promise<unknown>) =>
        callback(tx),
      ),
    } as never);

    await expect(service.create(studio)).resolves.toEqual(studio);
    expect(seatValues[0]).toEqual([
      { studioId: 1, rowLetter: 'A', seatNumber: 1 },
      { studioId: 1, rowLetter: 'A', seatNumber: 2 },
      { studioId: 1, rowLetter: 'B', seatNumber: 1 },
      { studioId: 1, rowLetter: 'B', seatNumber: 2 },
    ]);
  });
});
