import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDirectorProfileDto {
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional({ example: 2021 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  beginYear?: number;

  @ApiPropertyOptional({
    example: 2025,
    description: 'Defaults to current year if omitted/null',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
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
