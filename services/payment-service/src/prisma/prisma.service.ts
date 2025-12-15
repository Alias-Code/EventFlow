import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../../../prisma/generated/payments';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('[payment-service] Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
