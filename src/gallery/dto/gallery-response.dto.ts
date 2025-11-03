import { ApiProperty } from '@nestjs/swagger';
import type { Gallery } from '@prisma/client';

export class GalleryResponseDto {
  @ApiProperty({ example: 'Galeri berhasil dibuat.' })
  message: string;

  @ApiProperty()
  data: Gallery;
}
