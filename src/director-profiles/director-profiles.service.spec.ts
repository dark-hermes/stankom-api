/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { DirectorProfilesService } from './director-profiles.service';
import type { CreateDirectorProfileDto } from './dto/create-director-profile.dto';
import type { UpdateDirectorProfileDto } from './dto/update-director-profile.dto';

describe('DirectorProfilesService', () => {
  let service: DirectorProfilesService;
  let prisma: PrismaService;
  let storage: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DirectorProfilesService,
        {
          provide: PrismaService,
          useValue: {
            directorProfile: {
              create: jest.fn().mockResolvedValue({
                id: 1,
                order: 1,
                beginYear: 2020,
                endYear: 2025,
                name: 'Jane',
                detail: 'Desc',
                picture: 'pic.png',
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
              findUnique: jest.fn().mockResolvedValue({
                id: 1,
                order: 1,
                beginYear: 2020,
                endYear: 2025,
                name: 'Jane',
                detail: 'Desc',
                picture: 'pic.png',
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
              update: jest.fn().mockResolvedValue({
                id: 1,
                order: 2,
                beginYear: 2021,
                endYear: new Date().getFullYear(),
                name: 'Jane Updated',
                detail: 'Desc2',
                picture: 'pic2.png',
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
              delete: jest.fn().mockResolvedValue({
                id: 1,
                order: 1,
                beginYear: 2020,
                endYear: 2025,
                name: 'Jane',
                detail: 'Desc',
                picture: 'pic.png',
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            },
          },
        },
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue('uploaded/pic.png'),
            deleteFile: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get(DirectorProfilesService);
    prisma = module.get(PrismaService);
    storage = module.get(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create defaults endYear when null', async () => {
    const dto: CreateDirectorProfileDto = {
      order: 1,
      beginYear: 2020,
      endYear: null,
      name: 'Jane',
      detail: 'Desc',
    };
    await service.create(dto, 'pic.png');
    type CreateArg = { data: { endYear: number } };
    const createMock = prisma.directorProfile.create as unknown as jest.Mock;
    expect(createMock).toHaveBeenCalled();
    const createCalls = createMock.mock.calls as Array<[CreateArg]>;
    const [createArg] = createCalls[0];
    expect(createArg.data.endYear).toBe(new Date().getFullYear());
  });

  it('update defaults endYear when null', async () => {
    const dto: UpdateDirectorProfileDto = {
      endYear: null,
      name: 'Jane Updated',
    };
    await service.update(1, dto, 'pic2.png');
    type UpdateArg = { data: { endYear: number } };
    const updateMock = prisma.directorProfile.update as unknown as jest.Mock;
    expect(updateMock).toHaveBeenCalled();
    const updateCalls = updateMock.mock.calls as Array<[UpdateArg]>;
    const [updateArg] = updateCalls[0];
    expect(updateArg.data.endYear).toBe(new Date().getFullYear());
    // old picture deleted before update
    expect(storage.deleteFile).toHaveBeenCalledWith('pic.png');
  });

  it('remove deletes picture via storage', async () => {
    await service.remove(1);
    expect(storage.deleteFile).toHaveBeenCalledWith('pic.png');
  });
});
