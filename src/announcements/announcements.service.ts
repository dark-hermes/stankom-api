import { Injectable, NotFoundException } from '@nestjs/common';
import type { Announcement, Prisma } from '@prisma/client';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAnnouncementDto) {
    const { title, description, attachment, createdById } = dto;

    if (!createdById) {
      throw new Error('createdById is required');
    }

    const data: Prisma.AnnouncementCreateInput = {
      title,
      description,
      attachment: attachment ?? null,
      createdBy: { connect: { id: createdById } },
    };

    return this.prisma.announcement.create({
      data,
      include: { createdBy: true, updatedBy: true },
    });
  }

  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<Announcement>> {
    const searchableFields = ['title', 'description'];
    const where = createPrismaWhereClause<Prisma.AnnouncementWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<Announcement>(
      this.prisma.announcement,
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
    const item = await this.prisma.announcement.findUnique({
      where: { id },
      include: { createdBy: true, updatedBy: true },
    });
    if (!item) throw new NotFoundException('Pengumuman tidak ditemukan.');
    return item;
  }

  async update(id: number, dto: UpdateAnnouncementDto) {
    const existing = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Pengumuman tidak ditemukan.');

    const { title, description, attachment, updatedById } = dto;

    const data: Prisma.AnnouncementUpdateInput = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(attachment !== undefined ? { attachment } : {}),
      ...(updatedById !== undefined
        ? { updatedBy: { connect: { id: updatedById } } }
        : {}),
    };

    return this.prisma.announcement.update({
      where: { id },
      data,
      include: { createdBy: true, updatedBy: true },
    });
  }

  async remove(id: number) {
    await this.prisma.announcement.delete({ where: { id } });
    return { deleted: true };
  }

  async updateAttachment(id: number, attachmentUrl: string) {
    const existing = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Pengumuman tidak ditemukan.');

    const data: Prisma.AnnouncementUpdateInput = {
      attachment: attachmentUrl,
    };

    return this.prisma.announcement.update({
      where: { id },
      data,
      include: { createdBy: true, updatedBy: true },
    });
  }
}
