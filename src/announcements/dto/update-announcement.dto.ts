import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAnnouncementDto {
  @ApiProperty({
    example: 'Pengumuman Penting',
    description: 'Announcement title',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Isi pengumuman yang penting',
    description: 'Announcement description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: null,
    description: 'Attachment URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  attachment?: string | null;

  // This field is auto-populated by AuditInterceptor
  @IsOptional()
  @IsNumber()
  updatedById?: number;
}
