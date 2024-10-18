import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheModule, CacheStore } from '../../../lib';
import { MultiStoreController } from './multi-store.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        });

        return [
          {
            store: store as unknown as CacheStore,
            ttl: 3 * 60000, // 3 minutes (milliseconds)
          },
          {
            store: 'memory',
            max: 100,
            ttl: 50,
          },
        ];
      },
    }),
  ],
  controllers: [MultiStoreController],
})
export class MultiStoreModule {}
