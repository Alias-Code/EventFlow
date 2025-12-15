import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

prisma.$connect().catch((err: any) => {
  console.error('Failed to connect to Prisma:', err);
  process.exit(1);
});
