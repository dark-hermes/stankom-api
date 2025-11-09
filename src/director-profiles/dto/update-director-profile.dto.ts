import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDirectorProfileDto {
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: 2021 })
  @IsOptional()
  @IsInt()
  beginYear?: number;

  @ApiPropertyOptional({
    example: 2025,
    description: 'Defaults to current year if omitted/null',
  })
  @IsOptional()
  @IsInt()
  endYear?: number | null;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated detail' })
  @IsOptional()
  @IsString()
  detail?: string;
}
