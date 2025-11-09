import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateHeroDto {
  @ApiPropertyOptional({ example: 'New heading' })
  @IsOptional()
  @IsString()
  heading?: string;

  @ApiPropertyOptional({ example: 'New sub heading' })
  @IsOptional()
  @IsString()
  subHeading?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example/video.mp4' })
  @IsOptional()
  @IsString()
  pathVideo?: string | null;
}
