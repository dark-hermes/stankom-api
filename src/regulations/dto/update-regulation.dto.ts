import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRegulationDto {
  @ApiProperty({
    example: 'Peraturan Diperbarui',
    description: 'Regulation title',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Isi peraturan yang diperbarui',
    description: 'Regulation description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: null,
    description: 'Attachment URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  attachment?: string | null;

  // This field is auto-populated by AuditInterceptor
  @IsOptional()
  @IsNumber()
  updatedById?: number;
}
