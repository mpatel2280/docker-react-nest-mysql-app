import { Module } from '@nestjs/common';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumerService } from './kafka-consumer.service';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [ActivityLogModule],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}

