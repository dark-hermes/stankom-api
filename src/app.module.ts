import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { pinoLoggerConfig } from './config/pino-logger.config';
import { HealthModule } from './health/health.module';
import { NewsModule } from './news/news.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { GalleryModule } from './gallery/gallery.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
