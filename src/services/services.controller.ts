import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@ApiTags('Services')
@ApiCookieAuth()
@Controller('services')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class ServicesController {
  private readonly logger = new Logger(ServicesController.name);

  constructor(
    private readonly servicesService: ServicesService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiBody({
    description: 'Service data (icon is a service-provided string value)',
    schema: {
      type: 'object',
      required: ['title', 'description'],
      properties: {
        title: { type: 'string', example: 'Layanan Perpajakan' },
        description: {
          type: 'string',
          example: 'Layanan perpajakan untuk masyarakat umum',
        },
        link: {
          type: 'string',
          example: 'https://example.com/service',
        },
        icon: {
          type: 'string',
          description: 'Icon value from icon service (string)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service created successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: RequestWithBaseUrl,
    @Body() dto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    // Expect dto.icon to be a string value provided by an icon service
    const service = await this.servicesService.create(dto);
    return {
      message: 'Layanan berhasil dibuat.',
      data: service,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all services with pagination' })
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
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of services retrieved successfully',
  })
  findAll(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.servicesService.findAll(query, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Service data to update (all fields optional)',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Layanan Perpajakan' },
        description: {
          type: 'string',
          example: 'Layanan perpajakan untuk masyarakat umum',
        },
        link: {
          type: 'string',
          example: 'https://example.com/service',
        },
        icon: {
          type: 'string',
          format: 'binary',
          description: 'Optional new icon file (max 5MB, jpg/jpeg/png/svg)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service updated successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    // Expect dto.icon to be a string value when updating icon via icon service
    const service = await this.servicesService.update(id, dto);
    return {
      message: 'Layanan berhasil diperbarui.',
      data: service,
    };
  }

  @Put(':id/icon')
  @ApiOperation({ summary: 'Update service icon' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Service icon file',
    schema: {
      type: 'object',
      required: ['icon'],
      properties: {
        icon: {
          type: 'string',
          format: 'binary',
          description: 'Icon file (max 5MB, jpg/jpeg/png/svg)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service icon updated successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async updateIcon(
    @Param('id', ParseIntPipe) id: number,
    @Body('icon') icon: string,
  ): Promise<ServiceResponseDto> {
    // Accept icon as a string value (from icon service) in the request body
    const service = await this.servicesService.updateIcon(id, icon);
    return {
      message: 'Ikon layanan berhasil diperbarui.',
      data: service,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto> {
    await this.servicesService.remove(id);
    return { message: 'Layanan berhasil dihapus.' };
  }
}
