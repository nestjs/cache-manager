import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule } from '../../../lib';
import { MultiStoreController } from './multi-store.controller';

@Module({
  imports: [
    CacheModule.register([
      {
        store: 'memory',
        max: 100,
        ttl: 50,
      },
      {
        store: redisStore,
        host: 'localhost',
        port: 6379,
        db: 0,
        ttl: 50,
      },
    ]),
  ],
  controllers: [MultiStoreController],
})
export class MultiStoreModule {}
