import { Controller, Get, Header } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get('health.html')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getHealthHtml(): string {
    return this.healthService.getHealthHtml();
  }
}
