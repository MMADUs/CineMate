import { CinemasController } from './cinemas.controller';
import { CinemasService } from './cinemas.service';
import {
  insertReturning,
  mutation,
  selectWhere,
} from '../test-utils/mock-drizzle';

describe('Cinemas feature', () => {
  const cinema = {
    cinemaId: 1,
    cinemaName: 'CineMate',
    location: 'Jakarta',
  };

  it('controller delegates cinema operations', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([cinema]),
      create: jest.fn().mockResolvedValue(cinema),
      update: jest.fn().mockResolvedValue(cinema),
      remove: jest.fn().mockResolvedValue(cinema),
    };
    const controller = new CinemasController(
      service as unknown as CinemasService,
    );

    await expect(controller.findAll()).resolves.toEqual([cinema]);
    await expect(controller.create(cinema)).resolves.toEqual(cinema);
    await expect(
      controller.update(1, { cinemaName: 'CineMate Updated' }),
    ).resolves.toEqual(cinema);
    await expect(controller.remove(1)).resolves.toEqual(cinema);
  });

  it('service creates, updates, and removes cinemas', async () => {
    const db = {
      select: jest
        .fn()
        .mockReturnValueOnce(selectWhere([cinema]))
        .mockReturnValueOnce(selectWhere([cinema]))
        .mockReturnValueOnce(selectWhere([cinema]))
        .mockReturnValueOnce(selectWhere([cinema]))
        .mockReturnValueOnce(selectWhere([cinema])),
      insert: jest.fn().mockReturnValue(insertReturning({ cinemaId: 1 })),
      update: jest.fn().mockReturnValue(mutation()),
      delete: jest.fn().mockReturnValue(mutation()),
    };
    const service = new CinemasService(db as never);

    await expect(
      service.create({
        cinemaName: cinema.cinemaName,
        location: cinema.location,
      }),
    ).resolves.toEqual(cinema);
    await expect(
      service.update(1, { cinemaName: 'CineMate Updated' }),
    ).resolves.toEqual(cinema);
    await expect(service.remove(1)).resolves.toEqual(cinema);
  });
});
