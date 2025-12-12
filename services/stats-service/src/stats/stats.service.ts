// @ts-nocheck
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitService } from '../rabbit/rabbit.service';
import { StatsRepository, StatsSnapshot } from './stats.repository';

@Injectable()
export class StatsService implements OnModuleInit {
  private readonly repo = new StatsRepository(process.env.STATS_DATABASE_URL);

  constructor(private readonly rabbit: RabbitService) {}

  async onModuleInit() {
    await this.rabbit.consume(
      'stats-service',
      ['event.*', 'ticket.*', 'payment.*'],
      async (routingKey, messageId, payload) => {
        await this.repo.applyEvent(routingKey, messageId, payload);
      }
    );
  }

  async getStats(): Promise<StatsSnapshot> {
    return this.repo.getStats();
  }

  async getEventsStats() {
    const stats = await this.repo.getStats();
    return stats.events;
  }

  async getTicketsStats() {
    const stats = await this.repo.getStats();
    return stats.tickets;
  }

  async getPaymentsStats() {
    const stats = await this.repo.getStats();
    return stats.payments;
  }
}
