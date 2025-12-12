// @ts-ignore - client is generated at build time
import { PrismaClient } from '../../../../prisma/generated/stats';

export type StatsSnapshot = {
  events: { total: number; created: number; updated: number; cancelled: number };
  tickets: { booked: number; cancelled: number; amount: number };
  payments: { processed: number; failed: number; revenue: number };
  generatedAt: string;
};

function asNumber(value: any): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getIncrements(routingKey: string, payload: any) {
  switch (routingKey) {
    case 'event.created':
      return { eventsTotal: 1, eventsCreated: 1 };
    case 'event.updated':
      return { eventsUpdated: 1 };
    case 'event.cancelled':
      return { eventsCancelled: 1 };
    case 'ticket.booked':
      return { ticketsBooked: 1, ticketsAmount: asNumber(payload?.price) };
    case 'ticket.cancelled':
      return { ticketsCancelled: 1 };
    case 'payment.processed':
      return { paymentsProcessed: 1, paymentsRevenue: asNumber(payload?.amount) };
    case 'payment.failed':
      return { paymentsFailed: 1 };
    default:
      return null;
  }
}

export class StatsRepository {
  private prisma: PrismaClient;

  constructor(databaseUrl?: string) {
    this.prisma = new PrismaClient(
      databaseUrl
        ? ({ datasources: { statsDb: { url: databaseUrl } } } as any)
        : undefined
    );
  }

  async applyEvent(routingKey: string, messageId: string | undefined, payload: any) {
    const increments = getIncrements(routingKey, payload);
    if (!increments) return;

    await this.prisma.$transaction(async (tx) => {
      if (messageId) {
        const exists = await tx.ingestedMessage.findUnique({ where: { messageId } });
        if (exists) return;
        await tx.ingestedMessage.create({
          data: { messageId, routingKey, payload },
        });
      }

      const createData = {
        id: 1,
        eventsTotal: increments.eventsTotal ?? 0,
        eventsCreated: increments.eventsCreated ?? 0,
        eventsUpdated: increments.eventsUpdated ?? 0,
        eventsCancelled: increments.eventsCancelled ?? 0,
        ticketsBooked: increments.ticketsBooked ?? 0,
        ticketsCancelled: increments.ticketsCancelled ?? 0,
        ticketsAmount: increments.ticketsAmount ?? 0,
        paymentsProcessed: increments.paymentsProcessed ?? 0,
        paymentsFailed: increments.paymentsFailed ?? 0,
        paymentsRevenue: increments.paymentsRevenue ?? 0,
      };

      const updateData: any = {};
      for (const [k, v] of Object.entries(increments)) {
        updateData[k] = { increment: v };
      }

      await tx.aggregates.upsert({
        where: { id: 1 },
        create: createData,
        update: updateData,
      });
    });
  }

  async getStats(): Promise<StatsSnapshot> {
    const agg = await this.prisma.aggregates.findUnique({ where: { id: 1 } });
    if (!agg) {
      return {
        events: { total: 0, created: 0, updated: 0, cancelled: 0 },
        tickets: { booked: 0, cancelled: 0, amount: 0 },
        payments: { processed: 0, failed: 0, revenue: 0 },
        generatedAt: new Date().toISOString(),
      };
    }

    return {
      events: {
        total: agg.eventsTotal,
        created: agg.eventsCreated,
        updated: agg.eventsUpdated,
        cancelled: agg.eventsCancelled,
      },
      tickets: {
        booked: agg.ticketsBooked,
        cancelled: agg.ticketsCancelled,
        amount: agg.ticketsAmount,
      },
      payments: {
        processed: agg.paymentsProcessed,
        failed: agg.paymentsFailed,
        revenue: agg.paymentsRevenue,
      },
      generatedAt: agg.updatedAt.toISOString(),
    };
  }
}

