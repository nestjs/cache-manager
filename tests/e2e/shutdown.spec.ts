import KeyvRedis from '@keyv/redis';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Keyv } from 'keyv';
import request from 'supertest';
import { Cache, CACHE_MANAGER } from '../../lib/index.js';
import { gate } from '../src/shutdown/shutdown.controller.js';
import { ShutdownModule } from '../src/shutdown/shutdown.module.js';

describe('Caching on shutdown', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ShutdownModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  // `app.close()` runs every `onModuleDestroy` hook before it stops the HTTP
  // server. A request still in flight then must not find the store
  // disconnected, and the store must stay closed once the app is.
  it('should disconnect the store only after the requests in flight', async () => {
    const cacheManager = app.get<Cache>(CACHE_MANAGER);
    await cacheManager.del('shutdown-key');

    const [keyv] = cacheManager.stores as Keyv[];
    const redis = keyv.store as KeyvRedis<unknown>;

    // Let the request continue once the store has been disconnected, or after
    // a grace period if the application waits for the request first.
    const disconnect = keyv.disconnect.bind(keyv);
    keyv.disconnect = async () => {
      await disconnect();
      gate.release.resolve();
    };
    setTimeout(() => gate.release.resolve(), 500).unref();

    // supertest sends the request once it is awaited, so start it now.
    const response = request(app.getHttpServer())
      .get('/slow')
      .then(res => res);
    await gate.started.promise;
    await app.close();

    const res = await response;
    expect(res.status).toBe(200);
    expect(res.text).toBe('shutdown-value');
    expect(redis.client.isOpen).toBe(false);
  });
});
