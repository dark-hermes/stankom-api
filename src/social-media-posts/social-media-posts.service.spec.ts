import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SocialMediaPostsService } from './social-media-posts.service';

const mockPrisma = {
  socialMediaPost: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('SocialMediaPostsService', () => {
  let service: SocialMediaPostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialMediaPostsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SocialMediaPostsService>(SocialMediaPostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
