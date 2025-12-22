import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AnnouncementsService } from '../announcements/announcements.service';
import { Public } from '../common/decorators/public.decorator';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import type { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { sanitizeUserData } from '../common/utils/sanitize-user-data';
import { DirectorProfilesService } from '../director-profiles/director-profiles.service';
import { FaqService } from '../faq/faq.service';
import { GalleryService } from '../gallery/gallery.service';
import { HeroService } from '../hero/hero.service';
import { HistoriesService } from '../histories/histories.service';
import { NewsService } from '../news/news.service';
import { RegulationsService } from '../regulations/regulations.service';
import { ContactsService } from '../contacts/contacts.service';
import { RolesResponsibilitiesService } from '../roles-responsibilities/roles-responsibilities.service';
import { ServicesService } from '../services/services.service';
import { SocialMediaPostsService } from '../social-media-posts/social-media-posts.service';
import { SocialMediasService } from '../social-medias/social-medias.service';
import { StatisticsService } from '../statistics/statistics.service';
import { StructuresService } from '../structures/structures.service';

@ApiTags('Public / Guest')
@Controller('public')
@Public()
export class GuestController {
  constructor(
    private readonly newsService: NewsService,
    private readonly announcementsService: AnnouncementsService,
    private readonly galleryService: GalleryService,
    private readonly faqService: FaqService,
    private readonly heroService: HeroService,
    private readonly historiesService: HistoriesService,
    private readonly rolesResponsibilitiesService: RolesResponsibilitiesService,
    private readonly servicesService: ServicesService,
    private readonly socialMediaPostsService: SocialMediaPostsService,
    private readonly socialMediasService: SocialMediasService,
    private readonly statisticsService: StatisticsService,
    private readonly structuresService: StructuresService,
    private readonly directorProfilesService: DirectorProfilesService,
    private readonly regulationsService: RegulationsService,
    private readonly contactsService: ContactsService,
  ) {}

  // News endpoints
  @Get('news')
  @ApiOperation({ summary: '[Public] Get all published news with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of published news' })
  async getPublishedNews(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    // Use filter to show only published news
    const modifiedQuery: FilterSearchQueryDto = {
      ...query,
      filter: 'status:published',
    };
    const result = await this.newsService.findAll(modifiedQuery, req);
    return sanitizeUserData(result);
  }

  @Get('news/slug/:slug')
  @ApiOperation({ summary: '[Public] Get published news by slug' })
  @ApiParam({ name: 'slug', type: String })
  @ApiResponse({ status: 200, description: 'Published news details' })
  @ApiResponse({ status: 404, description: 'News not found or not published' })
  async getPublishedNewsBySlug(@Param('slug') slug: string) {
    const news = await this.newsService.findOneBySlug(slug);
    if (news.status !== 'published') {
      throw new NotFoundException('News not published');
    }
    return sanitizeUserData({
      message: 'Berita berhasil diambil.',
      data: news,
    });
  }

  @Get('news/categories/:id/news')
  @ApiOperation({ summary: '[Public] Get published news by category ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of published news in category',
  })
  async getPublishedNewsByCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    const modifiedQuery: FilterSearchQueryDto = {
      ...query,
      filter: 'status:published',
    };
    const result = await this.newsService.findAllByCategory(
      id,
      modifiedQuery,
      req,
    );
    return sanitizeUserData(result);
  }

  @Get('news/categories')
  @ApiOperation({ summary: '[Public] Get all news categories' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of news categories' })
  async getNewsCategories(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    return this.newsService.findAllCategories(query, req);
  }

  @Get('news/categories/:id')
  @ApiOperation({ summary: '[Public] Get news category by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'News category details' })
  async getNewsCategoryById(@Param('id', ParseIntPipe) id: number) {
    const category = await this.newsService.findCategoryById(id);
    return { message: 'Kategori berita berhasil diambil.', data: category };
  }

  @Get('news/:id')
  @ApiOperation({ summary: '[Public] Get published news by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Published news details' })
  @ApiResponse({ status: 404, description: 'News not found or not published' })
  async getPublishedNewsById(@Param('id', ParseIntPipe) id: number) {
    const news = await this.newsService.findOne(id);
    if (news.status !== 'published') {
      throw new NotFoundException('News not published');
    }
    return sanitizeUserData({
      message: 'Berita berhasil diambil.',
      data: news,
    });
  }

  // Announcements endpoints
  @Get('announcements')
  @ApiOperation({ summary: '[Public] Get all announcements' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of announcements' })
  async getAnnouncements(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    const result = await this.announcementsService.findAll(query, req);
    return sanitizeUserData(result);
  }

  @Get('announcements/:id')
  @ApiOperation({ summary: '[Public] Get announcement by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Announcement details' })
  async getAnnouncementById(@Param('id', ParseIntPipe) id: number) {
    const announcement = await this.announcementsService.findOne(id);
    return sanitizeUserData({
      message: 'Pengumuman berhasil diambil.',
      data: announcement,
    });
  }

  // Gallery endpoints
  @Get('galleries')
  @ApiOperation({ summary: '[Public] Get all galleries' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of galleries' })
  async getGalleries(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    return this.galleryService.findAll(query, req);
  }

  @Get('galleries/:id')
  @ApiOperation({ summary: '[Public] Get gallery by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Gallery details' })
  async getGalleryById(@Param('id', ParseIntPipe) id: number) {
    const gallery = await this.galleryService.findOne(id);
    return { message: 'Galeri berhasil diambil.', data: gallery };
  }

  // FAQ endpoints
  @Get('faq')
  @ApiOperation({ summary: '[Public] Get all FAQs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of FAQs' })
  async getFaq(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    const result = await this.faqService.findAll(query, req);
    return sanitizeUserData(result);
  }

  @Get('faq/:id')
  @ApiOperation({ summary: '[Public] Get FAQ by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'FAQ details' })
  async getFaqById(@Param('id', ParseIntPipe) id: number) {
    const faq = await this.faqService.findOne(id);
    return sanitizeUserData({ message: 'FAQ berhasil diambil.', data: faq });
  }

  // Hero section
  @Get('hero')
  @ApiOperation({ summary: '[Public] Get hero section' })
  @ApiResponse({ status: 200, description: 'Hero section data' })
  async getHero() {
    const hero = await this.heroService.get();
    return { message: 'Hero berhasil diambil.', data: hero };
  }

  // Histories
  @Get('histories')
  @ApiOperation({ summary: '[Public] Get all histories' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of histories' })
  async getHistories(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    return this.historiesService.findAll(query, req);
  }

  @Get('histories/:id')
  @ApiOperation({ summary: '[Public] Get history by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'History details' })
  async getHistoryById(@Param('id', ParseIntPipe) id: number) {
    const history = await this.historiesService.findOne(id);
    return { message: 'Sejarah berhasil diambil.', data: history };
  }

  // Roles & Responsibilities
  @Get('roles-responsibilities')
  @ApiOperation({ summary: '[Public] Get roles and responsibilities' })
  @ApiResponse({
    status: 200,
    description: 'Roles and responsibilities data',
  })
  async getRolesResponsibilities() {
    const data = await this.rolesResponsibilitiesService.get();
    return {
      message: 'Tugas & Wewenang berhasil diambil.',
      data,
    };
  }

  // Services
  @Get('services')
  @ApiOperation({ summary: '[Public] Get all services' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of services' })
  async getServices(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    const result = await this.servicesService.findAll(query, req);
    return sanitizeUserData(result);
  }

  @Get('services/:id')
  @ApiOperation({ summary: '[Public] Get service by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Service details' })
  async getServiceById(@Param('id', ParseIntPipe) id: number) {
    const service = await this.servicesService.findOne(id);
    return sanitizeUserData({
      message: 'Layanan berhasil diambil.',
      data: service,
    });
  }

  // Social Media Posts
  @Get('social-media-posts')
  @ApiOperation({ summary: '[Public] Get all social media posts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of social media posts' })
  async getSocialMediaPosts(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    const result = await this.socialMediaPostsService.findAll(query, req);
    return sanitizeUserData(result);
  }

  @Get('social-media-posts/:id')
  @ApiOperation({ summary: '[Public] Get social media post by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Social media post details' })
  async getSocialMediaPostById(@Param('id', ParseIntPipe) id: number) {
    const post = await this.socialMediaPostsService.findOne(id);
    return sanitizeUserData({
      message: 'Post media sosial berhasil diambil.',
      data: post,
    });
  }

  // Social Medias
  @Get('social-medias')
  @ApiOperation({ summary: '[Public] Get all social media links' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of social media links' })
  async getSocialMedias(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    return this.socialMediasService.findAll(query, req);
  }

  @Get('social-medias/:id')
  @ApiOperation({ summary: '[Public] Get social media by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Social media details' })
  async getSocialMediaById(@Param('id', ParseIntPipe) id: number) {
    const socialMedia = await this.socialMediasService.findOne(id);
    return { message: 'Media sosial berhasil diambil.', data: socialMedia };
  }

  // Statistics
  @Get('statistics/categories')
  @ApiOperation({ summary: '[Public] Get all statistic categories' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of statistic categories' })
  async getStatisticCategories(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    return this.statisticsService.findAllCategories(query, req);
  }

  @Get('statistics/categories/:id')
  @ApiOperation({ summary: '[Public] Get statistic category by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Statistic category details' })
  async getStatisticCategoryById(@Param('id', ParseIntPipe) id: number) {
    const category = await this.statisticsService.findCategoryById(id);
    return { message: 'Kategori statistik berhasil diambil.', data: category };
  }

  @Get('statistics')
  @ApiOperation({ summary: '[Public] Get all statistics' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of statistics' })
  async getStatistics(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    return this.statisticsService.findAll(query, req);
  }

  // Regulations
  @Get('regulations')
  @ApiOperation({ summary: '[Public] Get all regulations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of regulations' })
  async getRegulations(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    const result = await this.regulationsService.findAll(query, req);
    return sanitizeUserData(result);
  }

  @Get('regulations/:id')
  @ApiOperation({ summary: '[Public] Get regulation by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Regulation details' })
  async getRegulationById(@Param('id', ParseIntPipe) id: number) {
    const regulation = await this.regulationsService.findOne(id);
    return sanitizeUserData({
      message: 'Regulasi berhasil diambil.',
      data: regulation,
    });
  }

  // Contacts public endpoints
  @Get('contacts')
  @ApiOperation({ summary: '[Public] Get all contacts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of contacts' })
  async getContacts(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    const result = await this.contactsService.findAll(query, req);
    return sanitizeUserData(result);
  }

  @Get('contacts/key/:key')
  @ApiOperation({ summary: '[Public] Get contact by key' })
  @ApiParam({ name: 'key', type: String })
  @ApiResponse({ status: 200, description: 'Contact details' })
  async getContactByKey(@Param('key') key: string) {
    const contact = await this.contactsService.findByKey(key);
    return sanitizeUserData({
      message: 'Kontak berhasil diambil.',
      data: contact,
    });
  }
  @Get('statistics/:id')
  @ApiOperation({ summary: '[Public] Get statistic by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Statistic details' })
  async getStatisticById(@Param('id', ParseIntPipe) id: number) {
    const statistic = await this.statisticsService.findOne(id);
    return { message: 'Statistik berhasil diambil.', data: statistic };
  }

  // Structure
  @Get('structure')
  @ApiOperation({ summary: '[Public] Get organizational structure' })
  @ApiResponse({ status: 200, description: 'Structure data' })
  async getStructure() {
    const structure = await this.structuresService.get();
    return {
      message: 'Struktur organisasi berhasil diambil.',
      data: structure,
    };
  }

  // Director Profiles
  @Get('director-profiles')
  @ApiOperation({ summary: '[Public] Get all director profiles' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of director profiles' })
  async getDirectorProfiles(
    @Query() query: FilterSearchQueryDto,
    @Req() req: RequestWithBaseUrl,
  ) {
    return this.directorProfilesService.findAll(query, req);
  }

  @Get('director-profiles/:id')
  @ApiOperation({ summary: '[Public] Get director profile by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Director profile details' })
  async getDirectorProfileById(@Param('id', ParseIntPipe) id: number) {
    const profile = await this.directorProfilesService.findOne(id);
    return { message: 'Profil direktur berhasil diambil.', data: profile };
  }
}
