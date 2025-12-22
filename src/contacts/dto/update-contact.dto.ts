import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateContactDto {
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
  @ApiProperty({
    example: 1,
    description: 'ID of user who updated',
    required: false,
  })
  @IsOptional()
  @IsInt()
  updatedById?: number;
}
