import { Injectable, NotFoundException } from '@nestjs/common';
import type { History, Prisma } from '@prisma/client';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import type { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';

@Injectable()
export class HistoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHistoryDto): Promise<History> {
    const { year, description, detail } = dto;
    const data: Prisma.HistoryCreateInput = { year, description, detail };
    return this.prisma.history.create({ data });
  }

  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<History>> {
    const searchableFields = ['description', 'detail'];
    const where = createPrismaWhereClause<Prisma.HistoryWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);
    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;
    return paginate<History>(
      this.prisma.history,
      { where, orderBy },
      { page: query.page, limit: query.limit, baseUrl },
    );
  }

  async findOne(id: number): Promise<History> {
    const item = await this.prisma.history.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('History tidak ditemukan.');
    return item;
  }

  async update(id: number, dto: UpdateHistoryDto): Promise<History> {
    const existing = await this.prisma.history.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('History tidak ditemukan.');
    const { year, description, detail } = dto;
    const data: Prisma.HistoryUpdateInput = {
      ...(year !== undefined ? { year } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(detail !== undefined ? { detail } : {}),
    };
    return this.prisma.history.update({ where: { id }, data });
  }

  async remove(id: number): Promise<History> {
    const existing = await this.prisma.history.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('History tidak ditemukan.');
    return this.prisma.history.delete({ where: { id } });
  }
}
