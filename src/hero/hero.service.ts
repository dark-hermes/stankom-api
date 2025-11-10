import { Injectable } from '@nestjs/common';
import type { HeroSection } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

interface UpdateHeroData {
  heading?: string;
  subHeading?: string;
  pathVideo?: string | null;
  banner?: string;
}

@Injectable()
export class HeroService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async ensureExists(): Promise<HeroSection> {
    let hero = await this.prisma.heroSection.findFirst();
    if (!hero) {
      hero = await this.prisma.heroSection.create({
        data: {
          heading: 'Initial Heading',
          subHeading: 'Initial Sub Heading',
          banner: '',
          pathVideo: null,
        },
      });
    }
    return hero;
  }

  async get(): Promise<HeroSection> {
    return this.ensureExists();
  }

  async update(data: UpdateHeroData): Promise<HeroSection> {
    const existing = await this.ensureExists();
    return this.prisma.heroSection.update({
      where: { id: existing.id },
      data: {
        heading: data.heading ?? existing.heading,
        subHeading: data.subHeading ?? existing.subHeading,
        pathVideo:
          data.pathVideo === undefined ? existing.pathVideo : data.pathVideo,
        banner: data.banner ?? existing.banner,
      },
    });
  }

  async replaceBanner(file: Express.Multer.File): Promise<HeroSection> {
    const existing = await this.ensureExists();
    // Only delete previous banner if it looks like a managed storage URL
    const shouldDeletePrev =
      typeof existing.banner === 'string' &&
      existing.banner.startsWith('http') &&
      existing.banner.includes('storage.');
    if (shouldDeletePrev) {
      try {
        await this.storage.deleteFile(existing.banner);
      } catch {
        // swallow errors; could log
      }
    }
    const newUrl = await this.storage.uploadFile(file, 'hero/');
    return this.update({ banner: newUrl });
  }
}
