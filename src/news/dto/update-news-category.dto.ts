import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateNewsCategoryDto {
  @ApiPropertyOptional({
    example: 'Technology',
    description: 'Category title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  // This field is auto-populated by AuditInterceptor for categories
  // @IsOptional() allows ValidationPipe to accept it when the interceptor adds it
  // Not exposed in Swagger to avoid user confusion
  @IsOptional()
  @IsNumber()
  updatedById?: number;
}
