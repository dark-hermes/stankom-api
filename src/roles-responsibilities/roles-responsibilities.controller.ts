import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesResponsibilitiesResponseDto } from './dto/roles-responsibilities-response.dto';
import { UpdateRolesResponsibilitiesDto } from './dto/update-roles-responsibilities.dto';
import { RolesResponsibilitiesService } from './roles-responsibilities.service';

@ApiTags('Roles & Responsibilities')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles-responsibilities')
export class RolesResponsibilitiesController {
  constructor(private readonly rrService: RolesResponsibilitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get roles & responsibilities' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RolesResponsibilitiesResponseDto,
  })
  async get(): Promise<RolesResponsibilitiesResponseDto> {
    const data = await this.rrService.get();
    return { message: 'Roles & Responsibilities retrieved.', data };
  }

  @Put()
  @ApiOperation({ summary: 'Update roles & responsibilities' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RolesResponsibilitiesResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Body() dto: UpdateRolesResponsibilitiesDto,
  ): Promise<RolesResponsibilitiesResponseDto> {
    const data = await this.rrService.update(dto);
    return { message: 'Roles & Responsibilities updated.', data };
  }
}
