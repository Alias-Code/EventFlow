import { PaymentService } from './payment.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentMethodDto } from './dto';

// Types mockés pour les tests (sans dépendance au client Prisma généré)
enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

enum PaymentMethod {
  CARD = 'CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  FREE = 'FREE',
}

interface Payment {
  id: string;
  ticketId: string;
  userId: string;
  eventId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string | null;
  failureReason: string | null;
  refundedAt: Date | null;
  refundReason: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}

// Mock des dépendances
const mockPrismaService = {
  payment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  processedEvent: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockRabbitService = {
  publish: jest.fn(),
  consume: jest.fn(),
};

describe('PaymentService', () => {
  let service: PaymentService;

  const mockPayment: Payment = {
    id: 'payment-123',
    ticketId: 'ticket-456',
    userId: 'user-789',
    eventId: 'event-101',
    amount: 50.0,
    currency: 'EUR',
    status: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.CARD,
    transactionId: null,
    failureReason: null,
    refundedAt: null,
    refundReason: null,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentService(
      mockPrismaService as any,
      mockRabbitService as any,
    );
  });

  describe('createPayment', () => {
    it('should create a pending payment for non-free payments', async () => {
      const dto = {
        ticketId: 'ticket-456',
        eventId: 'event-101',
        amount: 50.0,
        currency: 'EUR',
        paymentMethod: PaymentMethodDto.CARD,
      };
      const userId = 'user-789';

      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      const result = await service.createPayment(userId, dto);

      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: {
          ticketId: dto.ticketId,
          userId,
          eventId: dto.eventId,
          amount: dto.amount,
          currency: 'EUR',
          paymentMethod: PaymentMethod.CARD,
          status: PaymentStatus.PENDING,
          metadata: undefined,
        },
      });
      expect(result).toEqual(mockPayment);
    });

    it('should create a completed payment for free events (amount = 0)', async () => {
      const dto = {
        ticketId: 'ticket-456',
        eventId: 'event-101',
        amount: 0,
        paymentMethod: PaymentMethodDto.FREE,
      };
      const userId = 'user-789';

      const freePayment: Payment = {
        ...mockPayment,
        amount: 0,
        status: PaymentStatus.COMPLETED,
        paymentMethod: PaymentMethod.FREE,
        transactionId: 'free-123',
      };

      mockPrismaService.payment.create.mockResolvedValue(freePayment);
      mockRabbitService.publish.mockResolvedValue(undefined);

      const result = await service.createPayment(userId, dto);

      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 0,
          paymentMethod: PaymentMethod.FREE,
          status: PaymentStatus.COMPLETED,
        }),
      });
      expect(mockRabbitService.publish).toHaveBeenCalledWith(
        'payment.processed',
        expect.objectContaining({
          paymentId: freePayment.id,
          amount: 0,
        }),
      );
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should create a completed payment when paymentMethod is FREE', async () => {
      const dto = {
        ticketId: 'ticket-456',
        eventId: 'event-101',
        amount: 100, // montant ignoré car FREE
        paymentMethod: PaymentMethodDto.FREE,
      };
      const userId = 'user-789';

      const freePayment: Payment = {
        ...mockPayment,
        amount: 0,
        status: PaymentStatus.COMPLETED,
        paymentMethod: PaymentMethod.FREE,
      };

      mockPrismaService.payment.create.mockResolvedValue(freePayment);
      mockRabbitService.publish.mockResolvedValue(undefined);

      await service.createPayment(userId, dto);

      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 0,
          paymentMethod: PaymentMethod.FREE,
          status: PaymentStatus.COMPLETED,
        }),
      });
    });
  });

  describe('processPayment', () => {
    it('should process a pending payment successfully', async () => {
      const dto = { transactionId: 'txn-123' };
      const completedPayment: Payment = {
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
        transactionId: dto.transactionId,
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.payment.update
        .mockResolvedValueOnce({ ...mockPayment, status: PaymentStatus.PROCESSING })
        .mockResolvedValueOnce(completedPayment);
      mockRabbitService.publish.mockResolvedValue(undefined);

      // Mock simulatePaymentProcessing to always succeed
      jest.spyOn(service as any, 'simulatePaymentProcessing').mockResolvedValue(true);

      const result = await service.processPayment(mockPayment.id, dto);

      expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayment.id },
      });
      expect(mockPrismaService.payment.update).toHaveBeenCalledTimes(2);
      expect(mockRabbitService.publish).toHaveBeenCalledWith(
        'payment.processed',
        expect.objectContaining({
          paymentId: completedPayment.id,
          transactionId: dto.transactionId,
        }),
      );
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should mark payment as failed when processing fails', async () => {
      const dto = { transactionId: 'txn-123' };
      const failedPayment: Payment = {
        ...mockPayment,
        status: PaymentStatus.FAILED,
        failureReason: 'Payment processing failed',
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.payment.update
        .mockResolvedValueOnce({ ...mockPayment, status: PaymentStatus.PROCESSING })
        .mockResolvedValueOnce(failedPayment);
      mockRabbitService.publish.mockResolvedValue(undefined);

      jest.spyOn(service as any, 'simulatePaymentProcessing').mockResolvedValue(false);

      const result = await service.processPayment(mockPayment.id, dto);

      expect(mockRabbitService.publish).toHaveBeenCalledWith(
        'payment.failed',
        expect.objectContaining({
          paymentId: failedPayment.id,
          failureReason: 'Payment processing failed',
        }),
      );
      expect(result.status).toBe(PaymentStatus.FAILED);
    });

    it('should throw NotFoundException when payment does not exist', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.processPayment('non-existent', { transactionId: 'txn-123' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when payment is not pending', async () => {
      const completedPayment: Payment = { ...mockPayment, status: PaymentStatus.COMPLETED };
      mockPrismaService.payment.findUnique.mockResolvedValue(completedPayment);

      await expect(
        service.processPayment(completedPayment.id, { transactionId: 'txn-123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refundPayment', () => {
    it('should refund a completed payment', async () => {
      const completedPayment: Payment = { ...mockPayment, status: PaymentStatus.COMPLETED };
      const refundedPayment: Payment = {
        ...completedPayment,
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
        refundReason: 'Customer request',
      };
      const dto = { reason: 'Customer request' };

      mockPrismaService.payment.findUnique.mockResolvedValue(completedPayment);
      mockPrismaService.payment.update.mockResolvedValue(refundedPayment);
      mockRabbitService.publish.mockResolvedValue(undefined);

      const result = await service.refundPayment(completedPayment.id, dto);

      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: completedPayment.id },
        data: {
          status: PaymentStatus.REFUNDED,
          refundedAt: expect.any(Date),
          refundReason: dto.reason,
        },
      });
      expect(mockRabbitService.publish).toHaveBeenCalledWith(
        'payment.refunded',
        expect.objectContaining({
          paymentId: refundedPayment.id,
          reason: dto.reason,
        }),
      );
      expect(result.status).toBe(PaymentStatus.REFUNDED);
    });

    it('should throw NotFoundException when payment does not exist', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.refundPayment('non-existent', { reason: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when payment is not completed', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment); // PENDING

      await expect(
        service.refundPayment(mockPayment.id, { reason: 'Test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentById', () => {
    it('should return a payment by id', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.getPaymentById(mockPayment.id);

      expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayment.id },
      });
      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException when payment does not exist', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(service.getPaymentById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPaymentsByUser', () => {
    it('should return all payments for a user', async () => {
      const payments = [mockPayment, { ...mockPayment, id: 'payment-456' }];
      mockPrismaService.payment.findMany.mockResolvedValue(payments);

      const result = await service.getPaymentsByUser('user-789');

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-789' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('getPaymentsByTicket', () => {
    it('should return all payments for a ticket', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([mockPayment]);

      const result = await service.getPaymentsByTicket('ticket-456');

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith({
        where: { ticketId: 'ticket-456' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getPaymentsByEvent', () => {
    it('should return all payments for an event', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([mockPayment]);

      const result = await service.getPaymentsByEvent('event-101');

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith({
        where: { eventId: 'event-101' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getAllPayments', () => {
    it('should return paginated payments', async () => {
      const payments = [mockPayment];
      mockPrismaService.payment.findMany.mockResolvedValue(payments);

      const result = await service.getAllPayments(50, 10);

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith({
        take: 50,
        skip: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(payments);
    });

    it('should use default values for limit and offset', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);

      await service.getAllPayments();

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith({
        take: 100,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('handleEvent (event handlers)', () => {
    describe('handleTicketBooked', () => {
      it('should create a pending payment when ticket is booked', async () => {
        const payload = {
          ticketId: 'ticket-new',
          userId: 'user-new',
          eventId: 'event-new',
          amount: 25.0,
          paymentMethod: 'CARD',
        };

        mockPrismaService.processedEvent.findUnique.mockResolvedValue(null);
        mockPrismaService.processedEvent.create.mockResolvedValue({ id: 'msg-1' });
        mockPrismaService.payment.create.mockResolvedValue({
          ...mockPayment,
          ...payload,
          status: PaymentStatus.PENDING,
        });

        await (service as any).handleEvent('ticket.booked', 'msg-1', payload);

        expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
          data: {
            ticketId: payload.ticketId,
            userId: payload.userId,
            eventId: payload.eventId,
            amount: payload.amount,
            paymentMethod: PaymentMethod.CARD,
            status: PaymentStatus.PENDING,
          },
        });
      });

      it('should skip processing if event was already processed', async () => {
        mockPrismaService.processedEvent.findUnique.mockResolvedValue({ id: 'msg-1' });

        await (service as any).handleEvent('ticket.booked', 'msg-1', {});

        expect(mockPrismaService.payment.create).not.toHaveBeenCalled();
      });

      it('should not create payment for invalid payload', async () => {
        mockPrismaService.processedEvent.findUnique.mockResolvedValue(null);
        mockPrismaService.processedEvent.create.mockResolvedValue({ id: 'msg-1' });

        await (service as any).handleEvent('ticket.booked', 'msg-1', {
          ticketId: 'ticket-1',
          // missing userId and eventId
        });

        expect(mockPrismaService.payment.create).not.toHaveBeenCalled();
      });
    });

    describe('handleTicketCancelled', () => {
      it('should refund a completed payment when ticket is cancelled', async () => {
        const completedPayment: Payment = { ...mockPayment, status: PaymentStatus.COMPLETED };
        const refundedPayment: Payment = { ...completedPayment, status: PaymentStatus.REFUNDED };

        mockPrismaService.processedEvent.findUnique.mockResolvedValue(null);
        mockPrismaService.processedEvent.create.mockResolvedValue({ id: 'msg-1' });
        mockPrismaService.payment.findFirst.mockResolvedValue(completedPayment);
        mockPrismaService.payment.findUnique.mockResolvedValue(completedPayment);
        mockPrismaService.payment.update.mockResolvedValue(refundedPayment);
        mockRabbitService.publish.mockResolvedValue(undefined);

        await (service as any).handleEvent('ticket.cancelled', 'msg-1', {
          ticketId: mockPayment.ticketId,
        });

        expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
          where: { id: completedPayment.id },
          data: expect.objectContaining({
            status: PaymentStatus.REFUNDED,
            refundReason: 'Ticket cancelled by user',
          }),
        });
      });

      it('should cancel a pending payment when ticket is cancelled', async () => {
        mockPrismaService.processedEvent.findUnique.mockResolvedValue(null);
        mockPrismaService.processedEvent.create.mockResolvedValue({ id: 'msg-1' });
        mockPrismaService.payment.findFirst.mockResolvedValue(mockPayment); // PENDING

        await (service as any).handleEvent('ticket.cancelled', 'msg-1', {
          ticketId: mockPayment.ticketId,
        });

        expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
          where: { id: mockPayment.id },
          data: { status: PaymentStatus.CANCELLED },
        });
      });
    });

    describe('handleEventCancelled', () => {
      it('should refund all completed payments when event is cancelled', async () => {
        const completedPayments: Payment[] = [
          { ...mockPayment, id: 'p1', status: PaymentStatus.COMPLETED },
          { ...mockPayment, id: 'p2', status: PaymentStatus.COMPLETED },
        ];

        mockPrismaService.processedEvent.findUnique.mockResolvedValue(null);
        mockPrismaService.processedEvent.create.mockResolvedValue({ id: 'msg-1' });
        mockPrismaService.payment.findMany.mockResolvedValue(completedPayments);
        mockPrismaService.payment.findUnique
          .mockResolvedValueOnce(completedPayments[0])
          .mockResolvedValueOnce(completedPayments[1]);
        mockPrismaService.payment.update.mockResolvedValue({
          ...mockPayment,
          status: PaymentStatus.REFUNDED,
        });
        mockRabbitService.publish.mockResolvedValue(undefined);

        await (service as any).handleEvent('event.cancelled', 'msg-1', {
          eventId: mockPayment.eventId,
        });

        expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith({
          where: {
            eventId: mockPayment.eventId,
            status: PaymentStatus.COMPLETED,
          },
        });
        expect(mockPrismaService.payment.update).toHaveBeenCalledTimes(2);
      });
    });
  });
});
