import { SnacksController } from './snacks.controller';
import { SnacksService } from './snacks.service';
import { mutation, selectWhere } from '../test-utils/mock-drizzle';

describe('Snacks feature', () => {
  const snack = {
    snackId: 1,
    snackName: 'Popcorn',
    category: 'Snack',
    price: '45000',
    stock: 100,
    imageKey: 'snacks/135c66f9-c917-43b9-a869-a5f5dc08efcc.jpg',
    imageUrl:
      'http://localhost:3000/api/assets/images/snacks/135c66f9-c917-43b9-a869-a5f5dc08efcc.jpg',
  };

  it('controller delegates snack operations', async () => {
    const snacksService = {
      findAll: jest.fn().mockResolvedValue([snack]),
      create: jest.fn().mockResolvedValue(snack),
      update: jest.fn().mockResolvedValue(snack),
      remove: jest.fn().mockResolvedValue(snack),
    };
    const controller = new SnacksController(
      snacksService as unknown as SnacksService,
    );

    await expect(controller.findAll({ category: 'Snack' })).resolves.toEqual([
      snack,
    ]);
    await expect(controller.adminFindAll()).resolves.toEqual([snack]);
    await expect(
      controller.create({
        snackName: 'Popcorn',
        category: 'Snack',
        price: 45000,
        stock: 100,
      }),
    ).resolves.toEqual(snack);
    await expect(
      controller.update(1, { price: 45000, stock: 120 }),
    ).resolves.toEqual(snack);
    await expect(controller.remove(1)).resolves.toEqual(snack);
  });

  it('service filters snacks and normalizes prices before saving', async () => {
    const values = jest.fn().mockReturnValue({
      $returningId: jest.fn().mockResolvedValue([{ snackId: 1 }]),
    });
    const set = jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    });
    const storageService = {
      buildImageUrl: jest.fn().mockReturnValue(snack.imageUrl),
    };
    const service = new SnacksService(
      {
        select: jest.fn().mockReturnValue(selectWhere([snack])),
        insert: jest.fn().mockReturnValue({ values }),
        update: jest.fn().mockReturnValue({ set }),
        delete: jest.fn().mockReturnValue(mutation()),
      } as never,
      storageService as never,
    );

    await expect(service.findAll({ category: 'Snack' })).resolves.toEqual([
      snack,
    ]);
    await expect(
      service.create({
        snackName: 'Popcorn',
        category: 'Snack',
        price: 45000,
        stock: 100,
        imageKey: snack.imageKey,
      }),
    ).resolves.toEqual(snack);
    await service.update(1, { price: 50000, stock: 120 });
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        price: '45000',
        stock: 100,
        imageKey: snack.imageKey,
      }),
    );
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({ price: '50000', stock: 120 }),
    );
  });
});
