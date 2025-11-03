import { ApiProperty } from '@nestjs/swagger';
import type { Announcement } from '@prisma/client';

export class AnnouncementResponseDto {
  @ApiProperty({ example: 'Pengumuman berhasil dibuat.' })
  message: string;

  @ApiProperty()
  data: Announcement;
}
