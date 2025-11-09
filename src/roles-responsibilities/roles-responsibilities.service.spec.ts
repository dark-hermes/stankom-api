import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RolesResponsibilitiesService } from './roles-responsibilities.service';

describe('RolesResponsibilitiesService', () => {
  let service: RolesResponsibilitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesResponsibilitiesService,
        {
          provide: PrismaService,
          useValue: {
            rolesResponsibilities: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({
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
        },
      ],
    }).compile();

    service = module.get<RolesResponsibilitiesService>(
      RolesResponsibilitiesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('ensureExists should create when missing', async () => {
    const rec = await service.ensureExists();
    expect(rec).toHaveProperty('id');
  });

  it('update should update existing record', async () => {
    // ensure exists once (create will be used)
    await service.ensureExists();
    const updated = await service.update({ roles: 'new' });
    expect(updated.roles).toBe('r2');
  });
});
