import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper for sanitizing user object by removing password field.
   */
  private sanitizeUser(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  /**
   * Creates a new user. (Used by auth.service)
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const { password, ...userData } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    return this.sanitizeUser(user);
  }

  /**
   * Finds all users with pagination, filtering, and sorting.
   */
  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<Omit<User, 'password'>>> {
    const searchableFields = ['name', 'email'];
    const where = createPrismaWhereClause<Prisma.UserWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    const paginatedResult = await paginate<User>(
      this.prisma.user,
      { where, orderBy },
      {
        page: query.page,
        limit: query.limit,
        baseUrl,
      },
    );

    return {
      ...paginatedResult,
      data: paginatedResult.data.map((user) => this.sanitizeUser(user)),
    };
  }

  /**
   * Finds a user by their email. (Used by auth.service)
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Finds a user by their ID.
   */
  async findOneById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return this.sanitizeUser(user);
  }

  /**
   * Updates a user.
   */
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const userToUpdate = await this.prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    const { password, email, ...updateData } = updateUserDto;
    const data: Prisma.UserUpdateInput = { ...updateData };

    if (email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`Email "${email}" is already in use.`);
      }
      data.email = email;
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Removes a user.
   */
  async remove(id: number): Promise<void> {
    const userToDelete = await this.prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    await this.prisma.user.delete({ where: { id } });
  }
}
