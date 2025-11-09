import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRolesResponsibilitiesDto {
  @ApiPropertyOptional({ description: 'Roles content (markdown or text)' })
  @IsOptional()
  @IsString()
  roles?: string;

  @ApiPropertyOptional({
    description: 'Responsibilities content (markdown or text)',
  })
  @IsOptional()
  @IsString()
  responsibilities?: string;
}
