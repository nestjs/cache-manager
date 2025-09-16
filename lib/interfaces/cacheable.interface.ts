export type CacheKeyBuilder = (...args: any[]) => string;

export type CacheableRegisterOptions = {
  key?: string | CacheKeyBuilder;
  namespace?: string | CacheKeyBuilder;
  ttl?: number;
};

export type CacheEvictKeyBuilder = (...args: any[]) => string | string[];

export type CacheEvictRegisterOptions = {
  key?: string | CacheEvictKeyBuilder;
  namespace?: string | CacheKeyBuilder;
};
