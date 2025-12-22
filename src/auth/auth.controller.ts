import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., email in use)' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // req.user is populated by LocalAuthGuard
    if (!req.user) {
      throw new Error('User not found in request');
    }
    const { accessToken } = this.authService.login(
      req.user as { email: string; id: number },
    );

    // Set the JWT in a secure, HttpOnly, signed cookie (production defaults)
    // Reading env can be used for future logic; enforce secure defaults
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true, // enforce secure for production-ready config
      sameSite: 'none',
      signed: true,
      path: '/',
    });

    return { message: 'Login successful', user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiCookieAuth() // Tell Swagger to use the cookie auth
  @ApiOperation({ summary: 'Get the logged-in user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Log out a user' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  logout(@Res({ passthrough: true }) res: Response) {
    // Clear the signed cookie (production defaults)
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      path: '/',
    });

    return { message: 'Logout successful' };
  }
}
