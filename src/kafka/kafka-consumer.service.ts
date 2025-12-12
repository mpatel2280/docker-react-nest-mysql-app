import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private isConnected = false;

  constructor(private readonly activityLogService: ActivityLogService) {
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9093'];
    this.logger.log(`Initializing Kafka consumer with brokers: ${brokers.join(', ')}`);
    
    this.kafka = new Kafka({
      clientId: 'nestjs-backend',
      brokers,
      retry: {
        retries: 5,
        initialRetryTime: 300,
      },
    });

    this.consumer = this.kafka.consumer({ 
      groupId: 'activity-log-consumer-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      this.isConnected = true;
      this.logger.log('Kafka consumer connected successfully');

      await this.consumer.subscribe({ 
        topic: 'user-activity', 
        fromBeginning: false 
      });

      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.handleMessage(payload);
        },
      });

      this.logger.log('Kafka consumer subscribed to user-activity topic');
    } catch (error) {
      this.logger.error('Failed to connect Kafka consumer', error);
      // Don't throw error to allow app to start even if Kafka is down
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.consumer.disconnect();
      this.logger.log('Kafka consumer disconnected');
    }
  }

  private async handleMessage(payload: EachMessagePayload) {
    const { topic, partition, message } = payload;
    
    try {
      const value = message.value?.toString();
      if (!value) {
        this.logger.warn('Received empty message');
        return;
      }

      const activity = JSON.parse(value);
      
      this.logger.debug(
        `Processing message from topic ${topic}, partition ${partition}: ${activity.action} ${activity.entity}`,
      );

      // Save to MongoDB
      await this.activityLogService.create(activity);
      
      this.logger.log(
        `Activity logged to MongoDB: ${activity.action} ${activity.entity} by user ${activity.userEmail}`,
      );
    } catch (error) {
      this.logger.error('Failed to process message', error);
      // Don't throw error to avoid stopping the consumer
    }
  }
}

