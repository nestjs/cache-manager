import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { CACHE_TTL_METADATA } from '../cache.constants';
export type CacheTTLFactory = (
  ctx: ExecutionContext,
) => Promise<number> | number;

/**
 * Decorator that sets the cache ttl setting the duration for cache expiration.
 *
 * For example: `@CacheTTL(5)`
 *
 * @param ttl number set the cache expiration time
 *
 * @see [Caching](https://docs.nestjs.com/techniques/caching)
 *
 * @publicApi
 */
export const CacheTTL = (ttl: number | CacheTTLFactory) =>
  SetMetadata(CACHE_TTL_METADATA, ttl);
