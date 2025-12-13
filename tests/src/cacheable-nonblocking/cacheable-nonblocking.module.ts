import { Module } from '@nestjs/common';
import { CacheModule } from '../../../lib';
import { CacheableNonBlockingController } from './cacheable-nonblocking.controller';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { Cacheable, CacheableMemory } from 'cacheable';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const cacheable = new Cacheable({
          primary: new Keyv({
            store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
          }),
          secondary: new KeyvRedis('redis://localhost:6379'),
          nonBlocking: true,
          ttl: 30000,
          namespace: 'test-cacheable',
        });

        return {
          stores: cacheable,
        };
      },
    }),
  ],
  controllers: [CacheableNonBlockingController],
})
export class CacheableNonBlockingModule {}
