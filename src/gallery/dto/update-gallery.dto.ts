import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateGalleryDto {
  @ApiProperty({
    example: 'Updated Event Photo Gallery',
    description: 'Gallery title',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Updated description',
    description: 'Gallery description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
