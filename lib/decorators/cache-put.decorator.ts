import { generateComposedKey, setCache } from '../cache.helpers';
import { CacheableRegisterOptions } from '../interfaces';
import { getCacheManager } from '../context-holder';

export function CachePut(options: CacheableRegisterOptions): MethodDecorator {
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

        return setCache(cacheKey[0], () => originalMethod.apply(this, args), options.ttl);
      } as any,
    };
  };
}
