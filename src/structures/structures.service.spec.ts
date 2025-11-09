/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StructuresService } from './structures.service';

describe('StructuresService', () => {
  let service: StructuresService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StructuresService,
        {
          provide: PrismaService,
          useValue: {
            structure: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest
                .fn()
                .mockResolvedValue({ id: 1, image: '', updatedAt: new Date() }),
              update: jest.fn().mockResolvedValue({
                id: 1,
                image: 'new.png',
                updatedAt: new Date(),
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<StructuresService>(StructuresService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('ensureExists creates when missing', async () => {
    const rec = await service.ensureExists();
    expect(rec).toHaveProperty('id');
    expect(prisma.structure.create as jest.Mock).toHaveBeenCalled();
  });

  it('update replaces image value', async () => {
    await service.ensureExists();
    const updated = await service.update({ image: 'new.png' });
    expect(updated.image).toBe('new.png');
  });
});
