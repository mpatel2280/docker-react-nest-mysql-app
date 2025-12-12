import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthActivityService } from './auth-activity.service';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    KafkaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'thequickbrownfoxjumpsoverthelazydog',
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthActivityService],
  exports: [AuthService],
})
export class AuthModule {}

