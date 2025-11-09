import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({
    example: 'Bagaimana cara mendaftar?',
    description: 'FAQ question',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: 'Anda dapat mendaftar melalui website resmi kami.',
    description: 'FAQ answer',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
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
