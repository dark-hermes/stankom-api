import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../storage/storage.service';
import { RegulationsController } from './regulations.controller';
import { RegulationsService } from './regulations.service';

describe('RegulationsController', () => {
  let controller: RegulationsController;
  let service: RegulationsService;
  let storageService: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegulationsController],
      providers: [
        {
          provide: RegulationsService,
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

    controller = module.get<RegulationsController>(RegulationsController);
    service = module.get<RegulationsService>(RegulationsService);
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
