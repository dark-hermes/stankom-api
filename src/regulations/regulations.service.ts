import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Regulation } from '@prisma/client';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegulationDto } from './dto/create-regulation.dto';
import { UpdateRegulationDto } from './dto/update-regulation.dto';

@Injectable()
export class RegulationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRegulationDto) {
    const { title, description, attachment, createdById } = dto;

    if (!createdById) {
      throw new Error('createdById is required');
    }

    const data: Prisma.RegulationCreateInput = {
      title,
      description,
      attachment: attachment ?? null,
      createdBy: { connect: { id: createdById } },
    };

    return this.prisma.regulation.create({
      data,
      include: { createdBy: true, updatedBy: true },
    });
  }

  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<Regulation>> {
    const searchableFields = ['title', 'description'];
    const where = createPrismaWhereClause<Prisma.RegulationWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<Regulation>(
      this.prisma.regulation,
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
    const item = await this.prisma.regulation.findUnique({
      where: { id },
      include: { createdBy: true, updatedBy: true },
    });
    if (!item) throw new NotFoundException('Regulasi tidak ditemukan.');
    return item;
  }

  async update(id: number, dto: UpdateRegulationDto) {
    const existing = await this.prisma.regulation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Regulasi tidak ditemukan.');

    const { title, description, attachment, updatedById } = dto;

    const data: Prisma.RegulationUpdateInput = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(attachment !== undefined ? { attachment } : {}),
      ...(updatedById !== undefined
        ? { updatedBy: { connect: { id: updatedById } } }
        : {}),
    };

    return this.prisma.regulation.update({
      where: { id },
      data,
      include: { createdBy: true, updatedBy: true },
    });
  }

  async remove(id: number) {
    await this.prisma.regulation.delete({ where: { id } });
    return { deleted: true };
  }

  async updateAttachment(id: number, attachmentUrl: string) {
    const existing = await this.prisma.regulation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Regulasi tidak ditemukan.');

    const data: Prisma.RegulationUpdateInput = {
      attachment: attachmentUrl,
    };

    return this.prisma.regulation.update({
      where: { id },
      data,
      include: { createdBy: true, updatedBy: true },
    });
  }
}
