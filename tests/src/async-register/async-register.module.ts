import { Module } from '@nestjs/common';
import { CacheModule } from '../../../lib/index.js';
import { AsyncRegisterController } from './async-register.controller.js';
import { CacheConfig } from './config/cache.config.js';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfig,
    }),
  ],
  controllers: [AsyncRegisterController],
})
export class AsyncRegisterModule {}
