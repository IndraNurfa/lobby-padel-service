import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginByPassDto,
  LoginDto,
  RegisterDto,
  VerifyOtpDto,
} from './dto/req-auth.dto';
import { UserModel } from '../users/entities/users.entities';
import { SerializationInterceptor } from '../core/interceptors/serialization.interceptor';
import { ResponseLoginDto, ResponseRegisterDto } from './dto/resp-auth.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
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

  /**
   * Test endpoint for JwtRefreshGuard.
   * Send a valid refresh token as a Bearer token to get OK.
   *
   * GET /auth/test/refresh
   */
  @Get('test/refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  testRefreshGuard(@CurrentUser() user: TokenPayload) {
    this.logger.log(
      `[testRefreshGuard] Refresh token valid for sub=${user.sub}`,
    );
    return {
      status: 'ok',
      message: 'Refresh token is valid',
      user: {
        sub: user.sub,
        role: user.role,
      },
    };
  }
}
