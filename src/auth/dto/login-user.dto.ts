import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'admin@test.dev' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123qweasd' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
