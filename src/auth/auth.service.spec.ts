import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

// Mock bcrypt at module level
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSanitizedUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(result).toEqual(mockSanitizedUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'notfound@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    const registerUserDto: RegisterUserDto = {
      email: 'new@example.com',
      name: 'New User',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockSanitizedUser);

      const result = await service.register(registerUserDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        registerUserDto.email,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.create).toHaveBeenCalledWith(registerUserDto);
      expect(result).toEqual(mockSanitizedUser);
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerUserDto)).rejects.toThrow(
        BadRequestException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return access token for valid user', () => {
      const user = { email: 'test@example.com', id: 1 };
      const mockToken = 'jwt.token.here';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.login(user);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
      expect(result).toEqual({ accessToken: mockToken });
    });
  });
});
