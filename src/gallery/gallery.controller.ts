import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { MulterExceptionFilter } from '../common/filters/multer-exception.filter';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import type { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { StorageService } from '../storage/storage.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { GalleryResponseDto } from './dto/gallery-response.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { GalleryService } from './gallery.service';

@ApiTags('Gallery')
@ApiCookieAuth()
@Controller('gallery')
@UseGuards(JwtAuthGuard)
@UseFilters(MulterExceptionFilter)
export class GalleryController {
  private readonly logger = new Logger(GalleryController.name);

  constructor(
    private readonly galleryService: GalleryService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new gallery with images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Gallery data with optional image files (max 4 images)',
    schema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', example: 'Event Photo Gallery' },
        description: {
          type: 'string',
          example: 'Photos from the annual event',
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description:
            'Optional image files (max 4 images, 5MB each, png/jpeg/jpg/webp/gif)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Gallery created successfully',
    type: GalleryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or too many images',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 4))
  async create(
    @Body() dto: CreateGalleryDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB per file
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|webp)$/,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    files?: Express.Multer.File[],
  ): Promise<GalleryResponseDto> {
    const imageUrls: string[] = [];

    // Upload images if provided
    if (files && files.length > 0) {
      if (files.length > 4) {
        throw new BadRequestException('Maksimal 4 gambar per galeri.');
      }

      this.logger.log(
        `Uploading ${files.length} images for new gallery: ${dto.title}`,
      );

      for (const file of files) {
        const url = await this.storageService.uploadFile(file, 'gallery/');
        imageUrls.push(url);
      }
    }

    const gallery = await this.galleryService.create(dto, imageUrls);
    return {
      message: 'Galeri berhasil dibuat.',
      data: gallery,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all galleries with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'filter', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort by field:direction (e.g., createdAt:desc)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of galleries retrieved successfully',
  })
  findAll(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.galleryService.findAll(query, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gallery by ID' })
  @ApiParam({ name: 'id', description: 'Gallery ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gallery retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Gallery not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update gallery' })
  @ApiParam({ name: 'id', description: 'Gallery ID' })
  @ApiBody({ type: UpdateGalleryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gallery updated successfully',
    type: GalleryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Gallery not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGalleryDto,
  ): Promise<GalleryResponseDto> {
    const gallery = await this.galleryService.update(id, dto);
    return {
      message: 'Galeri berhasil diperbarui.',
      data: gallery,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete gallery' })
  @ApiParam({ name: 'id', description: 'Gallery ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gallery deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Gallery not found',
  })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto> {
    // Get the gallery to delete all images from storage
    const gallery = await this.galleryService.findOne(id);

    // Delete all images from storage
    if (gallery.images && gallery.images.length > 0) {
      this.logger.log(
        `Deleting ${gallery.images.length} images from gallery ID ${id}`,
      );
      for (const img of gallery.images) {
        await this.storageService.deleteFile(img.image);
      }
    }

    await this.galleryService.remove(id);
    return { message: 'Galeri berhasil dihapus.' };
  }

  @Post(':id/upload-images')
  @ApiOperation({ summary: 'Upload images to existing gallery' })
  @ApiParam({ name: 'id', description: 'Gallery ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image files to add to gallery',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Image files (respecting max 4 total per gallery)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Images uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid file type, size exceeds limit, or exceeds max 4 images per gallery',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Gallery not found',
  })
  @UseInterceptors(FilesInterceptor('files', 4))
  async uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|webp)$/,
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ): Promise<{ message: string; data: any }> {
    this.logger.log(`Uploading ${files.length} images for gallery ID ${id}`);

    const imageUrls: string[] = [];
    try {
      for (const file of files) {
        const url = await this.storageService.uploadFile(file, 'gallery/');
        imageUrls.push(url);
      }

      const gallery = await this.galleryService.addImages(id, imageUrls);

      return {
        message: 'Gambar berhasil ditambahkan ke galeri.',
        data: gallery,
      };
    } catch (error) {
      // Cleanup uploaded files if adding to gallery fails
      for (const url of imageUrls) {
        await this.storageService.deleteFile(url);
      }
      throw error;
    }
  }

  @Delete(':galleryId/images/:imageId')
  @ApiOperation({ summary: 'Delete an image from gallery' })
  @ApiParam({ name: 'galleryId', description: 'Gallery ID' })
  @ApiParam({ name: 'imageId', description: 'Image ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Gallery or image not found',
  })
  @HttpCode(HttpStatus.OK)
  async deleteImage(
    @Param('galleryId', ParseIntPipe) galleryId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<SuccessResponseDto> {
    const result = await this.galleryService.deleteImage(galleryId, imageId);

    // Delete from storage
    if (result.imageUrl) {
      this.logger.log(`Deleting image from storage: ${result.imageUrl}`);
      await this.storageService.deleteFile(result.imageUrl);
    }

    return { message: 'Gambar berhasil dihapus.' };
  }
}
