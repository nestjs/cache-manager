import { Controller, Get, Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '../../../lib';

@Controller()
export class CacheableNonBlockingController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Get()
  async getFromCacheable(): Promise<unknown> {
    const value = await this.cacheManager.get('cacheable-key');
    if (!value) {
      await this.cacheManager.set('cacheable-key', 'cacheable-value');
    }
    return value;
  }
}

