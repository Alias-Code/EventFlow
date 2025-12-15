// Mock des types Prisma pour les tests

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  FREE = 'FREE',
}

export interface Payment {
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

export interface ProcessedEvent {
  id: string;
  createdAt: Date;
}

export class PrismaClient {
  payment = {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  processedEvent = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };

  $connect = jest.fn();
  $disconnect = jest.fn();
}
