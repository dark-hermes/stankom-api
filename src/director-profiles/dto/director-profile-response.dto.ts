import { ApiProperty } from '@nestjs/swagger';
import type { DirectorProfile } from '@prisma/client';

export class DirectorProfileResponseDto {
  @ApiProperty({ example: 'Director profile operation successful.' })
  message: string;

  @ApiProperty({ description: 'DirectorProfile entity payload' })
  data: DirectorProfile;
}
