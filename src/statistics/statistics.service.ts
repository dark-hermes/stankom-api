import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Statistic, StatisticCategory } from '@prisma/client';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStatisticCategoryDto } from './dto/create-statistic-category.dto';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticCategoryDto } from './dto/update-statistic-category.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  // Categories
  async createCategory(dto: CreateStatisticCategoryDto) {
    const { name, link } = dto;
    return this.prisma.statisticCategory.create({
      data: { name, link: link ?? null },
    });
  }

  async findAllCategories(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<StatisticCategory>> {
    const searchableFields = ['name'];
    const where = createPrismaWhereClause<Prisma.StatisticCategoryWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<StatisticCategory>(
      this.prisma.statisticCategory,
      { where, orderBy },
      { page: query.page, limit: query.limit, baseUrl },
    );
  }

  async updateCategory(id: number, dto: UpdateStatisticCategoryDto) {
    const existing = await this.prisma.statisticCategory.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Category not found');

    const { name, link } = dto;
    const data: Prisma.StatisticCategoryUpdateInput = {
      ...(name !== undefined ? { name } : {}),
      ...(link !== undefined ? { link } : {}),
    };

    return this.prisma.statisticCategory.update({ where: { id }, data });
  }

  async removeCategory(id: number) {
    await this.prisma.statisticCategory.delete({ where: { id } });
    return { deleted: true };
  }

  // Statistics
  async create(dto: CreateStatisticDto) {
    const { name, number, link, categoryId } = dto;

    // validate category exists
    const category = await this.prisma.statisticCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category)
      throw new Error(`Category with id ${categoryId} does not exist`);

    const data: Prisma.StatisticCreateInput = {
      name,
      number,
      link: link ?? null,
      category: { connect: { id: categoryId } },
    } as Prisma.StatisticCreateInput;

    return this.prisma.statistic.create({ data });
  }

  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<Statistic>> {
    const searchableFields = ['name'];
    const where = createPrismaWhereClause<Prisma.StatisticWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<Statistic>(
      this.prisma.statistic,
      { where, orderBy, include: { category: true } },
      { page: query.page, limit: query.limit, baseUrl },
    );
  }

  async findOne(id: number) {
    const item = await this.prisma.statistic.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!item) throw new NotFoundException('Statistic not found');
    return item;
  }

  async update(id: number, dto: UpdateStatisticDto) {
    const existing = await this.prisma.statistic.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Statistic not found');

    const { name, number, link, categoryId } = dto;

    if (categoryId !== undefined) {
      const category = await this.prisma.statisticCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category)
        throw new Error(`Category with id ${categoryId} does not exist`);
    }

    const data: Prisma.StatisticUpdateInput = {
      ...(name !== undefined ? { name } : {}),
      ...(number !== undefined ? { number } : {}),
      ...(link !== undefined ? { link } : {}),
      ...(categoryId !== undefined
        ? { category: { connect: { id: categoryId } } }
        : {}),
    };

    await this.prisma.statistic.update({ where: { id }, data });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.prisma.statistic.delete({ where: { id } });
    return { deleted: true };
  }
}
