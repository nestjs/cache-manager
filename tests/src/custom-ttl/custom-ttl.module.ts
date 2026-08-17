import { Module } from '@nestjs/common';
import { CacheModule } from '../../../lib/index.js';
import { CustomTtlController } from './custom-ttl.controller.js';

@Module({
  imports: [CacheModule.register()],
  controllers: [CustomTtlController],
})
export class CustomTtlModule {}
