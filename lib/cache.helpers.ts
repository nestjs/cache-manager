import { createHash } from 'crypto';

import { CacheEvictKeyBuilder, CacheKeyBuilder } from './interfaces/cacheable.interface';
import { getCacheManager, getCacheManagerIsv5OrGreater } from './context-holder';

type KeyType = string | string[] | CacheKeyBuilder | CacheEvictKeyBuilder;

function extract(keyBuilder: KeyType, args: any[]): string[] {
  const keys = keyBuilder instanceof Function ? keyBuilder(...args) : keyBuilder;
  return Array.isArray(keys) ? keys : [keys];
}

export function generateComposedKey(options: {
  key?: string | CacheKeyBuilder | CacheEvictKeyBuilder;
  namespace?: string | CacheKeyBuilder;
  methodName: string;
  args: any[];
}): string[] {
  let keys: string[];

  if (options.key) {
    keys = extract(options.key, options.args);
  } else {
    const hash = createHash('md5').update(JSON.stringify(options.args)).digest('hex');
    keys = [`${options.methodName}@${hash}`];
  }

  const namespace = options.namespace && extract(options.namespace, options.args);
  return keys.map(it => (namespace ? `${namespace[0]}:${it}` : it));
}

const pendingMethodCallMap = new Map<string, Promise<any>>();

export async function setCache(key: string, method: () => Promise<any>, ttl?: number): Promise<any> {
  let pendingMethodCallPromise = pendingMethodCallMap.get(key);

  if (!pendingMethodCallPromise) {
    pendingMethodCallPromise = method();
    pendingMethodCallMap.set(key, pendingMethodCallPromise);
  }

  const value: any = await pendingMethodCallPromise;

  // v5 ttl ; v4 {ttl:ttl}
  await getCacheManager().set(key, value, getCacheManagerIsv5OrGreater() ? ttl : ({ ttl: ttl } as any));

  return value;
}
