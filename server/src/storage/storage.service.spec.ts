import { BadRequestException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import type { Response } from 'express';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

describe('Storage feature', () => {
  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        OBJECT_STORAGE_BUCKET: 'cinemate-images',
        APP_BASE_URL: 'http://localhost:3000',
        OBJECT_STORAGE_ENDPOINT: 'http://localhost:9000',
        OBJECT_STORAGE_REGION: 'us-east-1',
        OBJECT_STORAGE_ACCESS_KEY: 'access',
        OBJECT_STORAGE_SECRET_KEY: 'secret',
      };
      return values[key];
    }),
  } as unknown as ConfigService;

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('controller delegates upload and streams stored images', async () => {
    const response = {
      set: jest.fn(),
    } as unknown as Response;
    const service = {
      uploadImage: jest.fn().mockResolvedValue({
        key: 'movies/image.webp',
        url: 'http://localhost:3000/api/assets/images/movies/image.webp',
        contentType: 'image/webp',
        size: 10,
      }),
      deleteImage: jest.fn().mockResolvedValue({
        key: 'movies/image.webp',
        deleted: true,
      }),
      getImage: jest.fn().mockResolvedValue({
        buffer: Buffer.from('image'),
        contentType: 'image/webp',
        contentLength: 5,
      }),
    };
    const controller = new StorageController(
      service as unknown as StorageService,
    );

    await expect(
      controller.uploadImage({ folder: 'movies' }, undefined),
    ).resolves.toMatchObject({
      key: 'movies/image.webp',
    });
    await expect(
      controller.getImage('movies', 'image.webp', response),
    ).resolves.toBeDefined();
    await expect(
      controller.deleteImage('movies', 'image.webp'),
    ).resolves.toEqual({
      key: 'movies/image.webp',
      deleted: true,
    });
  });

  it('rejects unsupported image MIME types before uploading', async () => {
    const service = new StorageService(configService);

    await expect(
      service.uploadImage('movies', {
        buffer: Buffer.from('file'),
        mimetype: 'text/plain',
        originalname: 'file.txt',
        size: 4,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('uploads supported images and returns backend asset URL', async () => {
    const send = jest
      .spyOn(S3Client.prototype, 'send')
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});
    const service = new StorageService(configService);

    const result = await service.uploadImage('movies', {
      buffer: Buffer.from('image'),
      mimetype: 'image/webp',
      originalname: 'poster.webp',
      size: 5,
    });

    expect(result.key).toMatch(/^movies\/.+\.webp$/);
    expect(result.url).toMatch(
      /^http:\/\/localhost:3000\/api\/assets\/images\/movies\/.+\.webp$/,
    );
    expect(result.contentType).toBe('image/webp');
    expect(result.size).toBe(5);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('deletes existing stored images', async () => {
    const send = jest
      .spyOn(S3Client.prototype, 'send')
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});
    const service = new StorageService(configService);

    await expect(
      service.deleteImage('movies', '135c66f9-c917-43b9-a869-a5f5dc08efcc.jpg'),
    ).resolves.toEqual({
      key: 'movies/135c66f9-c917-43b9-a869-a5f5dc08efcc.jpg',
      deleted: true,
    });
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('builds public image URLs from storage keys', () => {
    const service = new StorageService(configService);

    expect(
      service.buildImageUrl('movies/135c66f9-c917-43b9-a869-a5f5dc08efcc.jpg'),
    ).toBe(
      'http://localhost:3000/api/assets/images/movies/135c66f9-c917-43b9-a869-a5f5dc08efcc.jpg',
    );
    expect(service.buildImageUrl('bad-key')).toBeNull();
  });
});
