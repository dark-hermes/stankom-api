import { ApiProperty } from '@nestjs/swagger';
import type { HeroSection } from '@prisma/client';

export class HeroResponseDto {
  @ApiProperty({ example: 'Hero retrieved.' })
  message!: string;

  @ApiProperty({
    example: {
      id: 1,
      heading: 'Heading',
      subHeading: 'Sub heading',
      pathVideo: null,
      banner: 'https://cdn.example/banner.png',
      updatedAt: new Date().toISOString(),
    },
  })
  data!: HeroSection;
}
