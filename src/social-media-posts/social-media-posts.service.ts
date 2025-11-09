import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, SocialMediaPost } from '@prisma/client';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialMediaPostDto } from './dto/create-social-media-post.dto';
import { UpdateSocialMediaPostDto } from './dto/update-social-media-post.dto';

@Injectable()
export class SocialMediaPostsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSocialMediaPostDto) {
    const { platform, postLink, image, createdById } = dto;

    if (!createdById) {
      throw new Error('createdById is required');
    }

    const data: Prisma.SocialMediaPostCreateInput = {
      platform,
      postLink,
      image,
      createdBy: { connect: { id: createdById } },
    };

    return this.prisma.socialMediaPost.create({
      data,
      include: { createdBy: true, updatedBy: true },
    });
  }

  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<SocialMediaPost>> {
    const searchableFields = ['postLink'];
    const where = createPrismaWhereClause<Prisma.SocialMediaPostWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<SocialMediaPost>(
      this.prisma.socialMediaPost,
      {
        where,
        orderBy,
        include: { createdBy: true, updatedBy: true },
      },
      {
        page: query.page,
        limit: query.limit,
        baseUrl,
      },
    );
  }

  async findOne(id: number) {
    const item = await this.prisma.socialMediaPost.findUnique({
      where: { id },
      include: { createdBy: true, updatedBy: true },
    });
    if (!item) throw new NotFoundException('Social media post not found.');
    return item;
  }

  async update(id: number, dto: UpdateSocialMediaPostDto) {
    const existing = await this.prisma.socialMediaPost.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Social media post not found.');

    const { platform, postLink, image, updatedById } = dto;

    const data: Prisma.SocialMediaPostUpdateInput = {
      ...(platform !== undefined ? { platform } : {}),
      ...(postLink !== undefined ? { postLink } : {}),
      ...(image !== undefined ? { image } : {}),
      ...(updatedById !== undefined
        ? { updatedBy: { connect: { id: updatedById } } }
        : {}),
    };

    return this.prisma.socialMediaPost.update({
      where: { id },
      data,
      include: { createdBy: true, updatedBy: true },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.socialMediaPost.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Social media post not found.');

    await this.prisma.socialMediaPost.delete({ where: { id } });
    return { deleted: true };
  }
}
