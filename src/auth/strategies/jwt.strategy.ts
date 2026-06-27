/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../types/auth';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

    if (payload.token_type !== 'access_token') {
      throw new UnauthorizedException('Invalid token type');
    }

    const jti = payload.jti;
    const hashToken = this.authService.hash(token);

    // Fast path: token found in cache
    const cacheToken = await this.cacheManager.get<string>(`auth:token:${jti}`);
    if (cacheToken && cacheToken === hashToken) {
      return {
        sub: payload.sub,
        jti: payload.jti,
        role: payload.role,
        token_type: payload.token_type,
      };
    }

    // Slow path: verify against DB session
    const session = await this.authService.findSession(jti);
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    const accessToken = session.token;

    if (hashToken !== accessToken) {
      throw new UnauthorizedException('Invalid token');
    }

    // Warm the cache for subsequent requests
    await this.cacheManager.set<string>(
      `auth:token:${jti}`,
      accessToken,
      15 * 60 * 1000,
    );

    return {
      sub: payload.sub,
      jti: payload.jti,
      role: payload.role,
      token_type: payload.token_type,
    };
  }
}
