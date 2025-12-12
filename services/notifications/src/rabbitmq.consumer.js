const amqp = require('amqplib');
const EmailService = require('./email.service');
const templates = require('./templates');

class RabbitMQConsumer {
  constructor() {
    this.emailService = new EmailService();
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672');
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange('eventflow.events', 'topic', { durable: true });
      const queue = await this.channel.assertQueue('notifications.queue', { durable: true });
      
      const events = ['ticket.booked', 'payment.processed', 'payment.failed', 'event.cancelled'];
      for (const event of events) {
        await this.channel.bindQueue(queue.queue, 'eventflow.events', event);
      }
      
      this.consume();
    } catch (error) {
      console.error('RabbitMQ connection failed:', error.message);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async consume() {
    await this.channel.consume('notifications.queue', async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await this.handleMessage(content);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Message processing error:', error.message);
          this.channel.nack(msg, false, false);
        }
      }
    });
  }

  async handleMessage(message) {
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

  async handleTicketBooked(data) {
    const template = templates.ticketBooked(data);
    await this.emailService.sendEmail(data.userEmail, template.subject, template.html);
  }

  async handlePaymentProcessed(data) {
    const template = templates.paymentSuccess(data);
    await this.emailService.sendEmail(data.userEmail, template.subject, template.html);
  }

  async handlePaymentFailed(data) {
    const template = templates.paymentFailed(data);
    await this.emailService.sendEmail(data.userEmail, template.subject, template.html);
  }

  async handleEventCancelled(data) {
    const template = templates.eventCancelled(data);
    await this.emailService.sendEmail(data.userEmail, template.subject, template.html);
  }
}

module.exports = RabbitMQConsumer;