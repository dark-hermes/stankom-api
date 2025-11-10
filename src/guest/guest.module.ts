import { Module } from '@nestjs/common';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { DirectorProfilesModule } from '../director-profiles/director-profiles.module';
import { FaqModule } from '../faq/faq.module';
import { GalleryModule } from '../gallery/gallery.module';
import { HeroModule } from '../hero/hero.module';
import { HistoriesModule } from '../histories/histories.module';
import { NewsModule } from '../news/news.module';
import { RolesResponsibilitiesModule } from '../roles-responsibilities/roles-responsibilities.module';
import { ServicesModule } from '../services/services.module';
import { SocialMediaPostsModule } from '../social-media-posts/social-media-posts.module';
import { SocialMediasModule } from '../social-medias/social-medias.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { StructuresModule } from '../structures/structures.module';
import { GuestController } from './guest.controller';

@Module({
  imports: [
    NewsModule,
    AnnouncementsModule,
    GalleryModule,
    FaqModule,
    HeroModule,
    HistoriesModule,
    RolesResponsibilitiesModule,
    ServicesModule,
    SocialMediaPostsModule,
    SocialMediasModule,
    StatisticsModule,
    StructuresModule,
    DirectorProfilesModule,
  ],
  controllers: [GuestController],
})
export class GuestModule {}
