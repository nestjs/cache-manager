import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor, CacheModule } from '../../../lib/index.js';
import { StreamingController } from './streaming.controller.js';

@Module({
  imports: [CacheModule.register()],
  controllers: [StreamingController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class StreamingModule {}
