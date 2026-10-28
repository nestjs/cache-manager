import KeyvRedis from '@keyv/redis';
import { Module } from '@nestjs/common';
import { CacheModule } from '../../../lib/index.js';
import { ShutdownController } from './shutdown.controller.js';

@Module({
  imports: [
    CacheModule.register({
      stores: [new KeyvRedis('redis://localhost:6379')],
    }),
  ],
  controllers: [ShutdownController],
})
export class ShutdownModule {}
