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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
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
import { CreateHistoryDto } from './dto/create-history.dto';
import { HistoryResponseDto } from './dto/history-response.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { HistoriesService } from './histories.service';

@ApiTags('Histories')
@ApiCookieAuth()
@Controller('histories')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class HistoriesController {
  constructor(private readonly historiesService: HistoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new History' })
  @ApiResponse({ status: HttpStatus.CREATED, type: HistoryResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateHistoryDto): Promise<HistoryResponseDto> {
    const data = await this.historiesService.create(dto);
    return { message: 'History berhasil dibuat.', data };
  }

  @Get()
  @ApiOperation({ summary: 'Get all Histories with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'filter', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  findAll(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.historiesService.findAll(query, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get History by ID' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historiesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a History' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: HistoryResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHistoryDto,
  ): Promise<HistoryResponseDto> {
    const data = await this.historiesService.update(id, dto);
    return { message: 'History berhasil diperbarui.', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a History' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: SuccessResponseDto })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto> {
    await this.historiesService.remove(id);
    return { message: 'History berhasil dihapus.' };
  }
}
