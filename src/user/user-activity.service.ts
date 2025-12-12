import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducerService } from '../kafka/kafka-producer.service';

export interface UserActivityData {
  userId: number;
  userEmail: string;
  userName?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityId?: number;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class UserActivityService {
  private readonly logger = new Logger(UserActivityService.name);

  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async logActivity(data: UserActivityData): Promise<void> {
    try {
      const activity = {
        ...data,
        entity: 'USER',
        timestamp: new Date().toISOString(),
      };

      await this.kafkaProducer.sendUserActivity(activity);
      
      this.logger.log(
        `User activity sent to Kafka: ${data.action} by ${data.userEmail}`,
      );
    } catch (error) {
      this.logger.error('Failed to log user activity', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  async logUserCreated(
    userId: number,
    userEmail: string,
    userName: string | undefined,
    userData: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logActivity({
      userId,
      userEmail,
      userName,
      action: 'CREATE',
      entityId: userId,
      newData: userData,
      ipAddress,
      userAgent,
    });
  }

  async logUserUpdated(
    userId: number,
    userEmail: string,
    userName: string | undefined,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logActivity({
      userId,
      userEmail,
      userName,
      action: 'UPDATE',
      entityId: userId,
      oldData,
      newData,
      ipAddress,
      userAgent,
    });
  }

  async logUserDeleted(
    userId: number,
    userEmail: string,
    userName: string | undefined,
    userData: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logActivity({
      userId,
      userEmail,
      userName,
      action: 'DELETE',
      entityId: userId,
      oldData: userData,
      ipAddress,
      userAgent,
    });
  }
}

