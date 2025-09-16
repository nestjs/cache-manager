import { generateComposedKey, setCache } from '../cache.helpers';
import { CacheableRegisterOptions } from '../interfaces';
import { getCacheManager } from '../context-holder';

const pendingCacheMap = new Map<string, Promise<any>>();

async function fetchCachedValue(key: string) {
  let pendingCachePromise = pendingCacheMap.get(key);

  if (!pendingCachePromise) {
    pendingCachePromise = getCacheManager().get(key);
    pendingCacheMap.set(key, pendingCachePromise);
  }

  pendingCacheMap.delete(key);

  return await pendingCachePromise;
}

async function cacheableHandle(key: string, method: () => Promise<any>, ttl?: number) {
  try {
    const cachedValue = await fetchCachedValue(key);
    if (cachedValue !== undefined && cachedValue !== null) return cachedValue;
    /* eslint-disable-next-line no-empty */
  } catch {}

  return setCache(key, method, ttl);
}

export function Cacheable(options: CacheableRegisterOptions): MethodDecorator {
  return function (_, propertyKey: string | symbol, descriptor) {
    const originalMethod = descriptor.value as unknown as Function;

    return {
      ...descriptor,
      value: async function (...args: any[]) {
        const cacheManager = getCacheManager();

        if (!cacheManager) return originalMethod.apply(this, args);

        const composeOptions: Parameters<typeof generateComposedKey>[0] = {
          methodName: String(propertyKey),
          key: options.key,
          namespace: options.namespace,
          args,
        };

        const cacheKey = generateComposedKey(composeOptions);

        return cacheableHandle(cacheKey[0], () => originalMethod.apply(this, args), options.ttl);
      } as any,
    };
  };
}
