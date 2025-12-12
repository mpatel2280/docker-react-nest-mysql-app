import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog, ActivityLogDocument } from './schemas/activity-log.schema';

export interface ActivityLogData {
  userId: number;
  userEmail: string;
  userName?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  entity: 'USER' | 'AUTH';
  entityId?: number;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async create(data: ActivityLogData): Promise<ActivityLog> {
    try {
      const activityLog = new this.activityLogModel({
        ...data,
        timestamp: new Date(),
      });
      const saved = await activityLog.save();
      this.logger.log(
        `Activity logged: ${data.action} ${data.entity} by user ${data.userEmail}`,
      );
      return saved;
    } catch (error) {
      this.logger.error('Failed to create activity log', error);
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: ActivityLog[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.activityLogModel
        .find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.activityLogModel.countDocuments().exec(),
    ]);
    return { data, total };
  }

  async findByUserId(
    userId: number,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: ActivityLog[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.activityLogModel
        .find({ userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.activityLogModel.countDocuments({ userId }).exec(),
    ]);
    return { data, total };
  }

  async findByAction(
    action: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: ActivityLog[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.activityLogModel
        .find({ action })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.activityLogModel.countDocuments({ action }).exec(),
    ]);
    return { data, total };
  }
}

