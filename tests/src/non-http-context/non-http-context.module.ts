import { Module } from '@nestjs/common';
import { CacheInterceptor, CacheModule } from '../../../lib/index.js';
import { NonHttpContextController } from './non-http-context.controller.js';

@Module({
  imports: [CacheModule.register()],
  controllers: [NonHttpContextController],
  providers: [CacheInterceptor],
})
export class NonHttpContextModule {}
