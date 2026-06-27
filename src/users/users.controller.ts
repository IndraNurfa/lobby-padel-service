import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from './entities/users.entities';
import type { TokenPayload } from '../auth/types/auth';

@Controller('users')
@UseGuards(JwtAuthGuard) // All routes in this controller require a valid access token
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Test endpoint for @CurrentUser() decorator.
   * Requires: valid access token (any role).
   *
   * GET /users/test/me
   */
  @Get('test/me')
  @HttpCode(HttpStatus.OK)
  testCurrentUser(@CurrentUser() user: TokenPayload) {
    this.logger.log(
      `[testCurrentUser] Authenticated user sub=${user.sub}, role=${user.role}`,
    );
    return {
      status: 'ok',
      message: 'CurrentUser guard is working',
      user: {
        sub: user.sub,
        role: user.role,
      },
    };
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
