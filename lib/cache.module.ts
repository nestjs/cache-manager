import { DynamicModule, Inject, Module } from '@nestjs/common';
import * as cacheManagerPackage from 'cache-manager';
import { createCache } from 'cache-manager';

import { CacheModuleAsyncOptions, CacheModuleOptions } from './interfaces/cache-module.interface';
import { setCacheManager, setCacheManagerIsv5OrGreater } from './context-holder';
import { ConfigurableModuleClass } from './cache.module-definition';
import { createCacheManager } from './cache.providers';
import { CACHE_MANAGER } from './cache.constants';

/**
 * This is just the same as the `Cache` interface from `cache-manager` but you can
 * use this as a provider token as well.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export abstract class Cache {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging,@typescript-eslint/no-empty-object-type
export interface Cache extends ReturnType<typeof createCache> {}

/**
 * Module that provides Nest cache-manager.
 *
 * @see [Caching](https://docs.nestjs.com/techniques/caching)
 *
 * @publicApi
 */
@Module({
  providers: [
    createCacheManager(),
    {
      provide: Cache,
      useExisting: CACHE_MANAGER,
    },
  ],
  exports: [CACHE_MANAGER, Cache],
})
export class CacheModule extends ConfigurableModuleClass {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    super();

    const isV5OrGreater = typeof (cacheManagerPackage as any).createCache === 'function';

    setCacheManagerIsv5OrGreater(isV5OrGreater);
    setCacheManager(this.cacheManager);
  }

  /**
   * Configure the cache manager statically.
   *
   * @param options options to configure the cache manager
   *
   * @see [Customize caching](https://docs.nestjs.com/techniques/caching#customize-caching)
   */
  static register<StoreConfig extends Record<any, any> = Record<string, any>>(
    options: CacheModuleOptions<StoreConfig> = {} as any,
  ): DynamicModule {
    return {
      global: options.isGlobal,
      ...super.register(options),
    };
  }

  /**
   * Configure the cache manager dynamically.
   *
   * @param options method for dynamically supplying cache manager configuration
   * options
   *
   * @see [Async configuration](https://docs.nestjs.com/techniques/caching#async-configuration)
   */
  static registerAsync<StoreConfig extends Record<any, any> = Record<string, any>>(
    options: CacheModuleAsyncOptions<StoreConfig>,
  ): DynamicModule {
    const moduleDefinition = super.registerAsync(options);

    return {
      global: options.isGlobal,
      ...moduleDefinition,
      providers: options.extraProviders
        ? moduleDefinition.providers.concat(options.extraProviders)
        : moduleDefinition.providers,
    };
  }
}
