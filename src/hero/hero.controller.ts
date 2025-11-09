import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { HeroSection } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { HeroResponseDto } from './dto/hero-response.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { HeroService } from './hero.service';

@ApiTags('Hero')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Get()
  @ApiOperation({ summary: 'Get hero section content' })
  @ApiResponse({ status: HttpStatus.OK, type: HeroResponseDto })
  async get(): Promise<HeroResponseDto> {
    const data: HeroSection = await this.heroService.get();
    return { message: 'Hero retrieved.', data };
  }

  @Put()
  @ApiOperation({ summary: 'Update hero section (JSON fields)' })
  @ApiResponse({ status: HttpStatus.OK, type: HeroResponseDto })
  async update(@Body() dto: UpdateHeroDto): Promise<HeroResponseDto> {
    const data: HeroSection = await this.heroService.update(dto);
    return { message: 'Hero updated.', data };
  }

  @Put('banner')
  @ApiOperation({ summary: 'Replace hero banner image (multipart upload)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: HttpStatus.OK, type: HeroResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadBanner(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<HeroResponseDto> {
    const data: HeroSection = await this.heroService.replaceBanner(file);
    return { message: 'Hero banner replaced.', data };
  }
}
