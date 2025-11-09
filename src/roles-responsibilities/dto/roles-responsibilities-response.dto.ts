import { ApiProperty } from '@nestjs/swagger';
import type { RolesResponsibilities } from '@prisma/client';

export class RolesResponsibilitiesResponseDto {
  @ApiProperty({ example: 'Roles & Responsibilities updated.' })
  message: string;

  @ApiProperty({ description: 'RolesResponsibilities entity payload' })
  data: RolesResponsibilities;
}
