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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import type { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { CreateNewsDto } from './dto/create-news.dto';
import { NewsResponseDto } from './dto/news-response.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

import { StorageService } from '../storage/storage.service';
import { CreateNewsCategoryDto } from './dto/create-news-category.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateNewsCategoryDto } from './dto/update-news-category.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { NewsService } from './news.service';

@ApiTags('News')
@ApiCookieAuth()
@Controller('news')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class NewsController {
  private readonly logger = new Logger(NewsController.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly storageService: StorageService,
  ) {}

  @Post('categories')
  @ApiOperation({ summary: 'Create a new news category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'News category created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateNewsCategoryDto): Promise<any> {
    const category = await this.newsService.createCategory(dto);
    return {
      message: 'Kategori berita berhasil dibuat.',
      data: category,
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all news categories with pagination' })
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
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of news categories retrieved successfully',
  })
  findAllCategories(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.newsService.findAllCategories(query, req);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update news category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'News category updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'News category not found',
  })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsCategoryDto,
  ): Promise<any> {
    const category = await this.newsService.updateCategory(id, dto);
    return {
      message: 'Kategori berita berhasil diperbarui.',
      data: category,
    };
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete news category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'News category deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'News category not found',
  })
  @HttpCode(HttpStatus.OK)
  async removeCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto> {
    await this.newsService.removeCategory(id);
    return { message: 'Kategori berita berhasil dihapus.' };
  }
  @Post('tags')
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tag created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  async createTag(@Body() dto: CreateTagDto): Promise<any> {
    const tag = await this.newsService.createTag(dto);
    return {
      message: 'Tag berhasil dibuat.',
      data: tag,
    };
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags with pagination' })
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
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of tags retrieved successfully',
  })
  findAllTags(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.newsService.findAllTags(query, req);
  }

  @Put('tags/:id')
  @ApiOperation({ summary: 'Update tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tag updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tag not found',
  })
  async updateTag(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTagDto,
  ): Promise<any> {
    const tag = await this.newsService.updateTag(id, dto);
    return {
      message: 'Tag berhasil diperbarui.',
      data: tag,
    };
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: 'Delete tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tag deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tag not found',
  })
  @HttpCode(HttpStatus.OK)
  async removeTag(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto> {
    await this.newsService.removeTag(id);
    return { message: 'Tag berhasil dihapus.' };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new news article' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'News data with optional image file',
    schema: {
      type: 'object',
      required: ['title', 'excerpt', 'description', 'categoryId'],
      properties: {
        title: { type: 'string', example: 'News Title' },
        excerpt: { type: 'string', example: 'Short excerpt' },
        description: { type: 'string', example: 'Full description' },
        status: {
          type: 'string',
          enum: ['draft', 'published', 'archived'],
          default: 'draft',
        },
        categoryId: { type: 'number', example: 1 },
        tagIds: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 2],
          description: 'Array of tag IDs (comma-separated or JSON array)',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional image file (max 5MB, png/jpeg/jpg/webp/gif)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'News article created successfully',
    type: NewsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Req() req: RequestWithBaseUrl,
    @Body() dto: CreateNewsDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|webp)$/,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<NewsResponseDto> {
    // Manually add createdById when using multipart/form-data
    if (req.user?.id) {
      dto.createdById = req.user.id;
    }

    // Upload image if provided
    if (file) {
      this.logger.log(
        `Uploading image during news creation: ${file.originalname}`,
      );
      const imageUrl = await this.storageService.uploadFile(file, 'news/');
      dto.image = imageUrl;
    }

    const news = await this.newsService.create(dto);
    return {
      message: 'Berita berhasil dibuat.',
      data: news,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all news articles with pagination' })
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
    description: 'List of news articles retrieved successfully',
  })
  findAll(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.newsService.findAll(query, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get news article by ID' })
  @ApiParam({ name: 'id', description: 'News article ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'News article retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'News article not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update news article' })
  @ApiParam({ name: 'id', description: 'News article ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'News data with optional image file',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated News Title' },
        excerpt: { type: 'string', example: 'Updated excerpt' },
        description: { type: 'string', example: 'Updated description' },
        status: { type: 'string', enum: ['draft', 'published', 'archived'] },
        categoryId: { type: 'number', example: 1 },
        tagIds: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 2],
          description: 'Array of tag IDs',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional image file (max 5MB, png/jpeg/jpg/webp/gif)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'News article updated successfully',
    type: NewsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'News article not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|webp)$/,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<NewsResponseDto> {
    // Upload new image if provided
    if (file) {
      this.logger.log(
        `Uploading new image for news ID ${id}: ${file.originalname}`,
      );
      const imageUrl = await this.storageService.uploadFile(file, 'news/');
      dto.image = imageUrl;
    }

    const news = await this.newsService.update(id, dto);
    return {
      message: 'Berita berhasil diperbarui.',
      data: news,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete news article' })
  @ApiParam({ name: 'id', description: 'News article ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'News article deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'News article not found',
  })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto> {
    await this.newsService.remove(id);
    return { message: 'Berita berhasil dihapus.' };
  }

  // News Image Upload
  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload image for specific news article' })
  @ApiParam({ name: 'id', description: 'News ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'News image file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        url: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file type or size exceeds limit (5MB)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'News not found',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|webp)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ message: string; url: string }> {
    this.logger.log(`Uploading image for news ID ${id}: ${file.originalname}`);

    // Verify news exists
    await this.newsService.findOne(id);

    try {
      const url = await this.storageService.uploadFile(file, 'news/');
      this.logger.log(`News image uploaded successfully: ${url}`);

      await this.newsService.updateImage(id, url);

      return {
        message: 'Gambar berita berhasil diunggah.',
        url,
      };
    } catch (error) {
      this.logger.error('Failed to upload news image', error);
      throw new BadRequestException('Gagal mengunggah gambar berita.');
    }
  }
}
