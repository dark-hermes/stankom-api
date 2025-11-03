import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({
    example: 'Pengumuman Penting',
    description: 'Announcement title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Isi pengumuman yang penting',
    description: 'Announcement description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: null,
    description: 'Attachment URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  attachment?: string | null;

  // This field is auto-populated by AuditInterceptor and should not be sent in request body
  @IsOptional()
  @IsNumber()
  createdById?: number;
}
