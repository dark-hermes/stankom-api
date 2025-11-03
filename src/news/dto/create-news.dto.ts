import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({ example: 'New product release', description: 'News title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Short excerpt', description: 'Short excerpt' })
  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @ApiProperty({ example: 'Full description', description: 'Full content' })
  @IsString()
  @IsNotEmpty()
  description: string;

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

  @ApiProperty({ example: 1, description: 'Category id' })
  @IsInt()
  categoryId: number;

  @ApiProperty({
    example: [1, 2],
    description: 'Array of tag ids',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  tagIds?: number[];

  // This field is auto-populated by AuditInterceptor and should not be sent in request body
  // @IsOptional() allows ValidationPipe to accept it when the interceptor adds it
  @IsOptional()
  @IsNumber()
  createdById?: number;
}
