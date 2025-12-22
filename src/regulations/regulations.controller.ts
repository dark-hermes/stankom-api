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
  UseFilters,
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
import { MulterExceptionFilter } from '../common/filters/multer-exception.filter';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import type { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { StorageService } from '../storage/storage.service';
import { CreateRegulationDto } from './dto/create-regulation.dto';
import { RegulationResponseDto } from './dto/regulation-response.dto';
import { UpdateRegulationDto } from './dto/update-regulation.dto';
import { RegulationsService } from './regulations.service';

@ApiTags('Regulations')
@ApiCookieAuth()
@Controller('regulations')
@UseGuards(JwtAuthGuard)
@UseFilters(MulterExceptionFilter)
@UseInterceptors(AuditInterceptor)
export class RegulationsController {
  private readonly logger = new Logger(RegulationsController.name);

  constructor(
    private readonly regulationsService: RegulationsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new regulation' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Regulation data with optional attachment file',
    schema: {
      type: 'object',
      required: ['title', 'description'],
      properties: {
        title: { type: 'string', example: 'Peraturan Baru' },
        description: { type: 'string', example: 'Isi peraturan' },
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
    description: 'Regulation created successfully',
    type: RegulationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Req() req: RequestWithBaseUrl,
    @Body() dto: CreateRegulationDto,
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
  ): Promise<RegulationResponseDto> {
    if (req.user?.id) {
      dto.createdById = req.user.id;
    }

    if (file) {
      this.logger.log(
        `Uploading attachment during regulation creation: ${file.originalname}`,
      );
      const attachmentUrl = await this.storageService.uploadFile(
        file,
        'regulations/',
      );
      dto.attachment = attachmentUrl;
    }

    const regulation = await this.regulationsService.create(dto);
    return {
      message: 'Regulasi berhasil dibuat.',
      data: regulation,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all regulations with pagination' })
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
    description: 'List of regulations retrieved successfully',
  })
  findAll(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.regulationsService.findAll(query, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get regulation by ID' })
  @ApiParam({ name: 'id', description: 'Regulation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Regulation retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Regulation not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.regulationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update regulation' })
  @ApiParam({ name: 'id', description: 'Regulation ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Regulation data with optional attachment file',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Peraturan Diperbarui' },
        description: {
          type: 'string',
          example: 'Isi peraturan yang diperbarui',
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
    description: 'Regulation updated successfully',
    type: RegulationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Regulation not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Req() req: RequestWithBaseUrl,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegulationDto,
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
  ): Promise<RegulationResponseDto> {
    if (req.user?.id) {
      dto.updatedById = req.user.id;
    }

    const existing = await this.regulationsService.findOne(id);

    if (file) {
      this.logger.log(
        `Uploading new attachment for regulation ID ${id}: ${file.originalname}`,
      );

      if (existing.attachment) {
        this.logger.log(`Deleting old attachment: ${existing.attachment}`);
        await this.storageService.deleteFile(existing.attachment);
      }

      const attachmentUrl = await this.storageService.uploadFile(
        file,
        'regulations/',
      );
      dto.attachment = attachmentUrl;
    }

    const regulation = await this.regulationsService.update(id, dto);
    return {
      message: 'Regulasi berhasil diperbarui.',
      data: regulation,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete regulation' })
  @ApiParam({ name: 'id', description: 'Regulation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Regulation deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Regulation not found',
  })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto> {
    const existing = await this.regulationsService.findOne(id);

    if (existing.attachment) {
      this.logger.log(`Deleting attachment: ${existing.attachment}`);
      await this.storageService.deleteFile(existing.attachment);
    }

    await this.regulationsService.remove(id);
    return { message: 'Regulasi berhasil dihapus.' };
  }

  @Post(':id/upload-attachment')
  @ApiOperation({ summary: 'Upload attachment for specific regulation' })
  @ApiParam({ name: 'id', description: 'Regulation ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Regulation attachment file',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Attachment uploaded successfully',
    schema: {
      type: 'object',
      properties: { message: { type: 'string' }, url: { type: 'string' } },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file type or size exceeds limit (10MB)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Regulation not found',
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
      `Uploading attachment for regulation ID ${id}: ${file.originalname}`,
    );

    const existing = await this.regulationsService.findOne(id);

    try {
      if (existing.attachment) {
        this.logger.log(`Deleting old attachment: ${existing.attachment}`);
        await this.storageService.deleteFile(existing.attachment);
      }

      const url = await this.storageService.uploadFile(file, 'regulations/');
      this.logger.log(`Regulation attachment uploaded successfully: ${url}`);

      await this.regulationsService.updateAttachment(id, url);

      return {
        message: 'Lampiran regulasi berhasil diunggah.',
        url,
      };
    } catch (error) {
      this.logger.error('Failed to upload regulation attachment', error);
      throw new BadRequestException('Gagal mengunggah lampiran regulasi.');
    }
  }
}
