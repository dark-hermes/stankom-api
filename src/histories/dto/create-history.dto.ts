import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateHistoryDto {
  @ApiProperty({ example: 2001 })
  @IsInt()
  @Min(0)
  year: number;

  @ApiProperty({ example: 'Company founded' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'We started operations in ...' })
  @IsString()
  @IsNotEmpty()
  detail: string;
}
