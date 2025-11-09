import { Test, TestingModule } from '@nestjs/testing';
import { SocialMediaPostsController } from './social-media-posts.controller';
import { SocialMediaPostsService } from './social-media-posts.service';

const mockPostsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SocialMediaPostsController', () => {
  let controller: SocialMediaPostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialMediaPostsController],
      providers: [
        { provide: SocialMediaPostsService, useValue: mockPostsService },
      ],
    }).compile();

    controller = module.get<SocialMediaPostsController>(
      SocialMediaPostsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
