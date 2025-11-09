/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';

const sampleFaq = {
  id: 1,
  question: 'Q?',
  answer: 'A',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: 2,
  updatedById: null,
};

describe('FaqController', () => {
  let controller: FaqController;
  let service: FaqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaqController],
      providers: [
        {
          provide: FaqService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FaqController>(FaqController);
    service = module.get<FaqService>(FaqService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have service injected', () => {
    expect(service).toBeDefined();
  });

  describe('controller methods', () => {
    it('create should call service.create and return response dto', async () => {
      (service.create as jest.Mock).mockResolvedValue(sampleFaq);
      const dto: CreateFaqDto = { question: 'Q?', answer: 'A' };
      const res = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res).toHaveProperty('message');
      expect(res).toHaveProperty('data');
      expect(res.data).toEqual(sampleFaq);
    });

    it('findAll should call service.findAll', async () => {
      (service.findAll as jest.Mock).mockReturnValue({} as any);
      const req: any = {
        protocol: 'http',
        get: () => 'localhost:3000',
        baseUrl: '',
      };
      const query: any = {};
      await controller.findAll(req, query);
      expect((service.findAll as jest.Mock).mock.calls).toMatchObject([
        [query, req],
      ]);
    });

    it('findOne should call service.findOne', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(sampleFaq);
      await controller.findOne(1);
      expect((service.findOne as jest.Mock).mock.calls).toMatchObject([[1]]);
    });

    it('update should call service.update and return response dto', async () => {
      const updated = { ...sampleFaq, question: 'Q2' };
      (service.update as jest.Mock).mockResolvedValue(updated);
      const dto: UpdateFaqDto = { question: 'Q2' } as UpdateFaqDto;
      const res = await controller.update(1, dto);
      expect((service.update as jest.Mock).mock.calls).toMatchObject([
        [1, dto],
      ]);
      expect(res.data).toEqual(updated);
    });

    it('remove should call service.remove and return success message', async () => {
      (service.remove as jest.Mock).mockResolvedValue(undefined);
      const res = await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(res).toHaveProperty('message');
    });
  });
});
