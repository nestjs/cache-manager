import { Module } from '@nestjs/common';
import { CacheModule } from '../../../lib';
import { CustomTtlController } from './custom-ttl.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [CustomTtlController],
})
export class CustomTtlModule {}
