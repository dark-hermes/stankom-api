import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateNewsCategoryDto {
  @ApiProperty({ example: 'Technology', description: 'Category title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  // This field is auto-populated by AuditInterceptor and should not be sent in request body
  // @IsOptional() allows ValidationPipe to accept it when the interceptor adds it
  @IsOptional()
  @IsNumber()
  createdById?: number;
}
