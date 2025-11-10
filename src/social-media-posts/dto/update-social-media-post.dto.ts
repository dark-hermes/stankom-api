import { ApiProperty } from '@nestjs/swagger';
import { SocialMediaType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateSocialMediaPostDto {
  @ApiProperty({ enum: SocialMediaType, required: false })
  @IsEnum(SocialMediaType)
  @IsOptional()
  platform?: SocialMediaType;

  @ApiProperty({
    description: 'Link to the social media post',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsUrl({ require_tld: false })
  postLink?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  updatedById?: number;
}
