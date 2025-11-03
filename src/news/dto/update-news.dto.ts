import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateNewsDto {
  @ApiProperty({
    example: 'New product release',
    description: 'News title',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Short excerpt',
    description: 'Short excerpt',
    required: false,
  })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({
    example: 'Full description',
    description: 'Full content',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: null, description: 'Image URL', required: false })
  @IsOptional()
  @IsString()
  image?: string | null;

  @ApiProperty({
    example: 'draft',
    enum: ['draft', 'published', 'archived'],
    required: false,
  })
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @ApiProperty({ example: 1, description: 'Category id', required: false })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiProperty({
    example: [1, 2],
    description: 'Array of tag ids',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];

  // This field is auto-populated by AuditInterceptor
  @IsOptional()
  @IsInt()
  updatedById?: number;
}
