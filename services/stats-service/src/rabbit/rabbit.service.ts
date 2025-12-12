// @ts-nocheck
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { Connection, Channel, ConsumeMessage } from 'amqplib';

const EXCHANGE = 'events';
const EXCHANGE_TYPE = 'topic';

@Injectable()
export class RabbitService implements OnModuleDestroy {
  private connection?: Connection;
  private channel?: Channel;

  private readonly url = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';

  async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;

    this.connection = await amqp.connect(this.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
    this.channel.prefetch(10);
    return this.channel;
  }

  /**
   * Publie un événement sur l'exchange
   * @param routingKey Ex: 'event.created', 'ticket.booked', 'payment.processed'
   * @param payload Données de l'événement (doit contenir un messageId unique)
   */
  async publish(routingKey: string, payload: any): Promise<void> {
    const channel = await this.getChannel();
    const messageId = payload?.messageId || `msg-${Date.now()}-${Math.random()}`;
    const content = Buffer.from(JSON.stringify({ ...payload, messageId }));

    channel.publish(EXCHANGE, routingKey, content, {
      contentType: 'application/json',
      messageId,
      timestamp: Date.now(),
      persistent: true,
    });
  }

  /**
   * Consomme des événements depuis une queue
   * @param queue Nom de la queue (ex: 'stats-service', 'notifications-service')
   * @param bindings Routing keys à écouter (ex: ['event.*', 'ticket.*'])
   * @param handler Fonction appelée pour chaque message
   */
  async consume(
    queue: string,
    bindings: string[],
    handler: (routingKey: string, messageId: string | undefined, payload: any, raw: ConsumeMessage) => Promise<void>
  ) {
    const channel = await this.getChannel();
    await channel.assertQueue(queue, { durable: true });
    for (const key of bindings) {
      await channel.bindQueue(queue, EXCHANGE, key);
    }

    await channel.consume(
      queue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;
        const routingKey = msg.fields.routingKey;
        const messageId = msg.properties.messageId;
        try {
          const payload = JSON.parse(msg.content.toString());
          await handler(routingKey, messageId, payload, msg);
          channel.ack(msg);
        } catch (err) {
          console.error(`[rabbit-service] handler failed for ${routingKey}`, err);
          channel.nack(msg, false, false); // dead-letter
        }
      },
      { noAck: false }
    );
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (err) {
      console.error('[stats-service] rabbit close error', err);
    } finally {
      this.channel = undefined;
      this.connection = undefined;
    }
  }
}

