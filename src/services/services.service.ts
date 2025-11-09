import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Service } from '@prisma/client';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateServiceDto) {
    const { title, description, icon, link } = dto;

    const { createdById } = dto as unknown as { createdById?: number };

    if (!createdById) {
      throw new Error('createdById is required');
    }

    const data: Prisma.ServiceCreateInput = {
      title,
      description,
      icon: icon ?? '',
      link: link ?? null,
      createdBy: { connect: { id: createdById } },
    };

    return this.prisma.service.create({
      data,
      include: { createdBy: true, updatedBy: true },
    });
  }

  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<Service>> {
    const searchableFields = ['title', 'description'];
    const where = createPrismaWhereClause<Prisma.ServiceWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<Service>(
      this.prisma.service,
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
    const item = await this.prisma.service.findUnique({
      where: { id },
      include: { createdBy: true, updatedBy: true },
    });
    if (!item) throw new NotFoundException('Layanan tidak ditemukan.');
    return item;
  }

  async update(id: number, dto: UpdateServiceDto) {
    const existing = await this.prisma.service.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Layanan tidak ditemukan.');

    const { title, description, icon, link } = dto;

    const { updatedById } = dto as unknown as { updatedById?: number };

    const data: Prisma.ServiceUpdateInput = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(link !== undefined ? { link: link ?? null } : {}),
      ...(updatedById !== undefined
        ? { updatedBy: { connect: { id: updatedById } } }
        : {}),
    };

    return this.prisma.service.update({
      where: { id },
      data,
      include: { createdBy: true, updatedBy: true },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Layanan tidak ditemukan.');

    await this.prisma.service.delete({ where: { id } });
    return { deleted: true };
  }

  async updateIcon(id: number, iconUrl: string) {
    const existing = await this.prisma.service.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Layanan tidak ditemukan.');

    const data: Prisma.ServiceUpdateInput = {
      icon: iconUrl,
    };

    return this.prisma.service.update({
      where: { id },
      data,
    });
  }
}
