import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateServiceDto {
  @ApiProperty({
    example: 'Layanan Perpajakan',
    description: 'Service title',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Layanan perpajakan untuk masyarakat umum',
    description: 'Service description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://example.com/icon.svg',
    description: 'Icon URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    example: 'https://example.com/service',
    description: 'Service link URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  link?: string | null;

  // This field is auto-populated by AuditInterceptor
  @IsOptional()
  @IsNumber()
  updatedById?: number;
}
