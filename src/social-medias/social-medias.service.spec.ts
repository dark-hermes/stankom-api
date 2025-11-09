import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SocialMediasService } from './social-medias.service';

const mockPrisma = {
  socialMedia: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('SocialMediasService', () => {
  let service: SocialMediasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialMediasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SocialMediasService>(SocialMediasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
