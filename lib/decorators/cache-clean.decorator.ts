import { SetMetadata } from '@nestjs/common';
import { CACHE_CLEAN_METADATA } from '../cache.constants';

/**
 * Decorator that marks a cache key to be cleaned (removed) when the route
 * returns a successful response.
 *
 * For example:
 * `@CacheClean('timeline')`
 *
 * @param key string naming the cache key to be removed on success
 *
 * @see [Caching](https://docs.nestjs.com/techniques/caching)
 *
 * @publicApi
 */
export const CacheClean = (key: string) =>
  SetMetadata(CACHE_CLEAN_METADATA, key);
