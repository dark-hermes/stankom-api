import { ApiProperty } from '@nestjs/swagger';
import type { SocialMedia } from '@prisma/client';

export class SocialMediaResponseDto {
  @ApiProperty({ example: 'Media sosial berhasil dibuat.' })
  message: string;

  @ApiProperty()
  data: SocialMedia;
}
