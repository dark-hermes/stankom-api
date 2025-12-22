import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateContactDto {
  @ApiProperty({
    example: 'map_url',
    description: 'Contact key',
    required: false,
  })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'Contact value',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  value?: string;

  // Auto-populated by audit interceptor
  updatedById?: number;
}
