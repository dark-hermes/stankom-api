import { Injectable, NotFoundException } from '@nestjs/common';
import type { Faq, Prisma } from '@prisma/client';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFaqDto): Promise<Faq> {
    const { question, answer } = dto;

    const { createdById } = dto as unknown as { createdById?: number };

    if (!createdById) {
      throw new Error('createdById is required');
    }

    const data: Prisma.FaqCreateInput = {
      question,
      answer,
      createdBy: { connect: { id: createdById } },
    };

    return this.prisma.faq.create({
      data,
      include: { createdBy: true, updatedBy: true },
    });
  }

  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<Faq>> {
    const searchableFields = ['question', 'answer'];
    const where = createPrismaWhereClause<Prisma.FaqWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<Faq>(
      this.prisma.faq,
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

  async findOne(id: number): Promise<Faq> {
    const item = await this.prisma.faq.findUnique({
      where: { id },
      include: { createdBy: true, updatedBy: true },
    });
    if (!item) throw new NotFoundException('FAQ tidak ditemukan.');
    return item;
  }

  async update(id: number, dto: UpdateFaqDto): Promise<Faq> {
    const existing = await this.prisma.faq.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('FAQ tidak ditemukan.');

    const { question, answer } = dto;

    const { updatedById } = dto as unknown as { updatedById?: number };

    const data: Prisma.FaqUpdateInput = {
      ...(question !== undefined ? { question } : {}),
      ...(answer !== undefined ? { answer } : {}),
      ...(updatedById !== undefined
        ? { updatedBy: { connect: { id: updatedById } } }
        : {}),
    };

    return this.prisma.faq.update({
      where: { id },
      data,
      include: { createdBy: true, updatedBy: true },
    });
  }

  async remove(id: number): Promise<Faq> {
    const existing = await this.prisma.faq.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('FAQ tidak ditemukan.');

    return this.prisma.faq.delete({
      where: { id },
    });
  }
}
