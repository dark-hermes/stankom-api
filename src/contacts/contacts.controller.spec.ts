import { Test, TestingModule } from '@nestjs/testing';
import type { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { UpdateContactDto } from './dto/update-contact.dto';

describe('ContactsController', () => {
  let controller: ContactsController;
  let service: ContactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        {
          provide: ContactsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByKey: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
    service = module.get<ContactsService>(ContactsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should set updatedById from req.user and call update', async () => {
    const dto = { value: 'new value' } as UpdateContactDto;
    const updated = {
      id: 1,
      key: 'map_url',
      value: 'new value',
      updatedById: 42,
    };
    const updateMock = (service as unknown as { update: jest.Mock }).update;
    updateMock.mockResolvedValue(updated);

    const req = { user: { id: 42 } } as unknown as RequestWithBaseUrl;
    const res = await controller.update(req, 1, dto);

    expect(updateMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ value: 'new value', updatedById: 42 }),
    );
    expect(res.data).toEqual(updated);
  });
});
