/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

/**
 * IdempotencyInterceptor enables opt-in idempotency for NestJS handlers.
 *
 * This interceptor:
 * - Only activates when @Idempotent() decorator is present on a handler
 * - Requires the 'x-idempotency-key' request header
 * - Caches successful responses (status < 400) for the specified TTL
 * - Returns cached responses with 'x-idempotent-replayed: true' header
 *
 * Cache Key Format: 'idempotency:{method}:{path}:{idempotencyKey}'
 *
 * WARNING: In-memory cache is per-instance, so this will NOT work correctly
 * with multiple server instances running behind a load balancer.
 * For production scaling, upgrade to Redis cache:
 *   import { redisStore } from 'cache-manager-redis-store';
 *
 * @example
 * Register in your module:
 *   providers: [
 *     {
 *       provide: APP_INTERCEPTOR,
 *       useClass: IdempotencyInterceptor,
 *     },
 *     // ... other providers
 *     {
 *       provide: APP_INTERCEPTOR,
 *       useClass: ResponseInterceptor,
 *     },
 *   ]
 *
 * Use in your controller:
 *   @Post('bookings')
 *   @Idempotent()
 *   create(@Body() dto: CreateBookingDto) {
 *     return this.bookingService.create(dto);
 *   }
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Get idempotent metadata from the handler
    const idempotentMetadata = this.reflector.getAllAndOverride('idempotent', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Only proceed if @Idempotent() decorator is present
    if (!idempotentMetadata) {
      return next.handle();
    }

    // Extract and validate idempotency key from header
    const idempotencyKey = request.headers['x-idempotency-key'] as
      | string
      | undefined;

    if (!idempotencyKey) {
      throw new BadRequestException('x-idempotency-key header is required');
    }

    // Build cache key: 'idempotency:{method}:{path}:{idempotencyKey}'
    const cacheKey = `idempotency:${request.method}:${request.path}:${idempotencyKey}`;
    const ttl = idempotentMetadata.ttl as number;

    // Check if response is already cached
    const cachedResponse = await this.cacheManager.get<any>(cacheKey);

    if (cachedResponse) {
      // Cache hit: return cached response with replay header
      response.setHeader('x-idempotent-replayed', 'true');
      return new Observable((observer) => {
        observer.next(cachedResponse);
        observer.complete();
      });
    }

    // Cache miss: proceed with request and cache successful response
    return next.handle().pipe(
      tap(async (responseData: any) => {
        // Only cache successful responses (status < 400)
        const statusCode = response.statusCode;
        if (statusCode < 400) {
          await this.cacheManager.set(cacheKey, responseData, ttl * 1000);
        }
      }),
    );
  }
}
