import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { mutation, selectWhere } from '../test-utils/mock-drizzle';

describe('Users feature', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const profile = {
    userId,
    fullName: 'User',
    email: 'user@mail.test',
    phoneNum: '08123456789',
    authProvider: 'LOCAL',
    avatarUrl: null,
    createdAt: '2026-05-28 00:00:00',
  };

  it('controller delegates profile reads and updates', async () => {
    const usersService = {
      getProfile: jest.fn().mockResolvedValue(profile),
      updateProfile: jest.fn().mockResolvedValue(profile),
    };
    const controller = new UsersController(
      usersService as unknown as UsersService,
    );

    await expect(
      controller.getProfile({ userId, email: profile.email }),
    ).resolves.toEqual(profile);
    await expect(
      controller.updateProfile(
        { userId, email: profile.email },
        { fullName: 'User' },
      ),
    ).resolves.toEqual(profile);
  });

  it('updates profiles and strips sensitive fields from responses', async () => {
    const dbUser = {
      ...profile,
      fullName: 'Updated User',
      password: 'hashed',
      googleId: null,
      refreshTokenHash: 'refresh',
    };
    const service = new UsersService({
      select: jest.fn().mockReturnValue(selectWhere([dbUser])),
      update: jest.fn().mockReturnValue(mutation()),
    });

    await expect(
      service.updateProfile(userId, {
        fullName: 'Updated User',
        password: 'Secret123!',
      }),
    ).resolves.toEqual({ ...profile, fullName: 'Updated User' });
  });

  it('throws not found for missing profile', async () => {
    const service = new UsersService({
      select: jest.fn().mockReturnValue(selectWhere([])),
    });

    await expect(service.getProfile(userId)).rejects.toThrow(NotFoundException);
  });
});
