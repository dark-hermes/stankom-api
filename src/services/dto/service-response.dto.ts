import { ApiProperty } from '@nestjs/swagger';
import type { Service } from '@prisma/client';

export class ServiceResponseDto {
  @ApiProperty({ example: 'Layanan berhasil dibuat.' })
  message: string;

  @ApiProperty()
  data: Service;
}
