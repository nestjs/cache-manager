import { createCacheManager } from '../../lib/cache.providers';

describe('Keyv instance detection', () => {
  it('should preserve a foreign Keyv-like instance instead of wrapping it again', async () => {
    const foreignKeyv = {
      opts: {},
      hooks: {},
      stats: {},
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      disconnect: vi.fn(),
    };
    const provider = createCacheManager();
    const cacheManager = await provider.useFactory({
      stores: [foreignKeyv as any],
    });

    expect(cacheManager.stores).toEqual([foreignKeyv]);

    await cacheManager.onModuleDestroy();

    expect(foreignKeyv.disconnect).toHaveBeenCalledTimes(1);
  });
});
