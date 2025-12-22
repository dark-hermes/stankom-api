import { ApiProperty } from '@nestjs/swagger';
import type { Contact } from '@prisma/client';

export class ContactResponseDto {
  @ApiProperty({ example: 'Contact retrieved' })
  message: string;

  @ApiProperty()
  data: Contact;
}
