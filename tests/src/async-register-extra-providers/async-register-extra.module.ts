import { Module } from '@nestjs/common';
import { CacheModule } from '../../../lib/index.js';
import { AsyncRegisterExtraController } from './async-register-extra.controller.js';
import { CacheConfig } from './config/cache.config.js';
import { ConfigService } from './config/config.service.js';

@Module({
  imports: [
    CacheModule.registerAsync({
      extraProviders: [ConfigService],
      isGlobal: true,
      useClass: CacheConfig,
    }),
  ],
  controllers: [AsyncRegisterExtraController],
})
export class AsyncRegisterExtraModule {}
