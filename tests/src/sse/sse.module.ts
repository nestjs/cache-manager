import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor, CacheModule } from '../../../lib/index.js';
import { SseController } from './sse.controller.js';

@Module({
  imports: [CacheModule.register()],
  controllers: [SseController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class SseModule {}
