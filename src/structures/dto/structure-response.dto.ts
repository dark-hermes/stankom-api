import { ApiProperty } from '@nestjs/swagger';
import type { Structure } from '@prisma/client';

export class StructureResponseDto {
  @ApiProperty({ example: 'Structure retrieved.' })
  message: string;

  @ApiProperty({ description: 'Structure entity payload' })
  data: Structure;
}
