import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'A success message indicating the result of the operation.',
    example: 'User berhasil dibuat.',
  })
  message: string;

  @ApiProperty({
    description: 'The user object without password',
  })
  user: Omit<User, 'password'>;
}
