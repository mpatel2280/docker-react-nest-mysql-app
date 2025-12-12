import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducerService } from '../kafka/kafka-producer.service';

@Injectable()
export class AuthActivityService {
  private readonly logger = new Logger(AuthActivityService.name);

  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async logLogin(
    userId: number,
    userEmail: string,
    userName: string | undefined,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const activity = {
        userId,
        userEmail,
        userName,
        action: 'LOGIN',
        entity: 'AUTH',
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString(),
      };

      await this.kafkaProducer.sendUserActivity(activity);

      this.logger.log(`Login activity sent to Kafka: ${userEmail}`);
    } catch (error) {
      this.logger.error('Failed to log login activity', error);
      // Don't throw error to avoid breaking the login operation
    }
  }
}

