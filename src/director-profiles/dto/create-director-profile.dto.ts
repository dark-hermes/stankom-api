import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateDirectorProfileDto {
  @ApiProperty({ example: 1, description: 'Display order (lower shows first)' })
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({ example: 2020 })
  @IsInt()
  beginYear: number;

  @ApiPropertyOptional({
    example: 2024,
    description: 'End year (defaults to current year if omitted/null)',
  })
  @IsOptional()
  @IsInt()
  endYear?: number | null;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Detailed biography or description' })
  @IsString()
  @IsNotEmpty()
  detail: string;
}
