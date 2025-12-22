import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Contact, Prisma } from '@prisma/client';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import type { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactsByKeyDto } from './dto/update-contacts-by-key.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContactDto) {
    const { key, value } = dto;

    const existing = await this.prisma.contact.findUnique({ where: { key } });
    if (existing) throw new Error(`Contact with key ${key} already exists`);

    return this.prisma.contact.create({ data: { key, value } });
  }

  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<Contact>> {
    const searchableFields = ['key', 'value'];
    const where = createPrismaWhereClause<Prisma.ContactWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<Contact>(
      this.prisma.contact,
      { where, orderBy },
      { page: query.page, limit: query.limit, baseUrl },
    );
  }

  async findOne(id: number) {
    const item = await this.prisma.contact.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Contact not found');
    return item;
  }

  async findByKey(key: string) {
    const item = await this.prisma.contact.findUnique({ where: { key } });
    if (!item) throw new NotFoundException('Contact not found');
    return item;
  }

  async update(id: number, dto: UpdateContactDto) {
    const existing = await this.prisma.contact.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Contact not found');

    const { value } = dto;

    const data: Prisma.ContactUpdateInput = {
      ...(value !== undefined ? { value } : {}),
    };

    return this.prisma.contact.update({ where: { id }, data });
  }

  async updateByKeys(dto: UpdateContactsByKeyDto): Promise<Contact[]> {
    const keyValuePairs = Object.entries({
      map_url: dto.map_url,
      address: dto.address,
      contact: dto.contact,
    }).filter(([, value]) => value !== undefined);

    if (!keyValuePairs.length)
      throw new BadRequestException('No contact keys provided to update');

    const keys = keyValuePairs.map(([key]) => key);
    const existing = await this.prisma.contact.findMany({
      where: { key: { in: keys } },
    });

    const missing = keys.filter(
      (key) => !existing.some((contact) => contact.key === key),
    );

    if (missing.length)
      throw new NotFoundException(
        `Contact not found for keys: ${missing.join(', ')}`,
      );

    const baseUpdate: Prisma.ContactUpdateInput = {};

    if (dto.updatedById !== undefined)
      baseUpdate.updatedBy = { connect: { id: dto.updatedById } };

    const transactions = keyValuePairs.map(([key, value]) =>
      this.prisma.contact.update({
        where: { key },
        data: { ...baseUpdate, value },
      }),
    );

    return this.prisma.$transaction(transactions);
  }
}
