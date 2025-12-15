import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection: any = null;
  private channel: any = null;
  private readonly exchangeName = 'events';

  async onModuleInit() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Declare exchange
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      
      console.log('✅ RabbitMQ connected and exchange declared');
    } catch (error) {
      console.error('❌ RabbitMQ connection failed:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  async publish(routingKey: string, message: any) {
    try {
      if (!this.channel) {
        console.error('❌ RabbitMQ channel not available');
        return;
      }

      const messageBuffer = Buffer.from(JSON.stringify(message));
      this.channel.publish(this.exchangeName, routingKey, messageBuffer, {
        persistent: true,
        contentType: 'application/json',
      });

      console.log(`📤 Event published: ${routingKey}`, message);
    } catch (error) {
      console.error('❌ Error publishing message:', error.message);
    }
  }

  // Helper methods for specific events
  async publishEventCreated(event: any) {
    await this.publish('event.created', {
      eventType: 'EventCreatedEvent',
      timestamp: new Date().toISOString(),
      data: event,
    });
  }

  async publishEventUpdated(event: any) {
    await this.publish('event.updated', {
      eventType: 'EventUpdatedEvent',
      timestamp: new Date().toISOString(),
      data: event,
    });
  }

  async publishEventCancelled(event: any) {
    await this.publish('event.cancelled', {
      eventType: 'EventCancelledEvent',
      timestamp: new Date().toISOString(),
      data: event,
    });
  }
}
