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
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import type { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { CreateStatisticCategoryDto } from './dto/create-statistic-category.dto';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { StatisticResponseDto } from './dto/statistic-response.dto';
import { UpdateStatisticCategoryDto } from './dto/update-statistic-category.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { StatisticsService } from './statistics.service';

@ApiTags('Statistics')
@ApiCookieAuth()
@Controller('statistics')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class StatisticsController {
  constructor(private readonly statsService: StatisticsService) {}

  // Category endpoints
  @Post('categories')
  @ApiOperation({ summary: 'Create statistic category' })
  @ApiBody({ type: CreateStatisticCategoryDto })
  @ApiResponse({ status: HttpStatus.CREATED })
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateStatisticCategoryDto) {
    const category = await this.statsService.createCategory(dto);
    return { message: 'Kategori statistik berhasil dibuat.', data: category };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get statistic categories' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAllCategories(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    return this.statsService.findAllCategories(query, req);
  }

  @Put('categories/:id')
  @ApiParam({ name: 'id' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatisticCategoryDto,
  ) {
    const category = await this.statsService.updateCategory(id, dto);
    return {
      message: 'Kategori statistik berhasil diperbarui.',
      data: category,
    };
  }

  @Delete('categories/:id')
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.OK)
  async removeCategory(@Param('id', ParseIntPipe) id: number) {
    await this.statsService.removeCategory(id);
    return { message: 'Kategori statistik berhasil dihapus.' };
  }

  // Statistic endpoints
  @Post()
  @ApiBody({ type: CreateStatisticDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: StatisticResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateStatisticDto) {
    const stat = await this.statsService.create(dto);
    return { message: 'Statistik berhasil dibuat.', data: stat };
  }

  @Get()
  findAll(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    return this.statsService.findAll(query, req);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.statsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatisticDto,
  ) {
    const stat = await this.statsService.update(id, dto);
    return { message: 'Statistik berhasil diperbarui.', data: stat };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.statsService.remove(id);
    return { message: 'Statistik berhasil dihapus.' };
  }
}
