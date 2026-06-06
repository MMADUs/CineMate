import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { DeleteImageResponseDto } from './dto/delete-image-response.dto';
import { randomUUID } from 'node:crypto';
import { UploadImageResponseDto } from './dto/upload-image-response.dto';

export interface UploadedImageFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export interface StoredImageObject {
  buffer: Buffer;
  contentType: string;
  contentLength: number;
}

type ImageFolder = 'movies' | 'snacks';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly appBaseUrl: string;
  private bucketReady?: Promise<void>;

  constructor(private readonly configService: ConfigService) {
    this.bucket =
      this.configService.get<string>('OBJECT_STORAGE_BUCKET') ??
      'cinemate-images';
    this.appBaseUrl = (
      this.configService.get<string>('APP_BASE_URL') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');

    this.s3 = new S3Client({
      endpoint:
        this.configService.get<string>('OBJECT_STORAGE_ENDPOINT') ??
        'http://localhost:9000',
      region:
        this.configService.get<string>('OBJECT_STORAGE_REGION') ?? 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId:
          this.configService.get<string>('OBJECT_STORAGE_ACCESS_KEY') ??
          'rustfsadmin',
        secretAccessKey:
          this.configService.get<string>('OBJECT_STORAGE_SECRET_KEY') ??
          'rustfsadmin',
      },
    });
  }

  /* Upload Image Service
   * @desc: Validate and upload an image to S3-compatible object storage
   * @param: folder, uploaded file
   * @returns: Promise<UploadImageResponseDto>
   */
  async uploadImage(
    folder: ImageFolder,
    file: UploadedImageFile | undefined,
  ): Promise<UploadImageResponseDto> {
    if (!file) throw new BadRequestException('Image file is required');

    const extension = this.getExtension(file.mimetype);
    const fileName = `${randomUUID()}.${extension}`;
    const key = `${folder}/${fileName}`;

    await this.ensureBucket();
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentLength: file.size,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
        },
      }),
    );

    return {
      key,
      url: this.buildImageUrl(key) ?? '',
      contentType: file.mimetype,
      size: file.size,
    };
  }

  /* Build Image URL Service
   * @desc: Generate a backend asset URL from a stored object key
   * @param: object key
   * @returns: string | null
   */
  buildImageUrl(key: string | null | undefined): string | null {
    if (!key) return null;

    const [folder, filename, extra] = key.split('/');
    if (extra || !this.isValidImagePath(folder, filename)) return null;

    return `${this.appBaseUrl}/api/assets/images/${folder}/${filename}`;
  }

  /* Get Image Service
   * @desc: Download an image object from S3-compatible object storage
   * @param: folder, filename
   * @returns: Promise<StoredImageObject>
   */
  async getImage(
    folder: ImageFolder,
    filename: string,
  ): Promise<StoredImageObject> {
    this.validateImagePath(folder, filename);

    try {
      const object = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: `${folder}/${filename}`,
        }),
      );

      const bytes = await object.Body?.transformToByteArray();
      if (!bytes) throw new NotFoundException('Image not found');

      return {
        buffer: Buffer.from(bytes),
        contentType: object.ContentType ?? 'application/octet-stream',
        contentLength: Number(object.ContentLength ?? bytes.length),
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (this.isMissingObjectError(error)) {
        throw new NotFoundException('Image not found');
      }

      throw error;
    }
  }

  /* Delete Image Service
   * @desc: Delete an uploaded image object from S3-compatible object storage
   * @param: folder, filename
   * @returns: Promise<DeleteImageResponseDto>
   */
  async deleteImage(
    folder: ImageFolder,
    filename: string,
  ): Promise<DeleteImageResponseDto> {
    this.validateImagePath(folder, filename);

    const key = `${folder}/${filename}`;

    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      if (this.isMissingObjectError(error)) {
        throw new NotFoundException('Image not found');
      }

      throw error;
    }

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    return { key, deleted: true };
  }

  /* Ensure Bucket Helper
   * @desc: Lazily create the configured bucket if it does not exist
   * @param: none
   * @returns: Promise<void>
   */
  private async ensureBucket(): Promise<void> {
    this.bucketReady ??= this.createBucketIfMissing();

    return this.bucketReady;
  }

  /* Create Bucket Helper
   * @desc: Check object storage bucket and create it when missing
   * @param: none
   * @returns: Promise<void>
   */
  private async createBucketIfMissing(): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  /* Get Extension Helper
   * @desc: Convert a supported MIME type to a file extension
   * @param: MIME type
   * @returns: string
   */
  private getExtension(mimetype: string): string {
    switch (mimetype) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        throw new BadRequestException(
          'Unsupported image type. Use JPG, PNG, or WEBP',
        );
    }
  }

  /* Validate Image Path Helper
   * @desc: Validate folder and filename path params before object lookup
   * @param: folder, filename
   * @returns: void
   */
  private validateImagePath(folder: string, filename: string): void {
    if (!this.isValidImagePath(folder, filename)) {
      throw new NotFoundException('Image not found');
    }
  }

  /* Is Valid Image Path Helper
   * @desc: Validate object storage folder and image filename format
   * @param: folder, filename
   * @returns: boolean
   */
  private isValidImagePath(folder: string, filename: string): boolean {
    return (
      ['movies', 'snacks'].includes(folder) &&
      /^[a-f0-9-]+\.(jpg|png|webp)$/.test(filename)
    );
  }

  /* Is Missing Object Error Helper
   * @desc: Detect S3-compatible 404 errors for missing image objects
   * @param: error
   * @returns: boolean
   */
  private isMissingObjectError(error: unknown): boolean {
    const s3Error = error as {
      name?: string;
      $metadata?: { httpStatusCode?: number };
    };

    return (
      s3Error.name === 'NoSuchKey' ||
      s3Error.name === 'NotFound' ||
      s3Error.$metadata?.httpStatusCode === 404
    );
  }
}
