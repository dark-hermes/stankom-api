import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FilterSearchQueryDto } from '../common/dto/filter-search-query.dto';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import type { RequestWithBaseUrl } from '../common/interfaces/request-with-base-url.interface';
import { ContactsService } from './contacts.service';
import { ContactResponseDto } from './dto/contact-response.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@ApiTags('Contacts')
@ApiCookieAuth()
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Contact created',
    type: ContactResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: RequestWithBaseUrl,
    @Body() dto: CreateContactDto,
  ): Promise<ContactResponseDto> {
    if (req.user?.id) dto.createdById = req.user.id;
    const created = await this.contactsService.create(dto);
    return { message: 'Contact berhasil dibuat.', data: created };
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK })
  findAll(
    @Req() req: RequestWithBaseUrl,
    @Query() query: FilterSearchQueryDto,
  ) {
    return this.contactsService.findAll(query, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: HttpStatus.OK })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.findOne(id);
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get contact by key' })
  @ApiParam({ name: 'key', description: 'Contact key' })
  @ApiResponse({ status: HttpStatus.OK })
  findByKey(@Param('key') key: string) {
    return this.contactsService.findByKey(key);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiBody({ type: UpdateContactDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact updated',
    type: ContactResponseDto,
  })
  async update(
    @Req() req: RequestWithBaseUrl,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactDto,
  ): Promise<ContactResponseDto> {
    if (req.user?.id) dto.updatedById = req.user.id;

    const updated = await this.contactsService.update(id, dto);
    return { message: 'Contact berhasil diperbarui.', data: updated };
  }
}
