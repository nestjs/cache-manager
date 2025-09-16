import { ConfigurableModuleBuilder } from '@nestjs/common';
import { CacheModuleOptions, CacheOptionsFactory } from './interfaces/cache-module.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<CacheModuleOptions>({
  moduleName: 'Cache',
})
  .setFactoryMethodName('createCacheOptions' as keyof CacheOptionsFactory)
  .build();
