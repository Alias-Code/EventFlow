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
      
      // Créer l'exchange
      await this.channel.assertExchange('eventflow.events', 'topic', { durable: true });
      
      // Créer la queue
      const queue = await this.channel.assertQueue('notifications.queue', { durable: true });
      
      // Bind les événements
      const events = [
        'ticket.booked',
        'payment.processed',
        'payment.failed',
        'event.cancelled'
      ];
      
      for (const event of events) {
        await this.channel.bindQueue(queue.queue, 'eventflow.events', event);
      }
      
      console.log('✅ RabbitMQ connected and listening');
      
      // Commencer à consommer
      this.consume();
    } catch (error) {
      console.error('❌ RabbitMQ connection failed:', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async consume() {
    await this.channel.consume('notifications.queue', async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`📨 Received event: ${content.type}`);
          
          await this.handleMessage(content);
          
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
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
    console.log('📧 Sending ticket confirmation to:', data.userEmail);
    const template = templates.ticketBooked(data);
    await this.emailService.sendEmail(
      data.userEmail,
      template.subject,
      template.html
    );
  }

  async handlePaymentProcessed(data) {
    console.log('📧 Sending payment confirmation to:', data.userEmail);
    const template = templates.paymentSuccess(data);
    await this.emailService.sendEmail(
      data.userEmail,
      template.subject,
      template.html
    );
  }

  async handlePaymentFailed(data) {
    console.log('📧 Sending payment failure notice to:', data.userEmail);
    const template = templates.paymentFailed(data);
    await this.emailService.sendEmail(
      data.userEmail,
      template.subject,
      template.html
    );
  }

  async handleEventCancelled(data) {
    console.log('📧 Sending cancellation notice to:', data.userEmail);
    const template = templates.eventCancelled(data);
    await this.emailService.sendEmail(
      data.userEmail,
      template.subject,
      template.html
    );
  }
}

module.exports = RabbitMQConsumer;