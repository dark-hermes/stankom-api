import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerUserDto: RegisterUserDto = {
      email: 'new@example.com',
      name: 'New User',
      password: 'password123',
    };

    it('should register a new user', async () => {
      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(registerUserDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.register).toHaveBeenCalledWith(registerUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should login user and set cookie', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const mockToken = 'jwt.token.here';
      mockAuthService.login.mockReturnValue({ accessToken: mockToken });
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'nodeEnv') return 'development';
        if (key === 'jwt.expiresIn') return '7d';
        return null;
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = controller.login(mockRequest, mockResponse);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        mockToken,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          signed: true,
        }),
      );
      expect(result).toEqual({
        message: 'Login successful',
        user: mockUser,
      });
    });

    it('should set secure cookie in production', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      mockAuthService.login.mockReturnValue({ accessToken: 'token' });
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'jwt.expiresIn') return '7d';
        return null;
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      controller.login(mockRequest, mockResponse);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'token',
        expect.objectContaining({
          secure: true,
        }),
      );
    });
  });

  describe('getProfile', () => {
    it('should return authenticated user profile', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockRequest = {
        user: mockUser,
      } as any;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear cookie and logout user', () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = controller.logout(mockResponse);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        signed: true,
        path: '/',
      });
      expect(result).toEqual({
        message: 'Logout successful',
      });
    });
  });
});
