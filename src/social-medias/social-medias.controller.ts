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
import type { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { SocialMediaResponseDto } from './dto/social-media-response.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';
import { SocialMediasService } from './social-medias.service';

@ApiTags('Social Medias')
@ApiCookieAuth()
@Controller('social-medias')
@UseGuards(JwtAuthGuard)
export class SocialMediasController {
  constructor(private readonly socialMediasService: SocialMediasService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new social media' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Social media created successfully',
    type: SocialMediaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Social media type already exists',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSocialMediaDto,
  ): Promise<SocialMediaResponseDto> {
    const socialMedia = await this.socialMediasService.create(dto);
    return {
      message: 'Media sosial berhasil dibuat.',
      data: socialMedia,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all social medias with pagination' })
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
    description: 'List of social medias retrieved successfully',
  })
  findAll(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.socialMediasService.findAll(query, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get social media by ID' })
  @ApiParam({ name: 'id', description: 'Social media ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Social media retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Social media not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.socialMediasService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update social media' })
  @ApiParam({ name: 'id', description: 'Social media ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Social media updated successfully',
    type: SocialMediaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Social media not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Social media type already exists',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSocialMediaDto,
  ): Promise<SocialMediaResponseDto> {
    const socialMedia = await this.socialMediasService.update(id, dto);
    return {
      message: 'Media sosial berhasil diperbarui.',
      data: socialMedia,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete social media' })
  @ApiParam({ name: 'id', description: 'Social media ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Social media deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Social media not found',
  })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto> {
    await this.socialMediasService.remove(id);
    return { message: 'Media sosial berhasil dihapus.' };
  }
}
