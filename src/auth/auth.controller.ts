import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Logger,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginByPassDto,
  LoginDto,
  RegisterDto,
  VeryfyOtpDto,
} from './dto/req-auth.dto';
import { UserModel } from 'src/users/entities/users.entities';
import { SerializationInterceptor } from 'src/core/interceptors/serialization.interceptor';
import { ResponseLoginDto } from './dto/resp-auth.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(new SerializationInterceptor(ResponseLoginDto))
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<UserModel> {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      this.logger.error('Error during registration:: ', error);
      throw error;
    }
  }

  @Post('login')
  async loginByEmailPassword(@Body() loginDto: LoginByPassDto) {
    try {
      return await this.authService.loginByEmailPassword(loginDto);
    } catch (error) {
      this.logger.error('Error during login:: ', error);
      throw error;
    }
  }

  @Post('login/otp')
  async loginByOtp(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.loginByOtp(loginDto);
    } catch (error) {
      this.logger.error('Error during login:: ', error);
      throw error;
    }
  }

  @Post('login/otp/veryfy')
  async verifyOtp(@Body() verifyOtp: VeryfyOtpDto) {
    try {
      return await this.authService.verifyOtp(verifyOtp);
    } catch (error) {
      this.logger.error('Error during login:: ', error);
      throw error;
    }
  }
}
