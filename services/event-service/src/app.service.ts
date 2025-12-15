import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'OK',
      service: 'event-service',
      timestamp: new Date().toISOString(),
    };
  }
}
