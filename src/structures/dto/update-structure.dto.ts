import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStructureDto {
  @ApiPropertyOptional({
    description:
      'Optional image URL when updating via JSON (multipart preferred)',
    example: 'https://example.com/structure.png',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
