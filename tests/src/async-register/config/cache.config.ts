import { Injectable } from '@nestjs/common';
import {
  CacheModuleOptions,
  CacheOptionsFactory,
} from '../../../../lib/index.js';

@Injectable()
export class CacheConfig implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    const ttl = 100;

    return { ttl };
  }
}
