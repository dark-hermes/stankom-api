import { Injectable } from '@nestjs/common';
import type { Structure } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StructuresService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureExists(): Promise<Structure> {
    let rec = await this.prisma.structure.findFirst();
    if (!rec) {
      rec = await this.prisma.structure.create({ data: { image: '' } });
    }
    return rec;
  }

  async get(): Promise<Structure> {
    return this.ensureExists();
  }

  async update(data: { image?: string }): Promise<Structure> {
    const existing = await this.ensureExists();
    return this.prisma.structure.update({
      where: { id: existing.id },
      data: { image: data.image ?? existing.image },
    });
  }
}
