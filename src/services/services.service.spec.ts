/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Service as ServiceModel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

describe('ServicesService', () => {
  let service: ServicesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: PrismaService,
          useValue: {
            service: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CRUD operations', () => {
    const sample: ServiceModel & { createdBy?: any; updatedBy?: any } = {
      id: 1,
      title: 'S',
      description: 'D',
      icon: 'icon-url',
      link: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: 1,
      updatedById: null,
      createdBy: {
        id: 1,
        name: 'User',
        email: 'u@example.com',
        password: 'x',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      updatedBy: null,
    } as ServiceModel & { createdBy?: any; updatedBy?: any };

    it('create should call prisma.create and return created service', async () => {
      (prisma.service.create as jest.Mock).mockResolvedValue(sample);
      const dto = {
        title: 'S',
        description: 'D',
        icon: 'icon',
        link: null,
        createdById: 1,
      } as CreateServiceDto;
      const result = await service.create(dto);
      expect(prisma.service.create).toHaveBeenCalled();
      expect(result).toEqual(sample);
    });

    it('findOne should return item when found', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(sample);
      const result = await service.findOne(1);
      expect(prisma.service.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { createdBy: true, updatedBy: true },
      });
      expect(result).toEqual(sample);
    });

    it('findOne should throw NotFoundException when not found', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('update should update when existing found', async () => {
      const updated = {
        ...sample,
        title: 'S2',
      } as ServiceModel & { createdBy?: any; updatedBy?: any };
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(sample);
      (prisma.service.update as jest.Mock).mockResolvedValue(updated);
      const dto = { title: 'S2', updatedById: 1 } as UpdateServiceDto;
      const result = await service.update(1, dto);
      expect(prisma.service.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });

    it('update should throw NotFoundException when not existing', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.update(999, { title: 'x' } as UpdateServiceDto),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('remove should delete when existing found', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(sample);
      (prisma.service.delete as jest.Mock).mockResolvedValue(sample);
      const result = await service.remove(1);
      expect(prisma.service.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ deleted: true });
    });

    it('remove should throw NotFoundException when not existing', async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
