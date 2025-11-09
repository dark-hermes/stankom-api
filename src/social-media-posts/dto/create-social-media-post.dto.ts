import { ApiProperty } from '@nestjs/swagger';
import { SocialMediaType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateSocialMediaPostDto {
  @ApiProperty({ enum: SocialMediaType })
  @IsEnum(SocialMediaType)
  platform: SocialMediaType;

  @ApiProperty({ description: 'Link to the social media post' })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  postLink: string;

  @ApiProperty({ description: 'Image URL for the social media post' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ required: false })
  @IsOptional()
  createdById?: number;
}
