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
import type { Structure } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { StorageService } from '../storage/storage.service';
import { StructureResponseDto } from './dto/structure-response.dto';
import { UpdateStructureDto } from './dto/update-structure.dto';
import { StructuresService } from './structures.service';

@ApiTags('Structures')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('structures')
export class StructuresController {
  constructor(
    private readonly structuresService: StructuresService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get structure image' })
  @ApiResponse({ status: HttpStatus.OK, type: StructureResponseDto })
  async get(): Promise<StructureResponseDto> {
    const data: Structure = await this.structuresService.get();
    return { message: 'Structure retrieved.', data };
  }

  @Put()
  @ApiOperation({
    summary: 'Update structure (multipart image or JSON image URL)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: HttpStatus.OK, type: StructureResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async update(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UpdateStructureDto,
  ): Promise<StructureResponseDto> {
    let imageUrl = dto.image;
    // If file uploaded, replace existing image (delete old, upload new)
    if (file) {
      const existing = await this.structuresService.get();
      if (existing.image) {
        try {
          await this.storageService.deleteFile(existing.image);
        } catch {
          // Swallow delete errors to allow replacement; could log if logger added
        }
      }
      imageUrl = await this.storageService.uploadFile(file, 'structure/');
    }

    const data: Structure = await this.structuresService.update({
      image: imageUrl,
    });
    return { message: 'Structure updated.', data };
  }
}
