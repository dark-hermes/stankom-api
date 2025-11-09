import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AuthModule } from './auth/auth.module';
import { pinoLoggerConfig } from './config/pino-logger.config';
import { DirectorProfilesModule } from './director-profiles/director-profiles.module';
import { FaqModule } from './faq/faq.module';
import { GalleryModule } from './gallery/gallery.module';
import { HealthModule } from './health/health.module';
import { HeroModule } from './hero/hero.module';
import { HistoriesModule } from './histories/histories.module';
import { NewsModule } from './news/news.module';
import { PrismaModule } from './prisma/prisma.module';
import { RolesResponsibilitiesModule } from './roles-responsibilities/roles-responsibilities.module';
import { ServicesModule } from './services/services.module';
import { SocialMediaPostsModule } from './social-media-posts/social-media-posts.module';
import { SocialMediasModule } from './social-medias/social-medias.module';
import { StatisticsModule } from './statistics/statistics.module';
import { StorageModule } from './storage/storage.module';
import { StructuresModule } from './structures/structures.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(pinoLoggerConfig),
    AuthModule,
    PrismaModule,
    UsersModule,
    HealthModule,
    NewsModule,
    StorageModule,
    AnnouncementsModule,
    GalleryModule,
    FaqModule,
    ServicesModule,
    SocialMediasModule,
    SocialMediaPostsModule,
    StatisticsModule,
    HistoriesModule,
    RolesResponsibilitiesModule,
    StructuresModule,
    DirectorProfilesModule,
    HeroModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// NOTE: harmless whitespace/comment change to trigger husky pre-commit test
