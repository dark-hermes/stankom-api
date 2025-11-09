/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import type { HeroSection } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { HeroService } from './hero.service';

describe('HeroService', () => {
  let service: HeroService;
  let prisma: PrismaService;
  let storage: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeroService,
        {
          provide: PrismaService,
          useValue: {
            heroSection: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockImplementation(
                ({ data }: { data: Partial<HeroSection> }) =>
                  ({
                    id: 1,
                    updatedAt: new Date(),
                    ...data,
                  }) as HeroSection,
              ),
              update: jest.fn().mockImplementation(
                ({ data }: { data: Partial<HeroSection> }) =>
                  ({
                    id: 1,
                    updatedAt: new Date(),
                    heading: 'Initial Heading',
                    subHeading: 'Initial Sub Heading',
                    banner: data.banner ?? '',
                    pathVideo: data.pathVideo ?? null,
                  }) as HeroSection,
              ),
            },
          },
        },
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue('uploaded/banner.png'),
            deleteFile: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get(HeroService);
    prisma = module.get(PrismaService);
    storage = module.get(StorageService);
  });

  it('ensureExists creates default row when missing', async () => {
    const hero = await service.ensureExists();
    expect(hero).toHaveProperty('id');
    expect(prisma.heroSection.create).toHaveBeenCalled();
  });

  it('update merges provided fields', async () => {
    await service.ensureExists();
    await service.update({ heading: 'New H', pathVideo: 'vid.mp4' });
    expect(prisma.heroSection.update).toHaveBeenCalled();
  });

  it('replaceBanner deletes old and uploads new', async () => {
    // make ensureExists return existing with banner
    (prisma.heroSection.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 1,
      heading: 'H',
      subHeading: 'S',
      banner: 'old.png',
      pathVideo: null,
      updatedAt: new Date(),
    } as HeroSection);
    const filePartial: Partial<Express.Multer.File> = {
      originalname: 'b.png',
      buffer: Buffer.from('x'),
    };
    const file = filePartial as Express.Multer.File;
    await service.replaceBanner(file);
    expect(storage.deleteFile).toHaveBeenCalledWith('old.png');
    expect(storage.uploadFile).toHaveBeenCalled();
    expect(prisma.heroSection.update).toHaveBeenCalled();
  });
});
