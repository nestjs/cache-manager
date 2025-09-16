import { Cache } from 'cache-manager';

let cacheManager: Cache | undefined;
let cacheManagerIsv5OrGreater = false;

export function setCacheManager(m: Cache) {
  cacheManager = m;
}

export function getCacheManager() {
  return cacheManager;
}

export function setCacheManagerIsv5OrGreater(val: boolean) {
  return (cacheManagerIsv5OrGreater = val);
}

export function getCacheManagerIsv5OrGreater() {
  return cacheManagerIsv5OrGreater;
}
