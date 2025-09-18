import { Module } from '@nestjs/common';
import { CacheModule } from '../../../lib';
import { CacheCleanController } from './cache-clean.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [CacheCleanController],
})
export class CacheCleanModule {}