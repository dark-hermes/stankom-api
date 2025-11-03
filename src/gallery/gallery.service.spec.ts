import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { GalleryService } from './gallery.service';

describe('GalleryService', () => {
  let service: GalleryService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GalleryService,
        {
          provide: PrismaService,
          useValue: {
            gallery: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            galleryImage: {
              createMany: jest.fn(),
              deleteMany: jest.fn(),
              delete: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<GalleryService>(GalleryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have prisma service injected', () => {
    expect(prisma).toBeDefined();
  });
});
