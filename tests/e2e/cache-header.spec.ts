import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'net';
import request from 'supertest';
import { CustomTtlModule } from '../src/custom-ttl/custom-ttl.module';

describe('X-Cache header', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CustomTtlModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it("should set X-Cache header MISS when cache wasn't hit", async () => {
    await request(server).get('/').expect('X-Cache', 'MISS');
  });

  it('should set X-Cache header HIT when cache was hit', async () => {
    await request(server).get('/').expect('X-Cache', 'MISS');
    await request(server).get('/').expect('X-Cache', 'HIT');
  });

  afterEach(async () => {
    await app.close();
  });
});
