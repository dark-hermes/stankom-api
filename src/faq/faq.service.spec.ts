/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Faq } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqService } from './faq.service';

describe('FaqService', () => {
  let service: FaqService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqService,
        {
          provide: PrismaService,
          useValue: {
            faq: {
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

    service = module.get<FaqService>(FaqService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have prisma service injected', () => {
    expect(prisma).toBeDefined();
  });

  describe('CRUD operations', () => {
    const sampleFaq: Faq & { createdBy?: any; updatedBy?: any } = {
      id: 1,
      question: 'Q?',
      answer: 'A',
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
    } as Faq & { createdBy?: any; updatedBy?: any };

    it('create should call prisma.create and return created faq', async () => {
      (prisma.faq.create as jest.Mock).mockResolvedValue(sampleFaq);

      const dto = {
        question: 'Q?',
        answer: 'A',
        createdById: 1,
      } as CreateFaqDto;
      const result = await service.create(dto);

      expect(prisma.faq.create).toHaveBeenCalled();
      expect(result).toEqual(sampleFaq);
    });

    it('findOne should return item when found', async () => {
      (prisma.faq.findUnique as jest.Mock).mockResolvedValue(sampleFaq);
      const result = await service.findOne(1);
      expect(prisma.faq.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { createdBy: true, updatedBy: true },
      });
      expect(result).toEqual(sampleFaq);
    });

    it('findOne should throw NotFoundException when not found', async () => {
      (prisma.faq.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('update should update when existing found', async () => {
      const updated = { ...sampleFaq, question: 'Q2' } as Faq & {
        createdBy?: any;
        updatedBy?: any;
      };
      (prisma.faq.findUnique as jest.Mock).mockResolvedValue(sampleFaq);
      (prisma.faq.update as jest.Mock).mockResolvedValue(updated);

      const dto = { question: 'Q2', updatedById: 1 } as UpdateFaqDto;
      const result = await service.update(1, dto);

      expect(prisma.faq.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });

    it('update should throw NotFoundException when not existing', async () => {
      (prisma.faq.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.update(999, { question: 'x' } as UpdateFaqDto),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('remove should delete when existing found', async () => {
      (prisma.faq.findUnique as jest.Mock).mockResolvedValue(sampleFaq);
      (prisma.faq.delete as jest.Mock).mockResolvedValue(sampleFaq);
      const result = await service.remove(1);
      expect(prisma.faq.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(sampleFaq);
    });

    it('remove should throw NotFoundException when not existing', async () => {
      (prisma.faq.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
