import { ApiProperty } from '@nestjs/swagger';
import type { Regulation } from '@prisma/client';

export class RegulationResponseDto {
  @ApiProperty({ example: 'Regulasi berhasil dibuat.' })
  message: string;

  @ApiProperty()
  data: Regulation;
}
