import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadImageResponseDto } from './dto/upload-image-response.dto';
import { StorageService, UploadedImageFile } from './storage.service';

@ApiTags('Storage')
@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /* Upload Image Controller
   * @desc: Upload an image to object storage and return a backend asset URL
   * @route: /admin/uploads/images
   * @param: UploadImageDto, multipart image file
   * @returns: Promise<UploadImageResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Post('admin/uploads/images')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
          callback(null, true);
          return;
        }

        callback(
          new BadRequestException(
            'Unsupported image type. Use JPG, PNG, or WEBP',
          ),
          false,
        );
      },
    }),
  )
  @ApiOperation({ summary: 'Upload movie or snack image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['folder', 'file'],
      properties: {
        folder: {
          type: 'string',
          enum: ['movies', 'snacks'],
          example: 'movies',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: UploadImageResponseDto })
  uploadImage(
    @Body() dto: UploadImageDto,
    @UploadedFile() file: UploadedImageFile | undefined,
  ): Promise<UploadImageResponseDto> {
    return this.storageService.uploadImage(dto.folder, file);
  }

  /* Get Image Controller
   * @desc: Serve an uploaded image through the backend
   * @route: /assets/images/:folder/:filename
   * @param: folder, filename
   * @returns: Promise<StreamableFile>
   */
  @Get('assets/images/:folder/:filename')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Read uploaded image asset' })
  @ApiParam({ name: 'folder', enum: ['movies', 'snacks'] })
  @ApiParam({
    name: 'filename',
    example: '4f8f4f86-a5db-47fd-81ea-3f0a92f8e9a1.webp',
  })
  @ApiOkResponse({
    content: {
      'image/jpeg': { schema: { type: 'string', format: 'binary' } },
      'image/png': { schema: { type: 'string', format: 'binary' } },
      'image/webp': { schema: { type: 'string', format: 'binary' } },
    },
  })
  async getImage(
    @Param('folder') folder: 'movies' | 'snacks',
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const image = await this.storageService.getImage(folder, filename);

    res.set({
      'Content-Type': image.contentType,
      'Content-Length': image.contentLength,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });

    return new StreamableFile(image.buffer);
  }
}
