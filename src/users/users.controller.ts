import { SerializationInterceptor } from '@/core/interceptors/serialization.interceptor';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { TokenPayload } from '../auth/types/auth';
import { ApiSuccessResponse } from '../common/swagger';
import { ResponseUserDto } from './dto/resp-users.dto';
import { UserRole } from './entities/users.entities';
import { UsersService } from './users.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(new SerializationInterceptor(ResponseUserDto))
  @Get('profiles')
  @ApiOperation({ summary: 'Get Profiles' })
  @ApiSuccessResponse(ResponseUserDto)
  async getProfiles(@CurrentUser() user: TokenPayload) {
    try {
      const { sub } = user;
      return await this.usersService.findById(sub);
    } catch (error) {
      this.logger.error('Error during getting profiles:: ', error);
      throw error;
    }
  }

  /**
   * Test endpoint for @Roles(UserRole.ADMIN) guard.
   * Requires: valid access token + ADMIN role.
   *
   * GET /users/test/admin
   */
  @Get('test/admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  testAdminRole(@CurrentUser() user: TokenPayload) {
    this.logger.log(`[testAdminRole] Admin access granted for sub=${user.sub}`);
    return {
      status: 'ok',
      message: 'RolesGuard(ADMIN) is working',
      user: {
        sub: user.sub,
        role: user.role,
      },
    };
  }

  /**
   * Test endpoint for @Roles(UserRole.USER) guard.
   * Requires: valid access token + USER role.
   *
   * GET /users/test/user-role
   */
  @Get('test/user-role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  testUserRole(@CurrentUser() user: TokenPayload) {
    this.logger.log(
      `[testUserRole] User role access granted for sub=${user.sub}`,
    );
    return {
      status: 'ok',
      message: 'RolesGuard(USER) is working',
      user: {
        sub: user.sub,
        role: user.role,
      },
    };
  }
}
