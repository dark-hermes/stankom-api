import { ApiProperty } from '@nestjs/swagger';

export class StatisticResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  number: number;

  @ApiProperty({ required: false })
  link?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  categoryId: number;
}
