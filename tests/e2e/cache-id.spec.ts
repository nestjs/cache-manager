import { createCacheManager } from '../../lib/cache.providers';

describe('cacheId', () => {
  it('should apply the cacheId when no store is configured', async () => {
    const provider = createCacheManager();
    const cacheManager = await provider.useFactory({ cacheId: 'my-cache' });

    expect(cacheManager.cacheId()).toBe('my-cache');
  });

  it('should apply the cacheId when stores are configured', async () => {
    const provider = createCacheManager();
    const cacheManager = await provider.useFactory({
      stores: [new Map() as any],
      cacheId: 'my-cache',
    });

    expect(cacheManager.cacheId()).toBe('my-cache');
  });
});
