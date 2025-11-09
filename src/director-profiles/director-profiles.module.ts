import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { DirectorProfilesController } from './director-profiles.controller';
import { DirectorProfilesService } from './director-profiles.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [DirectorProfilesController],
  providers: [DirectorProfilesService],
  exports: [DirectorProfilesService],
})
export class DirectorProfilesModule {}
