/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../types/auth';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'super-secret-key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenPayload): Promise<TokenPayload> {
    const authHeader = req.headers['authorization'] as string;
    const token =
      typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    if (payload.token_type !== 'refresh_token') {
      throw new UnauthorizedException('Invalid token type');
    }

    const jti = payload.jti;
    const hashToken = this.authService.hash(token);

    const session = await this.authService.findSession(jti);
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (hashToken !== session.refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      sub: payload.sub,
      jti: payload.jti,
      role: payload.role,
      token_type: payload.token_type,
    };
  }
}
