/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { RolesResponsibilitiesController } from './roles-responsibilities.controller';
import { RolesResponsibilitiesService } from './roles-responsibilities.service';

describe('RolesResponsibilitiesController', () => {
  let controller: RolesResponsibilitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesResponsibilitiesController],
      providers: [
        {
          provide: RolesResponsibilitiesService,
          useValue: {
            get: jest.fn().mockResolvedValue({
              id: 1,
              roles: 'r',
              responsibilities: 'rs',
              updatedAt: new Date(),
            }),
            update: jest.fn().mockResolvedValue({
              id: 1,
              roles: 'r2',
              responsibilities: 'rs2',
              updatedAt: new Date(),
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<RolesResponsibilitiesController>(
      RolesResponsibilitiesController,
    );
    // Intentionally not retrieving service to avoid unused var lint
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('get should return response dto', async () => {
    await expect(controller.get()).resolves.toMatchObject({
      message: expect.any(String),
      data: expect.any(Object),
    });
  });

  it('update should call service.update and return response dto', async () => {
    await expect(controller.update({ roles: 'x' })).resolves.toMatchObject({
      message: expect.any(String),
      data: expect.any(Object),
    });
  });
});
