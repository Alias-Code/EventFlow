// Mock du RabbitService pour les tests

export class RabbitService {
  publish = jest.fn().mockResolvedValue(undefined);
  consume = jest.fn().mockResolvedValue(undefined);
  getChannel = jest.fn().mockResolvedValue({
    assertExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    publish: jest.fn(),
    consume: jest.fn(),
    ack: jest.fn(),
    nack: jest.fn(),
    prefetch: jest.fn(),
  });
  onModuleDestroy = jest.fn().mockResolvedValue(undefined);
}
