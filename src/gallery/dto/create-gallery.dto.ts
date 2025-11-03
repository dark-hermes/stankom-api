import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGalleryDto {
  @ApiProperty({
    example: 'Event Photo Gallery',
    description: 'Gallery title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Photos from the annual event',
    description: 'Gallery description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
