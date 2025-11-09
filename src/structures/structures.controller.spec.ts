/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import type { Structure } from '@prisma/client';
import { StorageService } from '../storage/storage.service';
import { StructuresController } from './structures.controller';
import { StructuresService } from './structures.service';

describe('StructuresController', () => {
  let controller: StructuresController;
  let service: StructuresService;
  let storage: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StructuresController],
      providers: [
        {
          provide: StructuresService,
          useValue: {
            get: jest.fn(),
            update: jest.fn(),
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

    controller = module.get<StructuresController>(StructuresController);
    service = module.get<StructuresService>(StructuresService);
    storage = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('get should return response dto', async () => {
    const rec: Structure = {
      id: 1,
      image: 'img.png',
      updatedAt: new Date(),
      createdAt: new Date(),
    } as Structure;
    (service.get as jest.Mock).mockResolvedValue(rec);
    const res = await controller.get();
    expect(service.get).toHaveBeenCalled();
    expect(res).toEqual({ message: 'Structure retrieved.', data: rec });
  });

  it('update with dto.image should call service.update only', async () => {
    const updated: Structure = {
      id: 1,
      image: 'new.png',
      updatedAt: new Date(),
      createdAt: new Date(),
    } as Structure;
    (service.update as jest.Mock).mockResolvedValue(updated);
    const res = await controller.update(undefined, { image: 'new.png' });
    expect(storage.uploadFile).not.toHaveBeenCalled();
    expect(service.update).toHaveBeenCalledWith({ image: 'new.png' });
    expect(res.data).toEqual(updated);
  });

  it('update with file should delete old and upload new before update', async () => {
    const existing: Structure = {
      id: 1,
      image: 'old.png',
      updatedAt: new Date(),
      createdAt: new Date(),
    } as Structure;
    (service.get as jest.Mock).mockResolvedValue(existing);
    (storage.uploadFile as jest.Mock).mockResolvedValue('uploaded/new.png');
    const updated: Structure = {
      id: 1,
      image: 'uploaded/new.png',
      updatedAt: new Date(),
      createdAt: new Date(),
    } as Structure;
    (service.update as jest.Mock).mockResolvedValue(updated);

    const file = {
      originalname: 'x.png',
      buffer: Buffer.from('a'),
    } as unknown as Express.Multer.File;
    const res = await controller.update(file, { image: undefined });

    expect(service.get).toHaveBeenCalled();
    expect(storage.deleteFile).toHaveBeenCalledWith('old.png');
    expect(storage.uploadFile).toHaveBeenCalled();
    expect(service.update).toHaveBeenCalledWith({ image: 'uploaded/new.png' });
    expect(res.data.image).toBe('uploaded/new.png');
  });
});
