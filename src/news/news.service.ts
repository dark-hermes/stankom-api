import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { News, NewsCategory, NewsStatus, Tag } from '@prisma/client';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { generateSlug } from '../common/utils/slug';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsCategoryDto } from './dto/create-news-category.dto';
import { CreateNewsDto } from './dto/create-news.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateNewsCategoryDto } from './dto/update-news-category.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  // News
  async create(dto: CreateNewsDto) {
    const {
      tagIds,
      status,
      title,
      excerpt,
      description,
      image,
      categoryId,
      createdById,
    } = dto;

    if (!createdById) {
      throw new Error('createdById is required');
    }

    // Auto-generate unique slug from title
    let slug = generateSlug(title);
    let counter = 1;

    // Check if slug exists and generate unique one
    while (await this.prisma.news.findUnique({ where: { slug } })) {
      counter++;
      slug = `${generateSlug(title)}-${counter}`;
    }

    // Validate that the category exists
    const categoryExists = await this.prisma.newsCategory.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      throw new BadRequestException(
        `Category with id ${categoryId} does not exist`,
      );
    }

    // Validate that all tags exist if tagIds are provided
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      const existingTags = await this.prisma.tag.findMany({
        where: { id: { in: tagIds } },
      });

      if (existingTags.length !== tagIds.length) {
        const foundIds = existingTags.map((tag) => tag.id);
        const missingIds = tagIds.filter((id) => !foundIds.includes(id));
        throw new BadRequestException(
          `Tag(s) with id(s) ${missingIds.join(', ')} do not exist`,
        );
      }
    }

    const tagsCreate =
      Array.isArray(tagIds) && tagIds.length
        ? { create: tagIds.map((tagId: number) => ({ tagId })) }
        : undefined;

    const data: Prisma.NewsCreateInput = {
      title,
      slug,
      excerpt,
      description,
      image: image ?? null,
      ...(status ? { status: status as NewsStatus } : {}),
      category: { connect: { id: categoryId } },
      createdBy: { connect: { id: createdById } },
      tags: tagsCreate,
    } as Prisma.NewsCreateInput;

    return this.prisma.news.create({
      data,
      include: { tags: true, category: true, createdBy: true },
    });
  }

  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<News>> {
    const searchableFields = ['title', 'excerpt', 'description', 'slug'];
    const where = createPrismaWhereClause<Prisma.NewsWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<News>(
      this.prisma.news,
      {
        where,
        orderBy,
        include: {
          tags: { include: { tag: true } },
          category: true,
          createdBy: true,
        },
      },
      {
        page: query.page,
        limit: query.limit,
        baseUrl,
      },
    );
  }

  async findAllByCategory(
    categoryId: number,
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<News>> {
    const searchableFields = ['title', 'excerpt', 'description', 'slug'];
    const where = createPrismaWhereClause<Prisma.NewsWhereInput>(
      query,
      searchableFields,
    );

    // Ensure category filter is applied
    where.categoryId = categoryId;

    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<News>(
      this.prisma.news,
      {
        where,
        orderBy,
        include: {
          tags: { include: { tag: true } },
          category: true,
          createdBy: true,
        },
      },
      {
        page: query.page,
        limit: query.limit,
        baseUrl,
      },
    );
  }

  async findOne(id: number) {
    const item = await this.prisma.news.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        category: true,
        createdBy: true,
      },
    });
    if (!item) throw new NotFoundException('News not found');
    return item;
  }

  async update(id: number, dto: UpdateNewsDto) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('News not found');

    const {
      tagIds,
      status,
      title,
      excerpt,
      description,
      image,
      categoryId,
      updatedById,
    } = dto;

    // Auto-generate unique slug from title if title is being updated
    let slug: string | undefined = undefined;
    if (title !== undefined) {
      slug = generateSlug(title);
      let counter = 1;

      // Check if slug exists (excluding current news item)
      while (
        await this.prisma.news.findFirst({
          where: { slug, id: { not: id } },
        })
      ) {
        counter++;
        slug = `${generateSlug(title)}-${counter}`;
      }
    }

    // Validate that the category exists if it's being updated
    if (categoryId !== undefined) {
      const categoryExists = await this.prisma.newsCategory.findUnique({
        where: { id: categoryId },
      });

      if (!categoryExists) {
        throw new BadRequestException(
          `Category with id ${categoryId} does not exist`,
        );
      }
    }

    // Validate that all tags exist if tagIds are provided
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      const existingTags = await this.prisma.tag.findMany({
        where: { id: { in: tagIds } },
      });

      if (existingTags.length !== tagIds.length) {
        const foundIds = existingTags.map((tag) => tag.id);
        const missingIds = tagIds.filter((id) => !foundIds.includes(id));
        throw new BadRequestException(
          `Tag(s) with id(s) ${missingIds.join(', ')} do not exist`,
        );
      }
    }

    // Update main fields
    const data: Prisma.NewsUpdateInput = {
      ...(title !== undefined ? { title } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(excerpt !== undefined ? { excerpt } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(image !== undefined ? { image } : {}),
      ...(status ? { status: status as NewsStatus } : {}),
      ...(categoryId !== undefined
        ? { category: { connect: { id: categoryId } } }
        : {}),
      ...(updatedById !== undefined
        ? { updatedBy: { connect: { id: updatedById } } }
        : {}),
    } as Prisma.NewsUpdateInput;

    await this.prisma.news.update({
      where: { id },
      data,
      include: {
        tags: { include: { tag: true } },
        category: true,
        createdBy: true,
      },
    });

    if (Array.isArray(tagIds)) {
      // replace tags
      await this.prisma.newsTag.deleteMany({ where: { newsId: id } });
      if (tagIds.length) {
        await this.prisma.newsTag.createMany({
          data: tagIds.map((tagId: number) => ({ newsId: id, tagId })),
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.prisma.newsTag.deleteMany({ where: { newsId: id } });
    await this.prisma.news.delete({ where: { id } });
    return { deleted: true };
  }

  async updateImage(id: number, imageUrl: string) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Berita tidak ditemukan.');

    const data: Prisma.NewsUpdateInput = {
      image: imageUrl,
    };

    return this.prisma.news.update({
      where: { id },
      data,
      include: {
        tags: { include: { tag: true } },
        category: true,
        createdBy: true,
      },
    });
  }

  // Categories
  async createCategory(dto: CreateNewsCategoryDto) {
    const { createdById, title } = dto;

    if (!createdById) {
      throw new Error('createdById is required');
    }

    // Auto-generate unique slug from title
    let slug = generateSlug(title);
    let counter = 1;

    // Check if slug exists and generate unique one
    while (await this.prisma.newsCategory.findUnique({ where: { slug } })) {
      counter++;
      slug = `${generateSlug(title)}-${counter}`;
    }

    return this.prisma.newsCategory.create({
      data: {
        title,
        slug,
        createdBy: { connect: { id: createdById } },
      },
    });
  }

  async findAllCategories(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<NewsCategory>> {
    const searchableFields = ['title', 'slug'];
    const where = createPrismaWhereClause<Prisma.NewsCategoryWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<NewsCategory>(
      this.prisma.newsCategory,
      { where, orderBy },
      {
        page: query.page,
        limit: query.limit,
        baseUrl,
      },
    );
  }

  async updateCategory(id: number, dto: UpdateNewsCategoryDto) {
    const existing = await this.prisma.newsCategory.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Category not found');

    const { updatedById, title } = dto;

    // Auto-generate unique slug from title if title is being updated
    let slug: string | undefined = undefined;
    if (title !== undefined) {
      slug = generateSlug(title);
      let counter = 1;

      // Check if slug exists (excluding current category)
      while (
        await this.prisma.newsCategory.findFirst({
          where: { slug, id: { not: id } },
        })
      ) {
        counter++;
        slug = `${generateSlug(title)}-${counter}`;
      }
    }

    const data: Prisma.NewsCategoryUpdateInput = {
      ...(title !== undefined ? { title } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(updatedById !== undefined
        ? { updatedBy: { connect: { id: updatedById } } }
        : {}),
    };

    return this.prisma.newsCategory.update({ where: { id }, data });
  }

  async removeCategory(id: number) {
    // Optionally handle orphaned news; here we simply delete the category if exists
    await this.prisma.newsCategory.delete({ where: { id } });
    return { deleted: true };
  }

  // Tags
  async createTag(dto: CreateTagDto) {
    const { name } = dto;

    // Auto-generate unique slug from name
    let slug = generateSlug(name);
    let counter = 1;

    // Check if slug exists and generate unique one
    while (await this.prisma.tag.findUnique({ where: { slug } })) {
      counter++;
      slug = `${generateSlug(name)}-${counter}`;
    }

    return this.prisma.tag.create({ data: { name, slug } });
  }

  async findAllTags(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<Tag>> {
    const searchableFields = ['name', 'slug'];
    const where = createPrismaWhereClause<Prisma.TagWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<Tag>(
      this.prisma.tag,
      { where, orderBy },
      {
        page: query.page,
        limit: query.limit,
        baseUrl,
      },
    );
  }

  async updateTag(id: number, dto: UpdateTagDto) {
    const existing = await this.prisma.tag.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tag not found');

    const { name } = dto;

    // Auto-generate unique slug from name if name is being updated
    let slug: string | undefined = undefined;
    if (name !== undefined) {
      slug = generateSlug(name);
      let counter = 1;

      // Check if slug exists (excluding current tag)
      while (
        await this.prisma.tag.findFirst({
          where: { slug, id: { not: id } },
        })
      ) {
        counter++;
        slug = `${generateSlug(name)}-${counter}`;
      }
    }

    const data = {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
    };

    return this.prisma.tag.update({ where: { id }, data });
  }

  async removeTag(id: number) {
    // remove relation rows first
    await this.prisma.newsTag.deleteMany({ where: { tagId: id } });
    await this.prisma.tag.delete({ where: { id } });
    return { deleted: true };
  }
}
