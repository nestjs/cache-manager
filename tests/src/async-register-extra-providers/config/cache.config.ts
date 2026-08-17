import { Injectable } from '@nestjs/common';
import {
  CacheModuleOptions,
  CacheOptionsFactory,
} from '../../../../lib/index.js';
import { ConfigService } from './config.service.js';

@Injectable()
export class CacheConfig implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createCacheOptions(): CacheModuleOptions {
    const ttl = this.configService.getTtl();

    return { ttl };
  }
}
