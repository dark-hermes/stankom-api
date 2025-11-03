import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../storage/storage.service';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';

describe('AnnouncementsController', () => {
  let controller: AnnouncementsController;
  let service: AnnouncementsService;
  let storageService: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementsController],
      providers: [
        {
          provide: AnnouncementsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            updateAttachment: jest.fn(),
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

    controller = module.get<AnnouncementsController>(AnnouncementsController);
    service = module.get<AnnouncementsService>(AnnouncementsService);
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
