import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, SocialMedia } from '@prisma/client';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';

@Injectable()
export class SocialMediasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSocialMediaDto): Promise<SocialMedia> {
    const { name, link } = dto;

    // Check if social media type already exists
    const existing = await this.prisma.socialMedia.findUnique({
      where: { name },
    });

    if (existing) {
      throw new ConflictException(
        `Media sosial ${name} sudah terdaftar. Gunakan update untuk mengubah link.`,
      );
    }

    const data: Prisma.SocialMediaCreateInput = {
      name,
      link,
    };

    const created = await this.prisma.socialMedia.create({
      data,
    });

    return created;
  }

  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<SocialMedia>> {
    const searchableFields = ['link'];
    const where = createPrismaWhereClause<Prisma.SocialMediaWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<SocialMedia>(
      this.prisma.socialMedia,
      {
        where,
        orderBy,
      },
      {
        page: query.page,
        limit: query.limit,
        baseUrl,
      },
    );
  }

  async findOne(id: number): Promise<SocialMedia> {
    const item = await this.prisma.socialMedia.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Media sosial tidak ditemukan.');
    return item;
  }

  async update(id: number, dto: UpdateSocialMediaDto): Promise<SocialMedia> {
    const existing = await this.prisma.socialMedia.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Media sosial tidak ditemukan.');

    const { name, link } = dto;

    // Check if trying to change name to an existing one
    if (name && name !== existing.name) {
      const duplicate = await this.prisma.socialMedia.findUnique({
        where: { name },
      });

      if (duplicate) {
        throw new ConflictException(
          `Media sosial ${name} sudah terdaftar. Pilih tipe yang berbeda.`,
        );
      }
    }

    const data: Prisma.SocialMediaUpdateInput = {
      ...(name !== undefined ? { name } : {}),
      ...(link !== undefined ? { link } : {}),
    };

    return this.prisma.socialMedia.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<SocialMedia> {
    const existing = await this.prisma.socialMedia.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Media sosial tidak ditemukan.');

    return this.prisma.socialMedia.delete({
      where: { id },
    });
  }
}
