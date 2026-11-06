import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'net';
import request from 'supertest';
import { CACHE_MANAGER } from '../../lib/index.js';
import { StreamingModule } from '../src/streaming/streaming.module.js';

describe('Streaming responses', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [StreamingModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it.each(['generator', 'readable-stream', 'node-readable', 'response'])(
    'should not cache a %s',
    async route => {
      await request(server).get(`/${route}`).expect('X-Cache', 'MISS');
      await new Promise(resolve => setTimeout(resolve, 20));

      await expect(
        app.get(CACHE_MANAGER).get(`/${route}`),
      ).resolves.toBeUndefined();
      await request(server).get(`/${route}`).expect('X-Cache', 'MISS');
    },
  );

  it('should keep caching other values', async () => {
    await request(server).get('/json').expect('X-Cache', 'MISS');
    await new Promise(resolve => setTimeout(resolve, 20));

    await request(server)
      .get('/json')
      .expect('X-Cache', 'HIT')
      .expect({ value: 'chunk' });
  });

  afterEach(async () => {
    await app.close();
  });
});
