import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateContactsByKeyDto {
  @ApiPropertyOptional({
    example: 'https://maps.google.com/?q=example',
    description: 'Map URL value for the contact',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  map_url?: string;

  @ApiPropertyOptional({
    example: 'Jl. Contoh No. 123, Jakarta',
    description: 'Address value for the contact',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @ApiPropertyOptional({
    example: '+62 812 3456 7890',
    description: 'Contact number or information',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  contact?: string;

  // Auto-populated by audit interceptor
  @ApiPropertyOptional({
    example: 1,
    description: 'ID of user who updated',
  })
  @IsOptional()
  @IsInt()
  updatedById?: number;
}
