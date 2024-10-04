import { Provider } from '@nestjs/common';
import { CACHE_MANAGER } from './cache.constants';
import { MODULE_OPTIONS_TOKEN } from './cache.module-definition';
import { defaultCacheOptions as defaultCacheOptionsOrigin } from './default-options';
import { CacheManagerOptions } from './interfaces/cache-manager.interface';
import { Keyv, KeyvStoreAdapter } from 'keyv';
import { createCache } from 'cache-manager';

/**
 * Creates a CacheManager Provider.
 *
 * @publicApi
 */
export function createCacheManager(): Provider {
  return {
    provide: CACHE_MANAGER,
    useFactory: async (options: CacheManagerOptions) => {
      const defaultCacheOptions = { ...defaultCacheOptionsOrigin };

      const cachingFactory = async (
        store: Keyv | KeyvStoreAdapter,
        options: Omit<CacheManagerOptions, 'stores'>,
      ): Promise<Keyv> => {
        if (store instanceof Keyv) {
          return store;
        }
        return new Keyv({
          store,
          ttl: options.ttl || defaultCacheOptions.ttl,
          namespace: options.namespace || defaultCacheOptions.namespace,
        });
      };

      return Array.isArray(options.stores)
        ? createCache({
            stores: await Promise.all(
              options.stores.map(store => cachingFactory(store, options)),
            ),
            ttl: options.ttl || defaultCacheOptions.ttl,
            refreshThreshold: options.refreshThreshold,
            nonBlocking: options.nonBlocking || defaultCacheOptions.nonBlocking,
          })
        : options.stores
          ? createCache({
              stores: [await cachingFactory(options.stores, options)],
              ttl: options.ttl || defaultCacheOptions.ttl,
              refreshThreshold: options.refreshThreshold,
              nonBlocking:
                options.nonBlocking || defaultCacheOptions.nonBlocking,
            })
          : createCache({
              ttl: options.ttl || defaultCacheOptions.ttl,
              refreshThreshold: options.refreshThreshold,
              nonBlocking:
                options.nonBlocking || defaultCacheOptions.nonBlocking,
            });
    },
    inject: [MODULE_OPTIONS_TOKEN],
  };
}
