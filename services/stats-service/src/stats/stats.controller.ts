import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from './stats.service';

@Controller()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'stats-service',
      at: new Date().toISOString(),
    };
  }
}

@Controller('stats')
@UseGuards(AuthGuard('jwt'))
export class StatsRoutesController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getStats() {
    return this.statsService.getStats();
  }

  @Get('events')
  getEventsStats() {
    return this.statsService.getEventsStats();
  }

  @Get('tickets')
  getTicketsStats() {
    return this.statsService.getTicketsStats();
  }

  @Get('payments')
  getPaymentsStats() {
    return this.statsService.getPaymentsStats();
  }
}

