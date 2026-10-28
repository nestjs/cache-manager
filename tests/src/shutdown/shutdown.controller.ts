import { Controller, Get, Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '../../../lib/index.js';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(res => (resolve = res));
  return { promise, resolve };
}

export const gate = { started: deferred(), release: deferred() };

@Controller()
export class ShutdownController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Reaches the cache only once the test lets it, so the request can still be
  // running while the application closes.
  @Get('slow')
  async slow(): Promise<unknown> {
    gate.started.resolve();
    await gate.release.promise;
    await this.cacheManager.set('shutdown-key', 'shutdown-value');
    return this.cacheManager.get('shutdown-key');
  }
}
