import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../storage/storage.service';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';

describe('GalleryController', () => {
  let controller: GalleryController;
  let service: GalleryService;
  let storageService: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GalleryController],
      providers: [
        {
          provide: GalleryService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            addImages: jest.fn(),
            deleteImage: jest.fn(),
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

    controller = module.get<GalleryController>(GalleryController);
    service = module.get<GalleryService>(GalleryService);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have service and storageService injected', () => {
    expect(service).toBeDefined();
    expect(storageService).toBeDefined();
  });
});
