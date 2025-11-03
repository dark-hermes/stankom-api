import { ApiProperty } from '@nestjs/swagger';

export class NewsResponseDto {
  @ApiProperty({
    description: 'A success message indicating the result of the operation.',
    example: 'Berita berhasil dibuat.',
  })
  message: string;

  @ApiProperty({
    description: 'The news article object',
  })
  data: any;
}
