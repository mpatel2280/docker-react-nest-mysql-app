import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserActivityService } from './user-activity.service';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [UserController],
  providers: [UserService, UserActivityService],
  exports: [UserService],
})
export class UserModule {}

