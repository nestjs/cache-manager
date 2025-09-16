import { CreateCacheOptions } from 'cache-manager';
import { Keyv, KeyvStoreAdapter } from 'keyv';

/**
 * Interface defining Cache Manager configuration options.
 *
 * @publicApi
 */
export interface CacheManagerOptions extends Omit<CreateCacheOptions, 'stores'> {
  /**
   * Cache storage manager.  Default is `'memory'` (in-memory store).  See
   * [Different stores](https://docs.nestjs.com/techniques/caching#different-stores)
   * for more info.
   */
  stores?: Keyv | KeyvStoreAdapter | (Keyv | KeyvStoreAdapter)[];
  /**
   * Cache storage namespace, default is `keyv`.
   * This is a global configuration that applies to all `KeyvStoreAdapter` instances.
   */
  namespace?: string;
  /**
   * Default time to live in milliseconds.
   * This is the maximum duration an item can remain in the cache before being removed.
   */
  ttl?: number;
  /**
   * Optional. If refreshThreshold is set, the TTL will be checked after retrieving a value from the cache.
   * If the remaining TTL is less than the refreshThreshold, the system will update the value asynchronously.
   */
  refreshThreshold?: number;
  /**
   * Default is false.
   * If set to true, the system will not block when using multiple stores.
   * For more information on how this affects function types, visit [documentation](https://www.npmjs.com/package/cache-manager#options).
   */
  nonBlocking?: boolean;
}
