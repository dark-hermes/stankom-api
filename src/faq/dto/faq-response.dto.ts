import { ApiProperty } from '@nestjs/swagger';
import type { Faq } from '@prisma/client';

export class FaqResponseDto {
  @ApiProperty({ example: 'FAQ berhasil dibuat.' })
  message: string;

  @ApiProperty()
  data: Faq;
}
