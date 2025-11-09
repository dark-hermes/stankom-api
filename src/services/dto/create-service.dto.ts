import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    example: 'Layanan Perpajakan',
    description: 'Service title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Layanan perpajakan untuk masyarakat umum',
    description: 'Service description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'https://example.com/icon.svg',
    description: 'Icon URL (set by file upload)',
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

  @ApiProperty({
    example: 1,
    description:
      'ID of the user who created the record (auto-populated by AuditInterceptor)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  createdById?: number;
}
