import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { HeroController } from './hero.controller';
import { HeroService } from './hero.service';

@Module({
  imports: [PrismaModule, StorageModule],
  providers: [HeroService],
  exports: [HeroService],
  controllers: [HeroController],
})
export class HeroModule {}
