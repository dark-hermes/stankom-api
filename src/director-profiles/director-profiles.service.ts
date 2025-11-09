import { Injectable, NotFoundException } from '@nestjs/common';
import type { DirectorProfile, Prisma } from '@prisma/client';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import type { PaginatedResponse } from '../common/interfaces/pagination.interface';
import type { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateDirectorProfileDto } from './dto/create-director-profile.dto';
import { UpdateDirectorProfileDto } from './dto/update-director-profile.dto';

@Injectable()
export class DirectorProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(
    dto: CreateDirectorProfileDto,
    pictureUrl?: string,
  ): Promise<DirectorProfile> {
    const endYearFinal = dto.endYear ?? new Date().getFullYear();
    const data: Prisma.DirectorProfileCreateInput = {
      order: dto.order,
      beginYear: dto.beginYear,
      endYear: endYearFinal,
      name: dto.name,
      detail: dto.detail,
      picture: pictureUrl ?? '',
    };
    return this.prisma.directorProfile.create({ data });
  }

  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<DirectorProfile>> {
    const searchable = ['name', 'detail'];
    const where = createPrismaWhereClause<Prisma.DirectorProfileWhereInput>(
      query,
      searchable,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy) ?? { order: 'asc' };
    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;
    return paginate<DirectorProfile>(
      this.prisma.directorProfile,
      { where, orderBy },
      { page: query.page, limit: query.limit, baseUrl },
    );
  }

  async findOne(id: number): Promise<DirectorProfile> {
    const item = await this.prisma.directorProfile.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Profil direktur tidak ditemukan.');
    return item;
  }

  async update(
    id: number,
    dto: UpdateDirectorProfileDto,
    pictureUrl?: string,
  ): Promise<DirectorProfile> {
    const existing = await this.prisma.directorProfile.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException('Profil direktur tidak ditemukan.');

    // If a new picture is provided, delete the previous one (best-effort)
    if (pictureUrl && existing.picture && existing.picture !== pictureUrl) {
      try {
        await this.storage.deleteFile(existing.picture);
      } catch {
        /* swallow */
      }
    }
    const endYearFinal =
      dto.endYear === null || dto.endYear === undefined
        ? new Date().getFullYear()
        : dto.endYear;
    const data: Prisma.DirectorProfileUpdateInput = {
      ...(dto.order !== undefined ? { order: dto.order } : {}),
      ...(dto.beginYear !== undefined ? { beginYear: dto.beginYear } : {}),
      ...(endYearFinal !== undefined ? { endYear: endYearFinal } : {}),
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.detail !== undefined ? { detail: dto.detail } : {}),
      ...(pictureUrl !== undefined ? { picture: pictureUrl } : {}),
    };
    return this.prisma.directorProfile.update({ where: { id }, data });
  }

  async remove(id: number): Promise<DirectorProfile> {
    const existing = await this.prisma.directorProfile.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException('Profil direktur tidak ditemukan.');
    // best-effort delete of stored picture
    if (existing.picture) {
      try {
        await this.storage.deleteFile(existing.picture);
      } catch {
        /* swallow */
      }
    }
    return this.prisma.directorProfile.delete({ where: { id } });
  }
}
