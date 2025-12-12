import { Module } from '@nestjs/common';
import { StatsController, StatsRoutesController } from '../stats/stats.controller';
import { StatsService } from '../stats/stats.service';
import { RabbitService } from '../rabbit/rabbit.service';

@Module({
  controllers: [StatsController, StatsRoutesController],
  providers: [StatsService, RabbitService],
})
export class AppModule {}
