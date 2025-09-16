import { CacheEvictRegisterOptions } from '../interfaces';
import { generateComposedKey } from '../cache.helpers';
import { getCacheManager } from '../context-holder';

export function CacheEvict(...options: CacheEvictRegisterOptions[]): MethodDecorator {
  return (_, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value as unknown as Function;

    return {
      ...descriptor,
      value: async function (...args: any[]) {
        const value: any = await originalMethod.apply(this, args);

        try {
          await Promise.all(
            options.map(option => {
              const cacheKeys = generateComposedKey({
                ...option,
                methodName: propertyKey as string,
                args,
              });

              if (Array.isArray(cacheKeys)) return Promise.all(cacheKeys.map(key => getCacheManager().del(key)));
              return getCacheManager().del(cacheKeys);
            }),
          );
          /* eslint-disable-next-line no-empty */
        } catch {} // Empty catch to avoid affecting the main logic

        return value;
      } as any,
    };
  };
}
