import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { KafkaModule } from './kafka/kafka.module';
import { ActivityLogModule } from './activity-log/activity-log.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URL ||
        'mongodb://admin:admin123@localhost:27017/activity_logs?authSource=admin',
    ),
    PrismaModule,
    UserModule,
    AuthModule,
    KafkaModule,
    ActivityLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
