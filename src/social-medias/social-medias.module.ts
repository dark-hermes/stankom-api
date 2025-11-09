import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SocialMediasController } from './social-medias.controller';
import { SocialMediasService } from './social-medias.service';

@Module({
  imports: [PrismaModule],
  providers: [SocialMediasService],
  controllers: [SocialMediasController],
  exports: [SocialMediasService],
})
export class SocialMediasModule {}
