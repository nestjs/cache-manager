import { Provider } from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { CACHE_MANAGER } from './cache.constants';
import { MODULE_OPTIONS_TOKEN } from './cache.module-definition';
import { defaultCacheOptions as defaultCacheOptionsOrigin } from './default-options';
import { CacheManagerOptions } from './interfaces/cache-manager.interface';
import { Keyv } from 'keyv';

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
      const cacheManager = loadPackage('cache-manager', 'CacheModule', () =>
        require('cache-manager'),
      );

      const cachingFactory = async (
        store: CacheManagerOptions['stores'],
        options: Omit<CacheManagerOptions, 'stores'>,
      ): Promise<Record<string, any>> => {
        if (!store || (store && store instanceof Keyv)) {
          return store;
        }
        return new Keyv({
          store,
          ttl: options.ttl || defaultCacheOptions.ttl,
          namespace: options.namespace || defaultCacheOptions.namespace,
        });
      };

      return Array.isArray(options.stores)
        ? cacheManager.createCache({
            stores: await Promise.all(
              options.stores.map(store => cachingFactory(store, options)),
            ),
            ttl: options.ttl || defaultCacheOptions.ttl,
            refreshThreshold:
              options.refreshThreshold || defaultCacheOptions.refreshThreshold,
          })
        : options.stores
          ? cacheManager.createCache({
              stores: [await cachingFactory(options.stores, options)],
              ttl: options.ttl || defaultCacheOptions.ttl,
              refreshThreshold:
                options.refreshThreshold ||
                defaultCacheOptions.refreshThreshold,
            })
          : cacheManager.createCache({
              ttl: options.ttl || defaultCacheOptions.ttl,
              refreshThreshold:
                options.refreshThreshold ||
                defaultCacheOptions.refreshThreshold,
            });
    },
    inject: [MODULE_OPTIONS_TOKEN],
  };
}
