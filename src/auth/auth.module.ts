import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './entities/session.entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserSession])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
