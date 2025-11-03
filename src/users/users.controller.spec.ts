import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOneById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      name: 'New User',
      password: 'password123',
    };

    it('should create a new user', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result.message).toBe('User baru berhasil dibuat.');
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    const mockPaginatedUsers = {
      data: [mockUser],
      meta: {
        total: 1,
        lastPage: 1,
        currentPage: 1,
        perPage: 10,
        prev: null,
        next: null,
      },
      links: {
        first: '/users?page=1&limit=10',
        previous: null,
        next: null,
        last: '/users?page=1&limit=10',
      },
    };

    it('should return all users', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockReq = { baseUrl: '/users' } as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockQuery = { page: 1, limit: 10 } as any;
      mockUsersService.findAll.mockResolvedValue(mockPaginatedUsers);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await controller.findAll(mockReq, mockQuery);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findAll).toHaveBeenCalledWith(mockQuery, mockReq);
      expect(result).toEqual(mockPaginatedUsers);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findOneById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
    };

    it('should update a user', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateUserDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result.message).toBe('User berhasil diperbarui.');
      expect(result.user).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockUsersService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove(1);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.remove).toHaveBeenCalledWith(1);
      expect(result.message).toBe('User berhasil dihapus.');
    });
  });
});
