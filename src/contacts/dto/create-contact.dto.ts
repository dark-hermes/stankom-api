import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'map_url', description: 'Contact key' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'https://example.com', description: 'Contact value' })
  @IsString()
  @IsNotEmpty()
  value: string;

  // Auto-populated by audit interceptor
  createdById?: number;
}
