import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesResponsibilitiesController } from './roles-responsibilities.controller';
import { RolesResponsibilitiesService } from './roles-responsibilities.service';

@Module({
  imports: [PrismaModule],
  providers: [RolesResponsibilitiesService],
  exports: [RolesResponsibilitiesService],
  controllers: [RolesResponsibilitiesController],
})
export class RolesResponsibilitiesModule {}
