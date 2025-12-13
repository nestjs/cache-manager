import { Provider } from '@nestjs/common';
import { createCache } from 'cache-manager';
import Keyv, { type KeyvStoreAdapter } from 'keyv';
import type { Cacheable } from 'cacheable';
import { CACHE_MANAGER } from './cache.constants';
import { MODULE_OPTIONS_TOKEN } from './cache.module-definition';
import { CacheManagerOptions } from './interfaces/cache-manager.interface';

function isCacheable(store: any): store is Cacheable {
  return (
    store &&
    typeof store === 'object' &&
    'primary' in store &&
    'secondary' in store &&
    'nonBlocking' in store
  );
}

/**
 * Creates a CacheManager Provider.
 *
 * @publicApi
 */
export function createCacheManager(): Provider {
  return {
    provide: CACHE_MANAGER,
    useFactory: async (options: CacheManagerOptions) => {
      const cachingFactory = async (
        store: Keyv | KeyvStoreAdapter | Cacheable,
        options: Omit<CacheManagerOptions, 'stores'>,
      ): Promise<Keyv | Cacheable> => {
        // If it's a Cacheable instance, return it directly to preserve nonBlocking mode
        if (isCacheable(store)) {
          return store;
        }
        if (store instanceof Keyv) {
          return store;
        }
        return new Keyv({
          store,
          ttl: options.ttl,
          namespace: options.namespace,
        });
      };
      const stores = Array.isArray(options.stores)
        ? await Promise.all(
            options.stores.map(store => cachingFactory(store, options)),
          )
        : options.stores
          ? [await cachingFactory(options.stores, options)]
          : undefined;

      const cacheManager = stores
        ? createCache({
            ...options,
            stores: stores as Keyv[],
          })
        : createCache({
            ttl: options.ttl,
            refreshThreshold: options.refreshThreshold,
            nonBlocking: options.nonBlocking,
          });

      (cacheManager as any).onModuleDestroy = async () => {
        if (!stores) {
          return;
        }
        await Promise.all(stores.map(async store => store.disconnect()));
      };
      return cacheManager;
    },
    inject: [MODULE_OPTIONS_TOKEN],
  };
}
