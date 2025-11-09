import { Injectable } from '@nestjs/common';
import type { RolesResponsibilities } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesResponsibilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Ensure a single RolesResponsibilities record exists; create default if missing */
  async ensureExists(): Promise<RolesResponsibilities> {
    let record = await this.prisma.rolesResponsibilities.findFirst();
    if (!record) {
      record = await this.prisma.rolesResponsibilities.create({
        data: {
          roles: 'Initial roles description',
          responsibilities: 'Initial responsibilities description',
        },
      });
    }
    return record;
  }

  async get(): Promise<RolesResponsibilities> {
    return this.ensureExists();
  }

  async update(data: {
    roles?: string;
    responsibilities?: string;
  }): Promise<RolesResponsibilities> {
    const existing = await this.ensureExists();
    return this.prisma.rolesResponsibilities.update({
      where: { id: existing.id },
      data: {
        roles: data.roles ?? existing.roles,
        responsibilities: data.responsibilities ?? existing.responsibilities,
      },
    });
  }
}
