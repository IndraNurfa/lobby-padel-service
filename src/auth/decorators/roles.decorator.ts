import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/users.entities';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict a route to specific roles.
 *
 * Example usage:
 * ```
 * @Get('admin-only')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN)
 * adminRoute() { ... }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
