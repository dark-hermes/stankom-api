import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

const mockService = {
  createCategory: jest.fn(),
  findAllCategories: jest.fn(),
  updateCategory: jest.fn(),
  removeCategory: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('StatisticsController', () => {
  let controller: StatisticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [{ provide: StatisticsService, useValue: mockService }],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
