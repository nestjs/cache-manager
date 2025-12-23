import { Provider } from '@nestjs/common';
import { createCache } from 'cache-manager';
import type { Cacheable } from 'cacheable';
import Keyv, { type KeyvStoreAdapter } from 'keyv';
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

function assignOnModuleDestroy(target: any): void {
  target.onModuleDestroy = target.disconnect;
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
          assignOnModuleDestroy(store);
          return store;
        }
        if (store instanceof Keyv) {
          assignOnModuleDestroy(store);
          return store;
        }
        const keyv = new Keyv({
          store,
          ttl: options.ttl,
          namespace: options.namespace,
        });
        assignOnModuleDestroy(keyv);
        return keyv;
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
