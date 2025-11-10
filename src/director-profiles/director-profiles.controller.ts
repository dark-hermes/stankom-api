import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { DirectorProfilesService } from './director-profiles.service';
import { CreateDirectorProfileDto } from './dto/create-director-profile.dto';
import { DirectorProfileResponseDto } from './dto/director-profile-response.dto';
import { UpdateDirectorProfileDto } from './dto/update-director-profile.dto';

@ApiTags('DirectorProfiles')
@ApiCookieAuth()
@Controller('director-profiles')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class DirectorProfilesController {
  constructor(
    private readonly directorProfilesService: DirectorProfilesService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a director profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Director profile data with optional picture file',
    schema: {
      type: 'object',
      required: ['order', 'beginYear', 'name', 'detail'],
      properties: {
        order: { type: 'number', example: 1 },
        beginYear: { type: 'number', example: 2020 },
        endYear: { type: 'number', example: 2024 },
        name: { type: 'string', example: 'Jane Doe' },
        detail: { type: 'string', example: 'Biography or description' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional picture image (png/jpg/webp, max 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: DirectorProfileResponseDto })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() dto: CreateDirectorProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<DirectorProfileResponseDto> {
    // Helper to coerce possible string numbers from multipart form fields
    const coerceNumber = (val: unknown): number | undefined => {
      if (val === '' || val === undefined || val === null) return undefined;
      if (typeof val === 'string') return Number(val);
      if (typeof val === 'number') return val;
      return undefined;
    };
    const coerced: CreateDirectorProfileDto = {
      ...dto,
      order: coerceNumber(dto.order)!, // required
      beginYear: coerceNumber(dto.beginYear)!, // required
      endYear: coerceNumber(dto.endYear),
    } as CreateDirectorProfileDto;
    let pictureUrl: string | undefined;
    if (file) {
      pictureUrl = await this.storageService.uploadFile(
        file,
        'director-profiles/',
      );
    }
    const created = await this.directorProfilesService.create(
      coerced,
      pictureUrl,
    );
    return { message: 'Profil direktur berhasil dibuat.', data: created };
  }

  @Get()
  @ApiOperation({ summary: 'List director profiles with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'filter', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  async findAll(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.directorProfilesService.findAll(query, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get director profile by ID' })
  @ApiParam({ name: 'id', description: 'DirectorProfile ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.directorProfilesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update director profile' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'DirectorProfile ID' })
  @ApiBody({
    description: 'Update director profile data with optional picture file',
    schema: {
      type: 'object',
      properties: {
        order: { type: 'number', example: 2 },
        beginYear: { type: 'number', example: 2021 },
        endYear: { type: 'number', example: 2025 },
        name: { type: 'string', example: 'John Doe' },
        detail: { type: 'string', example: 'Updated detail' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional new picture image',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, type: DirectorProfileResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDirectorProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<DirectorProfileResponseDto> {
    const coerceNumber = (val: unknown): number | undefined => {
      if (val === '' || val === undefined || val === null) return undefined;
      if (typeof val === 'string') return Number(val);
      if (typeof val === 'number') return val;
      return undefined;
    };
    const coerced: UpdateDirectorProfileDto = {
      ...dto,
      order: dto.order !== undefined ? coerceNumber(dto.order) : undefined,
      beginYear:
        dto.beginYear !== undefined ? coerceNumber(dto.beginYear) : undefined,
      endYear:
        dto.endYear !== undefined ? coerceNumber(dto.endYear) : undefined,
    } as UpdateDirectorProfileDto;
    let pictureUrl: string | undefined;
    if (file) {
      pictureUrl = await this.storageService.uploadFile(
        file,
        'director-profiles/',
      );
    }
    const updated = await this.directorProfilesService.update(
      id,
      coerced,
      pictureUrl,
    );
    return { message: 'Profil direktur berhasil diperbarui.', data: updated };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete director profile' })
  @ApiParam({ name: 'id', description: 'DirectorProfile ID' })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto> {
    await this.directorProfilesService.remove(id);
    return { message: 'Profil direktur berhasil dihapus.' };
  }
}
