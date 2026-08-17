import { Module } from '@nestjs/common';
import { CacheModule } from '../../../lib/index.js';
import { DefaultTtlController } from './default-ttl.controller.js';

@Module({
  imports: [CacheModule.register()],
  controllers: [DefaultTtlController],
})
export class DefaultTtlModule {}
