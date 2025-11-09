/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import type { HeroSection } from '@prisma/client';
import { StorageService } from '../storage/storage.service';
import type { HeroResponseDto } from './dto/hero-response.dto';
import { HeroController } from './hero.controller';
import { HeroService } from './hero.service';

describe('HeroController', () => {
  let controller: HeroController;
  let service: HeroService;
  let storage: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeroController],
      providers: [
        {
          provide: HeroService,
          useValue: {
            get: jest.fn(),
            update: jest.fn(),
            replaceBanner: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(HeroController);
    service = module.get(HeroService);
    storage = module.get(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('get returns hero', async () => {
    const rec: HeroSection = {
      id: 1,
      heading: 'H',
      subHeading: 'S',
      banner: '',
      pathVideo: null,
      updatedAt: new Date(),
    } as HeroSection;
    (service.get as jest.Mock).mockResolvedValue(rec);
    const res: HeroResponseDto = await controller.get();
    expect(service.get).toHaveBeenCalled();
    expect(res).toEqual({ message: 'Hero retrieved.', data: rec });
  });

  it('update with JSON calls service.update', async () => {
    const updated: HeroSection = {
      id: 1,
      heading: 'New',
      subHeading: 'S',
      banner: '',
      pathVideo: 'v.mp4',
      updatedAt: new Date(),
    } as HeroSection;
    (service.update as jest.Mock).mockResolvedValue(updated);
    const res: HeroResponseDto = await controller.update({
      heading: 'New',
      pathVideo: 'v.mp4',
    });
    expect(service.update).toHaveBeenCalledWith({
      heading: 'New',
      pathVideo: 'v.mp4',
    });
    expect(res.data).toEqual(updated);
  });

  it('uploadBanner uses service.replaceBanner', async () => {
    const updated: HeroSection = {
      id: 1,
      heading: 'H',
      subHeading: 'S',
      banner: 'uploaded/banner.png',
      pathVideo: null,
      updatedAt: new Date(),
    } as HeroSection;
    (service.replaceBanner as jest.Mock).mockResolvedValue(updated);
    const file = {
      originalname: 'b.png',
      buffer: Buffer.from('x'),
    } as unknown as Express.Multer.File;
    const res: HeroResponseDto = await controller.uploadBanner(file);
    expect(service.replaceBanner).toHaveBeenCalled();
    expect(storage.uploadFile).not.toHaveBeenCalled();
    expect(res.data.banner).toBe('uploaded/banner.png');
  });
});
