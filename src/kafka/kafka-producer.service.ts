import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private isConnected = false;

  constructor() {
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9093'];
    this.logger.log(`Initializing Kafka producer with brokers: ${brokers.join(', ')}`);
    
    this.kafka = new Kafka({
      clientId: 'nestjs-backend',
      brokers,
      retry: {
        retries: 5,
        initialRetryTime: 300,
      },
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.isConnected = true;
      this.logger.log('Kafka producer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Kafka producer', error);
      // Don't throw error to allow app to start even if Kafka is down
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.logger.log('Kafka producer disconnected');
    }
  }

  async produce(record: ProducerRecord) {
    if (!this.isConnected) {
      this.logger.warn('Kafka producer not connected, skipping message');
      return;
    }

    try {
      await this.producer.send(record);
      this.logger.debug(`Message sent to topic: ${record.topic}`);
    } catch (error) {
      this.logger.error(`Failed to send message to topic ${record.topic}`, error);
      throw error;
    }
  }

  async sendUserActivity(activity: any) {
    await this.produce({
      topic: 'user-activity',
      messages: [
        {
          key: activity.userId?.toString(),
          value: JSON.stringify(activity),
          timestamp: Date.now().toString(),
        },
      ],
    });
  }
}

