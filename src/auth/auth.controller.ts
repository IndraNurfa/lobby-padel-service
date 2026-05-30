import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/req-auth.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<any> {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      this.logger.error('Error during registration', error);
      throw error;
    }
  }
}
