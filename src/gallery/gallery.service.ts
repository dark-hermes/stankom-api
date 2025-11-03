import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Gallery, Prisma } from '@prisma/client';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { paginate } from '../common/utils/paginator';
import {
  createPrismaOrderByClause,
  createPrismaWhereClause,
} from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

const MAX_IMAGES_PER_GALLERY = 4;

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGalleryDto, imageUrls: string[] = []) {
    const { title, description } = dto;

    if (imageUrls.length > MAX_IMAGES_PER_GALLERY) {
      throw new BadRequestException(
        `Maksimal ${MAX_IMAGES_PER_GALLERY} gambar per galeri.`,
      );
    }

    const data: Prisma.GalleryCreateInput = {
      title,
      description: description ?? null,
      images:
        imageUrls.length > 0
          ? { create: imageUrls.map((url) => ({ image: url })) }
          : undefined,
    };

    return this.prisma.gallery.create({
      data,
      include: { images: true },
    });
  }

  async findAll(
    query: FilterSearchQueryDto,
    req?: RequestWithBaseUrl,
  ): Promise<PaginatedResponse<Gallery>> {
    const searchableFields = ['title', 'description'];
    const where = createPrismaWhereClause<Prisma.GalleryWhereInput>(
      query,
      searchableFields,
    );
    const orderBy = createPrismaOrderByClause(query.sortBy);

    const baseUrl = req
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
      : null;

    return paginate<Gallery>(
      this.prisma.gallery,
      {
        where,
        orderBy,
        include: { images: true },
      },
      {
        page: query.page,
        limit: query.limit,
        baseUrl,
      },
    );
  }

  async findOne(id: number) {
    const item = await this.prisma.gallery.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!item) throw new NotFoundException('Galeri tidak ditemukan.');
    return item;
  }

  async update(id: number, dto: UpdateGalleryDto) {
    const existing = await this.prisma.gallery.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Galeri tidak ditemukan.');

    const { title, description } = dto;

    const data: Prisma.GalleryUpdateInput = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
    };

    return this.prisma.gallery.update({
      where: { id },
      data,
      include: { images: true },
    });
  }

  async remove(id: number) {
    // Delete all images first
    await this.prisma.galleryImage.deleteMany({ where: { galleryId: id } });
    await this.prisma.gallery.delete({ where: { id } });
    return { deleted: true };
  }

  async addImages(galleryId: number, imageUrls: string[]) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { id: galleryId },
      include: { images: true },
    });

    if (!gallery) throw new NotFoundException('Galeri tidak ditemukan.');

    const currentImageCount = gallery.images.length;
    const newImageCount = imageUrls.length;

    if (currentImageCount + newImageCount > MAX_IMAGES_PER_GALLERY) {
      throw new BadRequestException(
        `Galeri sudah memiliki ${currentImageCount} gambar. Maksimal ${MAX_IMAGES_PER_GALLERY} gambar per galeri.`,
      );
    }

    await this.prisma.galleryImage.createMany({
      data: imageUrls.map((url) => ({ galleryId, image: url })),
    });

    return this.findOne(galleryId);
  }

  async deleteImage(galleryId: number, imageId: number) {
    const image = await this.prisma.galleryImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Gambar tidak ditemukan.');
    }

    if (image.galleryId !== galleryId) {
      throw new BadRequestException('Gambar tidak ada di galeri ini.');
    }

    await this.prisma.galleryImage.delete({ where: { id: imageId } });

    return { deleted: true, imageUrl: image.image };
  }

  async getImagesByGalleryId(galleryId: number) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { id: galleryId },
      include: { images: true },
    });

    if (!gallery) throw new NotFoundException('Galeri tidak ditemukan.');

    return gallery.images;
  }
}
