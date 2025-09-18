import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'net';
import request from 'supertest';
import { CacheCleanModule } from '../src/cache-clean/cache-clean.module';

describe('CacheClean decorator', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CacheCleanModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('should clean cache on successful POST request', async () => {
    // First, populate the cache with a GET request
    await request(server).get('/timeline').expect(200).expect('X-Cache', 'MISS');

    // Verify cache is hit on second request
    await request(server).get('/timeline').expect(200).expect('X-Cache', 'HIT');

    // Create a new post (should trigger cache clean)
    await request(server).post('/posts').send({ title: 'New Post' }).expect(201);

    // Verify cache was cleaned (should be MISS again)
    await request(server).get('/timeline').expect(200).expect('X-Cache', 'MISS');
  });

  it('should not clean cache on failed POST request', async () => {
    // First, populate the cache with a GET request
    await request(server).get('/timeline').expect(200).expect('X-Cache', 'MISS');

    // Verify cache is hit on second request
    await request(server).get('/timeline').expect(200).expect('X-Cache', 'HIT');

    // Try to create a post that will fail (should not trigger cache clean)
    await request(server).post('/posts').send({}).expect(400);

    // Verify cache was not cleaned (should still be HIT)
    await request(server).get('/timeline').expect(200).expect('X-Cache', 'HIT');
  });

  afterEach(async () => {
    await app.close();
  });
});