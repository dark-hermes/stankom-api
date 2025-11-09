import { ApiProperty } from '@nestjs/swagger';
import { SocialMediaType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateSocialMediaDto {
  @ApiProperty({
    example: 'INSTAGRAM',
    description: 'Social media type',
    enum: SocialMediaType,
    enumName: 'SocialMediaType',
  })
  @IsEnum(SocialMediaType)
  @IsNotEmpty()
  name: SocialMediaType;

  @ApiProperty({
    example: 'https://instagram.com/stankom',
    description: 'Social media link/URL',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  link: string;
}
