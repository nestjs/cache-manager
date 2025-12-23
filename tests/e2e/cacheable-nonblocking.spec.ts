import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'net';
import request from 'supertest';
import { CacheableNonBlockingModule } from '../src/cacheable-nonblocking/cacheable-nonblocking.module';

describe('Caching with Cacheable nonBlocking', () => {
  let server: Server;
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [CacheableNonBlockingModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it(`should return empty on first call`, async () => {
    return request(server).get('/').expect(200, '');
  });

  it(`should return cached data on second call`, async () => {
    return request(server).get('/').expect(200, 'cacheable-value');
  });

  afterAll(async () => {
    await app.close();
  });
});
