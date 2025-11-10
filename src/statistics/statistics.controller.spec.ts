import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

describe('StatisticsController', () => {
  let controller: StatisticsController;

  const mockService = {
    createCategory: jest.fn(),
    findAllCategories: jest.fn().mockResolvedValue({
      data: [],
      meta: { currentPage: 1, perPage: 10, totalItems: 0, totalPages: 0 },
      links: { first: null, previous: null, next: null, last: null },
    }),
    findCategoryById: jest
      .fn()
      .mockResolvedValue({ id: 1, name: 'Test', statistics: [] }),
    updateCategory: jest.fn(),
    removeCategory: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

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

  it('should return statistic category by id', async () => {
    const res = await controller.findCategory(1);
    expect(res).toBeDefined();
    expect(mockService.findCategoryById).toHaveBeenCalledWith(1);
  });
});
