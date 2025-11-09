import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateFaqDto {
  @ApiProperty({
    example: 'Bagaimana cara mendaftar?',
    required: false,
  })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiProperty({
    example: 'Anda dapat mendaftar melalui website resmi kami.',
    required: false,
  })
  @IsOptional()
  @IsString()
  answer?: string;

  // This field is auto-populated by AuditInterceptor
  @IsOptional()
  @IsInt()
  updatedById?: number;
}
