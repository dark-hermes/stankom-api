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
import { CreateSocialMediaPostDto } from './dto/create-social-media-post.dto';
import { SocialMediaPostResponseDto } from './dto/social-media-post-response.dto';
import { UpdateSocialMediaPostDto } from './dto/update-social-media-post.dto';
import { SocialMediaPostsService } from './social-media-posts.service';

@ApiTags('SocialMediaPosts')
@ApiCookieAuth()
@Controller('social-media-posts')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class SocialMediaPostsController {
  private readonly logger = new Logger(SocialMediaPostsController.name);

  constructor(private readonly postsService: SocialMediaPostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new social media post' })
  @ApiBody({ type: CreateSocialMediaPostDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: SocialMediaPostResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: RequestWithBaseUrl,
    @Body() dto: CreateSocialMediaPostDto,
  ): Promise<{ message: string; data: SocialMediaPostResponseDto }> {
    // When sending JSON, AuditInterceptor will fill createdById. For safety, set from req.user if present
    if (req.user?.id) dto.createdById = dto.createdById ?? req.user.id;

    const post = await this.postsService.create(dto);
    return { message: 'Social media post created.', data: post };
  }

  @Get()
  @ApiOperation({ summary: 'Get all social media posts with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'filter', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  findAll(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.postsService.findAll(query, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get social media post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: HttpStatus.OK, type: SocialMediaPostResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update social media post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiBody({ type: UpdateSocialMediaPostDto })
  @ApiResponse({ status: HttpStatus.OK, type: SocialMediaPostResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSocialMediaPostDto,
  ) {
    const post = await this.postsService.update(id, dto);
    return { message: 'Social media post updated.', data: post };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete social media post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: HttpStatus.OK, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.postsService.remove(id);
    return { message: 'Social media post deleted.' };
  }
}
