import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates a user by email and password.
   * Called by LocalStrategy.
   */
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Registers a new user.
   * Called by AuthController.
   */
  async register(registerUserDto: RegisterUserDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findOneByEmail(
      registerUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // CreateUserDto from users module includes password hashing
    return this.usersService.create(registerUserDto);
  }

  /**
   * Generates a JWT for a validated user.
   * Called by AuthController.
   */
  login(user: { email: string; id: number }) {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
