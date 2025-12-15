// Mock du PrismaService pour les tests

export class PrismaService {
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

  $connect = jest.fn().mockResolvedValue(undefined);
  $disconnect = jest.fn().mockResolvedValue(undefined);
  onModuleInit = jest.fn().mockResolvedValue(undefined);
  onModuleDestroy = jest.fn().mockResolvedValue(undefined);
}
