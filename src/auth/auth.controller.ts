import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SerializationInterceptor } from '../core/interceptors/serialization.interceptor';
import { UserModel } from '../users/entities/users.entities';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  LoginByPassDto,
  LoginDto,
  RegisterDto,
  VerifyOtpDto,
} from './dto/req-auth.dto';
import { ResponseLoginDto, ResponseRegisterDto } from './dto/resp-auth.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type { TokenPayload } from './types/auth';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(new SerializationInterceptor(ResponseRegisterDto))
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<UserModel> {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      this.logger.error('Error during registration:: ', error);
      throw error;
    }
  }

  @UseInterceptors(new SerializationInterceptor(ResponseLoginDto))
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

  @Post('login/otp/verify')
  async verifyOtp(@Body() verifyOtp: VerifyOtpDto) {
    try {
      return await this.authService.verifyOtp(verifyOtp);
    } catch (error) {
      this.logger.error('Error during login:: ', error);
      throw error;
    }
  }

  @Put('refresh-token')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@CurrentUser() user: TokenPayload) {
    try {
      return await this.authService.getRefreshToken(user);
    } catch (error) {
      this.logger.error('Error during refreshing token:: ', error);
      throw error;
    }
  }
}
