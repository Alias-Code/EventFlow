import amqp from 'amqplib';
import type { Connection, Channel, Message } from 'amqplib';
import EmailService from './email.service.js';
import templates, { TicketBookedData, PaymentData, EventCancelledData } from './templates.js';

interface EventMessage {
  type: string;
  payload: any;
}

class RabbitMQConsumer {
  private emailService: EmailService;
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  constructor() {
    this.emailService = new EmailService();
  }

  async connect(): Promise<void> {
    try {
      const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672');
      this.connection = conn as unknown as Connection;
      const channel = await (this.connection as any).createChannel();
      this.channel = channel;
      
      if (!this.channel) throw new Error('Failed to create channel');
      
      await this.channel.assertExchange('eventflow.events', 'topic', { durable: true });
      const queue = await this.channel.assertQueue('notifications.queue', { durable: true });
      
      const events = ['ticket.booked', 'payment.processed', 'payment.failed', 'event.cancelled'];
      for (const event of events) {
        await this.channel.bindQueue(queue.queue, 'eventflow.events', event);
      }
      
      this.consume();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('RabbitMQ connection failed:', errorMessage);
      setTimeout(() => this.connect(), 5000);
    }
  }

  private async consume(): Promise<void> {
    if (!this.channel) return;

    await this.channel.consume('notifications.queue', async (msg: Message | null) => {
      if (msg) {
        try {
          const content: EventMessage = JSON.parse(msg.content.toString());
          await this.handleMessage(content);
          this.channel!.ack(msg);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('Message processing error:', errorMessage);
          this.channel!.nack(msg, false, false);
        }
      }
    });
  }

  private async handleMessage(message: EventMessage): Promise<void> {
    const { type, payload } = message;
    
    switch(type) {
      case 'ticket.booked':
        await this.handleTicketBooked(payload);
        break;
      case 'payment.processed':
        await this.handlePaymentProcessed(payload);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(payload);
        break;
      case 'event.cancelled':
        await this.handleEventCancelled(payload);
        break;
      default:
        console.log(`Unknown event type: ${type}`);
    }
  }

  private async handleTicketBooked(data: TicketBookedData): Promise<void> {
    const template = templates.ticketBooked(data);
    await this.emailService.sendEmail(data.userEmail, template.subject, template.html);
  }

  private async handlePaymentProcessed(data: PaymentData): Promise<void> {
    const template = templates.paymentSuccess(data);
    await this.emailService.sendEmail(data.userEmail, template.subject, template.html);
  }

  private async handlePaymentFailed(data: PaymentData): Promise<void> {
    const template = templates.paymentFailed(data);
    await this.emailService.sendEmail(data.userEmail, template.subject, template.html);
  }

  private async handleEventCancelled(data: EventCancelledData): Promise<void> {
    const template = templates.eventCancelled(data);
    await this.emailService.sendEmail(data.userEmail, template.subject, template.html);
  }
}

export default RabbitMQConsumer;
