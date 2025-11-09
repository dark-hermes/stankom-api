import { ApiProperty } from '@nestjs/swagger';
import type { History } from '@prisma/client';

export class HistoryResponseDto {
  @ApiProperty({ example: 'History berhasil dibuat.' })
  message: string;

  // Swagger: let Nest infer the Prisma model shape; provide description only.
  @ApiProperty({ description: 'History entity payload' })
  data: History;
}
