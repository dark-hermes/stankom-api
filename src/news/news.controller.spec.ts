import { Test, TestingModule } from '@nestjs/testing';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { StorageService } from '../storage/storage.service';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

describe('NewsController', () => {
  let controller: NewsController;

  const mockNewsService = {
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue({
      data: [],
      meta: { currentPage: 1, perPage: 10, totalItems: 0, totalPages: 0 },
      links: { first: null, previous: null, next: null, last: null },
    }),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createCategory: jest.fn(),
    findAllCategories: jest.fn().mockResolvedValue({
      data: [],
      meta: { currentPage: 1, perPage: 10, totalItems: 0, totalPages: 0 },
      links: { first: null, previous: null, next: null, last: null },
    }),
    findAllByCategory: jest.fn().mockResolvedValue({
      data: [],
      meta: { currentPage: 1, perPage: 10, totalItems: 0, totalPages: 0 },
      links: { first: null, previous: null, next: null, last: null },
    }),
    findCategoryById: jest
      .fn()
      .mockResolvedValue({ id: 1, title: 'Test', slug: 'test' }),
    updateCategory: jest.fn(),
    removeCategory: jest.fn(),
    createTag: jest.fn(),
    findAllTags: jest.fn().mockResolvedValue({
      data: [],
      meta: { currentPage: 1, perPage: 10, totalItems: 0, totalPages: 0 },
      links: { first: null, previous: null, next: null, last: null },
    }),
    updateTag: jest.fn(),
    removeTag: jest.fn(),
  };

  const mockStorageService = {
    uploadFile: jest
      .fn()
      .mockResolvedValue(
        'https://storage.googleapis.com/bucket/news/test-image.jpg',
      ),
    deleteFile: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        { provide: NewsService, useValue: mockNewsService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    controller = module.get<NewsController>(NewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return paginated news by category id', async () => {
    const req = {
      protocol: 'http',
      get: () => 'localhost',
      baseUrl: '',
    } as unknown as RequestWithBaseUrl;
    const query: FilterSearchQueryDto = {} as FilterSearchQueryDto;

    const res = await controller.findAllByCategory(1, req, query);
    expect(res).toBeDefined();
    expect(mockNewsService.findAllByCategory).toHaveBeenCalledWith(
      1,
      query,
      req,
    );
  });

  it('should return category by id', async () => {
    const res = await controller.findCategory(1);
    expect(res).toBeDefined();
    expect(mockNewsService.findCategoryById).toHaveBeenCalledWith(1);
  });
});
