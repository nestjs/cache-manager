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

  it('should apply module namespace to a Keyv instance', async () => {
    const map = new Map();
    const keyv = new Keyv({ store: map });
    const provider = createCacheManager();
    const cacheManager = await provider.useFactory({
      stores: [keyv],
      namespace: 'test-namespace',
    });

    expect(cacheManager.stores[0].namespace).toBe('test-namespace');

    await cacheManager.set('foo', 'bar');

    expect(map.has('test-namespace:foo')).toBe(true);
    expect(await cacheManager.get('foo')).toBe('bar');
  });

  it('should preserve custom namespace if already defined on Keyv instance', async () => {
    const keyv = new Keyv({ namespace: 'custom-ns' });
    const provider = createCacheManager();
    const cacheManager = await provider.useFactory({
      stores: [keyv],
      namespace: 'module-ns',
    });

    expect(cacheManager.stores[0].namespace).toBe('custom-ns');
  });
});
