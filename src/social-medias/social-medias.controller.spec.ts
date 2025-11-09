import { Test, TestingModule } from '@nestjs/testing';
import { SocialMediasController } from './social-medias.controller';
import { SocialMediasService } from './social-medias.service';

const mockSocialMediasService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SocialMediasController', () => {
  let controller: SocialMediasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialMediasController],
      providers: [
        { provide: SocialMediasService, useValue: mockSocialMediasService },
      ],
    }).compile();

    controller = module.get<SocialMediasController>(SocialMediasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
