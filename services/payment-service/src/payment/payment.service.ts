import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitService } from '../rabbit/rabbit.service';
import { CreatePaymentDto, RefundPaymentDto, ProcessPaymentDto } from './dto';
import { PaymentStatus, PaymentMethod, Payment } from '../../../prisma/generated/payments';

@Injectable()
export class PaymentService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbit: RabbitService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initializeRabbitConsumer();
  }

  private async initializeRabbitConsumer(): Promise<void> {
    let retries = 5;
    let connected = false;

    while (retries > 0 && !connected) {
      try {
        await this.rabbit.consume(
          'payment-service',
          ['ticket.booked', 'ticket.cancelled', 'event.cancelled'],
          async (routingKey, messageId, payload) => {
            await this.handleEvent(routingKey, messageId, payload);
          }
        );
        connected = true;
        console.log('[payment-service] Connected to RabbitMQ');
      } catch (error) {
        retries--;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[payment-service] Failed to connect to RabbitMQ, retries left: ${retries}`, errorMessage);
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error('[payment-service] Could not connect to RabbitMQ after retries.');
        }
      }
    }
  }

  private async handleEvent(routingKey: string, messageId: string | undefined, payload: Record<string, unknown>): Promise<void> {
    // Vérifier si l'événement a déjà été traité (idempotence)
    if (messageId) {
      const exists = await this.prisma.processedEvent.findUnique({ where: { id: messageId } });
      if (exists) {
        console.log(`[payment-service] Event ${messageId} already processed, skipping`);
        return;
      }
    }

    console.log(`[payment-service] Processing event: ${routingKey}`, payload);

    switch (routingKey) {
      case 'ticket.booked':
        await this.handleTicketBooked(payload);
        break;
      case 'ticket.cancelled':
        await this.handleTicketCancelled(payload);
        break;
      case 'event.cancelled':
        await this.handleEventCancelled(payload);
        break;
    }

    // Marquer l'événement comme traité
    if (messageId) {
      await this.prisma.processedEvent.create({ data: { id: messageId } });
    }
  }

  private async handleTicketBooked(payload: Record<string, unknown>): Promise<void> {
    const { ticketId, userId, eventId, amount, paymentMethod } = payload;

    if (!ticketId || !userId || !eventId) {
      console.error('[payment-service] Invalid ticket.booked payload', payload);
      return;
    }

    // Créer un paiement en attente pour ce ticket
    const payment = await this.prisma.payment.create({
      data: {
        ticketId: ticketId as string,
        userId: userId as string,
        eventId: eventId as string,
        amount: (amount as number) || 0,
        paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.CARD,
        status: PaymentStatus.PENDING,
      },
    });

    console.log(`[payment-service] Created pending payment ${payment.id} for ticket ${ticketId}`);
  }

  private async handleTicketCancelled(payload: Record<string, unknown>): Promise<void> {
    const { ticketId } = payload;

    if (!ticketId) {
      console.error('[payment-service] Invalid ticket.cancelled payload', payload);
      return;
    }

    const payment = await this.prisma.payment.findFirst({
      where: { ticketId: ticketId as string },
    });

    if (!payment) {
      console.log(`[payment-service] No payment found for cancelled ticket ${ticketId}`);
      return;
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      // Rembourser le paiement
      await this.refundPayment(payment.id, { reason: 'Ticket cancelled by user' });
    } else if (payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.PROCESSING) {
      // Annuler le paiement en attente
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.CANCELLED },
      });
      console.log(`[payment-service] Cancelled pending payment ${payment.id}`);
    }
  }

  private async handleEventCancelled(payload: Record<string, unknown>): Promise<void> {
    const { eventId } = payload;

    if (!eventId) {
      console.error('[payment-service] Invalid event.cancelled payload', payload);
      return;
    }

    // Trouver tous les paiements pour cet événement
    const payments = await this.prisma.payment.findMany({
      where: {
        eventId: eventId as string,
        status: PaymentStatus.COMPLETED,
      },
    });

    // Rembourser tous les paiements
    for (const payment of payments) {
      await this.refundPayment(payment.id, { reason: 'Event cancelled by organizer' });
    }

    console.log(`[payment-service] Refunded ${payments.length} payments for cancelled event ${eventId}`);
  }

  async createPayment(userId: string, dto: CreatePaymentDto): Promise<Payment> {
    // Si le montant est 0, traiter comme gratuit
    if (dto.amount === 0 || dto.paymentMethod === 'FREE') {
      const payment = await this.prisma.payment.create({
        data: {
          ticketId: dto.ticketId,
          userId,
          eventId: dto.eventId,
          amount: 0,
          currency: dto.currency || 'EUR',
          paymentMethod: PaymentMethod.FREE,
          status: PaymentStatus.COMPLETED,
          transactionId: `free-${Date.now()}`,
          metadata: dto.metadata,
        },
      });

      await this.publishPaymentProcessed(payment);
      return payment;
    }

    const payment = await this.prisma.payment.create({
      data: {
        ticketId: dto.ticketId,
        userId,
        eventId: dto.eventId,
        amount: dto.amount,
        currency: dto.currency || 'EUR',
        paymentMethod: dto.paymentMethod as PaymentMethod,
        status: PaymentStatus.PENDING,
        metadata: dto.metadata,
      },
    });

    console.log(`[payment-service] Created payment ${payment.id}`);
    return payment;
  }

  async processPayment(paymentId: string, dto: ProcessPaymentDto): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Payment ${paymentId} cannot be processed (status: ${payment.status})`);
    }

    // Mettre à jour en PROCESSING
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.PROCESSING },
    });

    // Simuler le traitement du paiement (en prod, appeler Stripe/PayPal)
    const success = await this.simulatePaymentProcessing(payment);

    if (success) {
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: dto.transactionId,
          metadata: dto.processorMetadata ? { ...(payment.metadata as object || {}), processor: dto.processorMetadata } : payment.metadata,
        },
      });

      await this.publishPaymentProcessed(updatedPayment);
      return updatedPayment;
    } else {
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: 'Payment processing failed',
        },
      });

      await this.publishPaymentFailed(updatedPayment);
      return updatedPayment;
    }
  }

  async refundPayment(paymentId: string, dto: RefundPaymentDto): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(`Payment ${paymentId} cannot be refunded (status: ${payment.status})`);
    }

    // Simuler le remboursement (en prod, appeler Stripe/PayPal)
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
        refundReason: dto.reason,
      },
    });

    await this.rabbit.publish('payment.refunded', {
      paymentId: updatedPayment.id,
      ticketId: updatedPayment.ticketId,
      userId: updatedPayment.userId,
      eventId: updatedPayment.eventId,
      amount: updatedPayment.amount,
      reason: dto.reason,
      refundedAt: updatedPayment.refundedAt?.toISOString(),
    });

    console.log(`[payment-service] Refunded payment ${paymentId}`);
    return updatedPayment;
  }

  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    return payment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentsByTicket(ticketId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentsByEvent(eventId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllPayments(limit = 100, offset = 0): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async simulatePaymentProcessing(_payment: Payment): Promise<boolean> {
    // Simulation: 95% de succès
    await new Promise(resolve => setTimeout(resolve, 100));
    return Math.random() > 0.05;
  }

  private async publishPaymentProcessed(payment: Payment): Promise<void> {
    await this.rabbit.publish('payment.processed', {
      paymentId: payment.id,
      ticketId: payment.ticketId,
      userId: payment.userId,
      eventId: payment.eventId,
      amount: payment.amount,
      currency: payment.currency,
      transactionId: payment.transactionId,
      processedAt: new Date().toISOString(),
    });

    console.log(`[payment-service] Published payment.processed for ${payment.id}`);
  }

  private async publishPaymentFailed(payment: Payment): Promise<void> {
    await this.rabbit.publish('payment.failed', {
      paymentId: payment.id,
      ticketId: payment.ticketId,
      userId: payment.userId,
      eventId: payment.eventId,
      amount: payment.amount,
      failureReason: payment.failureReason,
      failedAt: new Date().toISOString(),
    });

    console.log(`[payment-service] Published payment.failed for ${payment.id}`);
  }
}
