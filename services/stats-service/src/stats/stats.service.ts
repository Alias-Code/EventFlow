// @ts-nocheck
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitService } from '../rabbit/rabbit.service';
import { StatsRepository, StatsSnapshot } from './stats.repository';

@Injectable()
export class StatsService implements OnModuleInit {
  private readonly repo = new StatsRepository(process.env.STATS_DATABASE_URL);

  constructor(private readonly rabbit: RabbitService) {}

  async onModuleInit() {
    // Connexion RabbitMQ avec retry
    let retries = 5;
    let connected = false;
    
    while (retries > 0 && !connected) {
      try {
        await this.rabbit.consume(
          'stats-service',
          ['event.*', 'ticket.*', 'payment.*'],
          async (routingKey, messageId, payload) => {
            await this.repo.applyEvent(routingKey, messageId, payload);
          }
        );
        connected = true;
        console.log('[stats-service] Connected to RabbitMQ');
      } catch (error) {
        retries--;
        console.error(`[stats-service] Failed to connect to RabbitMQ, retries left: ${retries}`, error.message);
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2s avant retry
        } else {
          console.error('[stats-service] Could not connect to RabbitMQ after retries. Service will continue but stats won\'t be updated from events.');
        }
      }
    }
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
