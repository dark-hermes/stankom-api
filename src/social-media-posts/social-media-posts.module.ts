import { Module } from '@nestjs/common';
import { SocialMediaPostsController } from './social-media-posts.controller';
import { SocialMediaPostsService } from './social-media-posts.service';

@Module({
  providers: [SocialMediaPostsService],
  controllers: [SocialMediaPostsController],
  exports: [SocialMediaPostsService],
})
export class SocialMediaPostsModule {}
