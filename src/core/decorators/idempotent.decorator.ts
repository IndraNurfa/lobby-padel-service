import { SetMetadata } from '@nestjs/common';

const IDEMPOTENT_KEY = 'idempotent';

/**
 * Decorator to mark a route handler as idempotent.
 * When applied, the IdempotencyInterceptor will cache successful responses
 * based on the x-idempotency-key header.
 *
 * @param ttl Time to live in seconds for the cached response. Default: 86400 (24 hours)
 *
 * @example
 * @Post('bookings')
 * @Idempotent()
 * create(@Body() dto: CreateBookingDto) {
 *   return this.bookingService.create(dto);
 * }
 *
 * @example
 * @Post('payments')
 * @Idempotent(3600) // 1 hour TTL
 * charge(@Body() dto: ChargeDto) {
 *   return this.paymentService.charge(dto);
 * }
 */
export const Idempotent = (ttl: number = 86400) =>
  SetMetadata(IDEMPOTENT_KEY, { ttl });

export const getIdempotentMetadata = (
  metadata: Record<string, unknown>,
): { ttl: number } | null => {
  return metadata[IDEMPOTENT_KEY] as { ttl: number } | null;
};
