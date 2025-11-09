import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { StructuresController } from './structures.controller';
import { StructuresService } from './structures.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [StructuresController],
  providers: [StructuresService],
  exports: [StructuresService],
})
export class StructuresModule {}
