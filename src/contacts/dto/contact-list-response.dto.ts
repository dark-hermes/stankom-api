import { ApiProperty } from '@nestjs/swagger';
import type { Contact } from '@prisma/client';

export class ContactListResponseDto {
  @ApiProperty({ example: 'Contacts updated' })
  message: string;

  @ApiProperty({ isArray: true, type: Object })
  data: Contact[];
}
