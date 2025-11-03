import { Test, TestingModule } from '@nestjs/testing';
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
});
