import Keyv from 'keyv';
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

  it('should apply module namespace and ttl to a Keyv instance', async () => {
    const keyv = new Keyv();
    const provider = createCacheManager();
    const cacheManager = await provider.useFactory({
      stores: [keyv],
      namespace: 'test-namespace',
      ttl: 5000,
    });

    expect(cacheManager.stores[0].namespace).toBe('test-namespace');
    expect(cacheManager.stores[0].opts.namespace).toBe('test-namespace');
    expect(cacheManager.stores[0].opts.ttl).toBe(5000);
  });

  it('should preserve custom namespace and ttl if already defined on Keyv instance', async () => {
    const keyv = new Keyv({ namespace: 'custom-ns', ttl: 1234 });
    const provider = createCacheManager();
    const cacheManager = await provider.useFactory({
      stores: [keyv],
      namespace: 'module-ns',
      ttl: 5000,
    });

    expect(cacheManager.stores[0].namespace).toBe('custom-ns');
    expect(cacheManager.stores[0].opts.namespace).toBe('custom-ns');
    expect(cacheManager.stores[0].opts.ttl).toBe(1234);
  });
});
