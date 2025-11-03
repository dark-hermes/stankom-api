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
import { StorageService } from '../storage/storage.service';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementResponseDto } from './dto/announcement-response.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@ApiTags('Announcements')
@ApiCookieAuth()
@Controller('announcements')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class AnnouncementsController {
  private readonly logger = new Logger(AnnouncementsController.name);

  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Announcement data with optional attachment file',
    schema: {
      type: 'object',
      required: ['title', 'description'],
      properties: {
        title: { type: 'string', example: 'Pengumuman Penting' },
        description: {
          type: 'string',
          example: 'Isi pengumuman yang penting',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional attachment file (max 10MB, pdf/doc/docx)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Announcement created successfully',
    type: AnnouncementResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Req() req: RequestWithBaseUrl,
    @Body() dto: CreateAnnouncementDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(pdf|doc|docx)$/,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<AnnouncementResponseDto> {
    // Manually add createdById when using multipart/form-data
    if (req.user?.id) {
      dto.createdById = req.user.id;
    }

    // Upload attachment if provided
    if (file) {
      this.logger.log(
        `Uploading attachment during announcement creation: ${file.originalname}`,
      );
      const attachmentUrl = await this.storageService.uploadFile(
        file,
        'announcements/',
      );
      dto.attachment = attachmentUrl;
    }

    const announcement = await this.announcementsService.create(dto);
    return {
      message: 'Pengumuman berhasil dibuat.',
      data: announcement,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all announcements with pagination' })
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
    description: 'List of announcements retrieved successfully',
  })
  findAll(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.announcementsService.findAll(query, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcement by ID' })
  @ApiParam({ name: 'id', description: 'Announcement ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Announcement retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Announcement not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update announcement' })
  @ApiParam({ name: 'id', description: 'Announcement ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Announcement data with optional attachment file',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Pengumuman Penting Updated' },
        description: {
          type: 'string',
          example: 'Isi pengumuman yang diperbarui',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional attachment file (max 10MB, pdf/doc/docx)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Announcement updated successfully',
    type: AnnouncementResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Announcement not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Req() req: RequestWithBaseUrl,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnnouncementDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(pdf|doc|docx)$/,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<AnnouncementResponseDto> {
    // Manually add updatedById when using multipart/form-data
    if (req.user?.id) {
      dto.updatedById = req.user.id;
    }

    // Get the existing announcement to delete the old attachment if a new one is uploaded
    const existing = await this.announcementsService.findOne(id);

    // Upload new attachment if provided
    if (file) {
      this.logger.log(
        `Uploading new attachment for announcement ID ${id}: ${file.originalname}`,
      );

      // Delete old attachment if exists
      if (existing.attachment) {
        this.logger.log(`Deleting old attachment: ${existing.attachment}`);
        await this.storageService.deleteFile(existing.attachment);
      }

      const attachmentUrl = await this.storageService.uploadFile(
        file,
        'announcements/',
      );
      dto.attachment = attachmentUrl;
    }

    const announcement = await this.announcementsService.update(id, dto);
    return {
      message: 'Pengumuman berhasil diperbarui.',
      data: announcement,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete announcement' })
  @ApiParam({ name: 'id', description: 'Announcement ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Announcement deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Announcement not found',
  })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto> {
    // Get the announcement to delete the attachment if exists
    const existing = await this.announcementsService.findOne(id);

    // Delete attachment if exists
    if (existing.attachment) {
      this.logger.log(`Deleting attachment: ${existing.attachment}`);
      await this.storageService.deleteFile(existing.attachment);
    }

    await this.announcementsService.remove(id);
    return { message: 'Pengumuman berhasil dihapus.' };
  }

  @Post(':id/upload-attachment')
  @ApiOperation({ summary: 'Upload attachment for specific announcement' })
  @ApiParam({ name: 'id', description: 'Announcement ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Announcement attachment file',
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
    description: 'Attachment uploaded successfully',
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
    description: 'Invalid file type or size exceeds limit (10MB)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Announcement not found',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(pdf|doc|docx)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ message: string; url: string }> {
    this.logger.log(
      `Uploading attachment for announcement ID ${id}: ${file.originalname}`,
    );

    // Verify announcement exists and get old attachment
    const existing = await this.announcementsService.findOne(id);

    try {
      // Delete old attachment if exists
      if (existing.attachment) {
        this.logger.log(`Deleting old attachment: ${existing.attachment}`);
        await this.storageService.deleteFile(existing.attachment);
      }

      const url = await this.storageService.uploadFile(file, 'announcements/');
      this.logger.log(`Announcement attachment uploaded successfully: ${url}`);

      await this.announcementsService.updateAttachment(id, url);

      return {
        message: 'Lampiran pengumuman berhasil diunggah.',
        url,
      };
    } catch (error) {
      this.logger.error('Failed to upload announcement attachment', error);
      throw new BadRequestException('Gagal mengunggah lampiran pengumuman.');
    }
  }
}
