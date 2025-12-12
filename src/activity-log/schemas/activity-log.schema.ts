import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityLogDocument = ActivityLog & Document;

@Schema({ timestamps: true })
export class ActivityLog {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  userEmail: string;

  @Prop()
  userName?: string;

  @Prop({ required: true, enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN'] })
  action: string;

  @Prop({ required: true, enum: ['USER', 'AUTH'] })
  entity: string;

  @Prop()
  entityId?: number;

  @Prop({ type: Object })
  oldData?: Record<string, any>;

  @Prop({ type: Object })
  newData?: Record<string, any>;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

