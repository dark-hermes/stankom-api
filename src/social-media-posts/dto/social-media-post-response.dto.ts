import { ApiProperty } from '@nestjs/swagger';
import type { User } from '@prisma/client';

export class SocialMediaPostResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({
    enum: ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TIKTOK', 'YOUTUBE'],
  })
  platform: string;

  @ApiProperty()
  postLink: string;
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdById: number;

  @ApiProperty({ required: false })
  updatedById?: number | null;

  @ApiProperty({ type: Object })
  createdBy?: User;

  @ApiProperty({ type: Object, required: false })
  updatedBy?: User | null;
}
