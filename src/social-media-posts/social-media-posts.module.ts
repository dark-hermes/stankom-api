import { Module } from '@nestjs/common';
import { SocialMediaPostsService } from './social-media-posts.service';
import { SocialMediaPostsController } from './social-media-posts.controller';

@Module({
  providers: [SocialMediaPostsService],
  controllers: [SocialMediaPostsController],
})
export class SocialMediaPostsModule {}
