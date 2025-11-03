import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty({
    example: 'Announcement',
    description: 'Tag name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
