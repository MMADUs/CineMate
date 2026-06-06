import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import * as argon2 from 'argon2';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { mutation, selectWhere } from '../test-utils/mock-drizzle';

describe('Auth feature', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const googleUserId = '660e8400-e29b-41d4-a716-446655440000';
  const responseMock = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };
  const response = responseMock as unknown as Response;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('controller delegates auth commands and returns current user payload', async () => {
    const user = { userId, email: 'user@mail.test' };
    const authService = {
      register: jest.fn().mockResolvedValue(user),
      login: jest.fn().mockResolvedValue(user),
      google: jest.fn().mockResolvedValue(user),
      refresh: jest.fn().mockResolvedValue({ user }),
      logout: jest.fn().mockResolvedValue({ message: 'Logged out' }),
    };
    const controller = new AuthController(
      authService as unknown as AuthService,
    );

    await expect(
      controller.register(
        {
          fullName: 'User',
          email: 'user@mail.test',
          phoneNum: '08123456789',
          password: 'Password123!',
        },
        response,
      ),
    ).resolves.toEqual(user);
    await expect(
      controller.login(
        { email: 'user@mail.test', password: 'Password123!' },
        response,
      ),
    ).resolves.toEqual(user);
    await expect(
      controller.google({ idToken: 'google-id-token' }, response),
    ).resolves.toEqual(user);
    await expect(controller.refresh(user, response)).resolves.toEqual({ user });
    await expect(controller.logout(user, response)).resolves.toEqual({
      message: 'Logged out',
    });
    expect(controller.getMe(user)).toEqual(user);
  });

  it('registers users, sets cookies, and hides sensitive fields', async () => {
    const user = {
      userId,
      fullName: 'User',
      email: 'user@mail.test',
      phoneNum: '08123456789',
      authProvider: 'LOCAL',
      googleId: null,
      avatarUrl: null,
      password: 'hashed-password',
      refreshTokenHash: null,
      createdAt: '2026-05-28 00:00:00',
    };
    const db = {
      select: jest
        .fn()
        .mockReturnValueOnce(selectWhere([]))
        .mockReturnValueOnce(selectWhere([user])),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      update: jest.fn().mockReturnValue(mutation()),
    };
    const jwtService = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token'),
    } as unknown as JwtService;
    const configService = { get: jest.fn() } as unknown as ConfigService;
    const service = new AuthService(db, jwtService, configService);

    await expect(
      service.register(
        {
          fullName: 'User',
          email: 'user@mail.test',
          phoneNum: '08123456789',
          password: 'Password123!',
        },
        response,
      ),
    ).resolves.toEqual({
      userId,
      fullName: 'User',
      email: 'user@mail.test',
      phoneNum: '08123456789',
      authProvider: 'LOCAL',
      avatarUrl: null,
      createdAt: '2026-05-28 00:00:00',
    });
    expect(responseMock.cookie).toHaveBeenCalledWith(
      'access_token',
      'access-token',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('rejects duplicate registration and invalid login', async () => {
    const user = {
      userId,
      email: 'user@mail.test',
      password: await argon2.hash('Password123!'),
    };
    const jwtService = { signAsync: jest.fn() } as unknown as JwtService;
    const configService = { get: jest.fn() } as unknown as ConfigService;

    await expect(
      new AuthService(
        { select: jest.fn().mockReturnValue(selectWhere([user])) },
        jwtService,
        configService,
      ).register(
        {
          fullName: 'User',
          email: 'user@mail.test',
          phoneNum: '08123456789',
          password: 'Password123!',
        },
        response,
      ),
    ).rejects.toThrow(ConflictException);

    await expect(
      new AuthService(
        { select: jest.fn().mockReturnValue(selectWhere([user])) },
        jwtService,
        configService,
      ).login({ email: 'user@mail.test', password: 'wrong' }, response),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      new AuthService(
        {
          select: jest.fn().mockReturnValue(
            selectWhere([
              {
                userId: googleUserId,
                email: 'google@mail.test',
                password: null,
              },
            ]),
          ),
        },
        jwtService,
        configService,
      ).login(
        { email: 'google@mail.test', password: 'Password123!' },
        response,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('creates users from verified Google ID tokens', async () => {
    const googleUser = {
      userId: googleUserId,
      fullName: 'Google User',
      email: 'google@mail.test',
      phoneNum: null,
      authProvider: 'GOOGLE',
      googleId: 'google-sub',
      avatarUrl: 'https://lh3.googleusercontent.com/a/example',
      password: null,
      refreshTokenHash: null,
      createdAt: '2026-05-28 00:00:00',
    };
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        sub: 'google-sub',
        aud: 'google-client-id',
        email: 'google@mail.test',
        email_verified: 'true',
        name: 'Google User',
        picture: 'https://lh3.googleusercontent.com/a/example',
      }),
    } as unknown as globalThis.Response);
    const db = {
      select: jest
        .fn()
        .mockReturnValueOnce(selectWhere([]))
        .mockReturnValueOnce(selectWhere([googleUser])),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      update: jest.fn().mockReturnValue(mutation()),
    };
    const jwtService = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token'),
    } as unknown as JwtService;
    const configService = {
      get: jest.fn((key: string) =>
        key === 'GOOGLE_CLIENT_ID' ? 'google-client-id' : undefined,
      ),
    } as unknown as ConfigService;
    const service = new AuthService(db, jwtService, configService);

    await expect(
      service.google({ idToken: 'google-id-token' }, response),
    ).resolves.toEqual({
      userId: googleUserId,
      fullName: 'Google User',
      email: 'google@mail.test',
      phoneNum: null,
      authProvider: 'GOOGLE',
      avatarUrl: 'https://lh3.googleusercontent.com/a/example',
      createdAt: '2026-05-28 00:00:00',
    });
  });

  it('rejects Google ID tokens with the wrong audience', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        sub: 'google-sub',
        aud: 'other-client-id',
        email: 'google@mail.test',
        email_verified: 'true',
      }),
    } as unknown as globalThis.Response);
    const service = new AuthService(
      { select: jest.fn() },
      { signAsync: jest.fn() } as unknown as JwtService,
      {
        get: jest.fn((key: string) =>
          key === 'GOOGLE_CLIENT_ID' ? 'google-client-id' : undefined,
        ),
      } as unknown as ConfigService,
    );

    await expect(
      service.google({ idToken: 'google-id-token' }, response),
    ).rejects.toThrow(UnauthorizedException);
  });
});
