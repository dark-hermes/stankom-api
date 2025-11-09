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
import { CreateFaqDto } from './dto/create-faq.dto';
import { FaqResponseDto } from './dto/faq-response.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqService } from './faq.service';

@ApiTags('FAQ')
@ApiCookieAuth()
@Controller('faq')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'FAQ created successfully',
    type: FaqResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateFaqDto): Promise<FaqResponseDto> {
    const faq = await this.faqService.create(dto);
    return {
      message: 'FAQ berhasil dibuat.',
      data: faq,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all FAQs with pagination' })
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
    description: 'Sort by field:direction (e.g., id:desc)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of FAQs retrieved successfully',
  })
  findAll(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.faqService.findAll(query, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get FAQ by ID' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'FAQ retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'FAQ not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update FAQ' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'FAQ updated successfully',
    type: FaqResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'FAQ not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFaqDto,
  ): Promise<FaqResponseDto> {
    const faq = await this.faqService.update(id, dto);
    return {
      message: 'FAQ berhasil diperbarui.',
      data: faq,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete FAQ' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'FAQ deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'FAQ not found',
  })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto> {
    await this.faqService.remove(id);
    return { message: 'FAQ berhasil dihapus.' };
  }
}
