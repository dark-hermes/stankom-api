/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import type { DirectorProfile } from '@prisma/client';
import { StorageService } from '../storage/storage.service';
import { DirectorProfilesController } from './director-profiles.controller';
import { DirectorProfilesService } from './director-profiles.service';

describe('DirectorProfilesController', () => {
  let controller: DirectorProfilesController;
  let service: DirectorProfilesService;
  let storage: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectorProfilesController],
      providers: [
        {
          provide: DirectorProfilesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
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

    controller = module.get(DirectorProfilesController);
    service = module.get(DirectorProfilesService);
    storage = module.get(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create with file uploads picture and calls service', async () => {
    const created: DirectorProfile = {
      id: 1,
      order: 1,
      beginYear: 2020,
      endYear: new Date().getFullYear(),
      name: 'Jane',
      detail: 'Desc',
      picture: 'url1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (storage.uploadFile as jest.Mock).mockResolvedValue('url1');
    (service.create as jest.Mock).mockResolvedValue(created);
    const file = {
      originalname: 'p.png',
      buffer: Buffer.from('x'),
    } as unknown as Express.Multer.File;
    const res = await controller.create(
      { order: 1, beginYear: 2020, name: 'Jane', detail: 'Desc' },
      file,
    );
    expect(storage.uploadFile).toHaveBeenCalled();
    expect(service.create).toHaveBeenCalledWith(
      { order: 1, beginYear: 2020, name: 'Jane', detail: 'Desc' },
      'url1',
    );
    expect(res.data).toEqual(created);
  });

  it('update with file uploads and calls service', async () => {
    const updated: DirectorProfile = {
      id: 1,
      order: 2,
      beginYear: 2021,
      endYear: new Date().getFullYear(),
      name: 'Jane U',
      detail: 'Desc2',
      picture: 'url2',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (storage.uploadFile as jest.Mock).mockResolvedValue('url2');
    (service.update as jest.Mock).mockResolvedValue(updated);
    const file = {
      originalname: 'p2.png',
      buffer: Buffer.from('y'),
    } as unknown as Express.Multer.File;
    const res = await controller.update(1, { order: 2 }, file);
    expect(storage.uploadFile).toHaveBeenCalled();
    expect(service.update).toHaveBeenCalledWith(1, { order: 2 }, 'url2');
    expect(res.data).toEqual(updated);
  });
});
