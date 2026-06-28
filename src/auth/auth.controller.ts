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
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '../common/swagger';
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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type { TokenPayload } from './types/auth';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(new SerializationInterceptor(ResponseRegisterDto))
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiSuccessResponse(ResponseRegisterDto, {
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
  })
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
  })
  @ApiSuccessResponse(ResponseLoginDto)
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    message: 'Validation failed.',
  })
  @ApiErrorResponse({
    status: HttpStatus.UNAUTHORIZED,
    message: 'Wrong Email or Password!',
  })
  async loginByEmailPassword(@Body() loginDto: LoginByPassDto) {
    try {
      return await this.authService.loginByEmailPassword(loginDto);
    } catch (error) {
      this.logger.error('Error during login:: ', error);
      throw error;
    }
  }

  @Post('login/otp')
  @ApiOperation({ summary: 'Request an OTP to login' })
  async loginByOtp(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.loginByOtp(loginDto);
    } catch (error) {
      this.logger.error('Error during login:: ', error);
      throw error;
    }
  }

  @Post('login/otp/verify')
  @ApiOperation({ summary: 'Verify OTP and complete login' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <refresh_token>',
    required: true,
  })
  @ApiSuccessResponse(ResponseLoginDto, {
    description: 'Token refreshed successfully',
  })
  async refreshToken(@CurrentUser() user: TokenPayload) {
    try {
      return await this.authService.getRefreshToken(user);
    } catch (error) {
      this.logger.error('Error during refreshing token:: ', error);
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out the currently authenticated user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful logout' })
  async logout(@CurrentUser() user: TokenPayload) {
    try {
      const { jti } = user;
      await this.authService.revokeToken(jti);
      return 'Success';
    } catch (error) {
      this.logger.error('Error during logout:: ', error);
      throw error;
    }
  }
}
