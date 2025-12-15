import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController, HealthController } from './payment.controller';
import { RabbitService } from '../rabbit/rabbit.service';

@Module({
  controllers: [HealthController, PaymentController],
  providers: [PaymentService, RabbitService],
  exports: [PaymentService],
})
export class PaymentModule {}
