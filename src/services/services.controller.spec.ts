import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../storage/storage.service';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

const mockServicesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  updateIcon: jest.fn(),
  remove: jest.fn(),
};

const mockStorageService = {};

describe('ServicesController', () => {
  let controller: ServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        { provide: ServicesService, useValue: mockServicesService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
