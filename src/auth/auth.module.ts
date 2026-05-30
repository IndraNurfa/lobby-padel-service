import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserSession } from './entities/session.entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserSession]), UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
