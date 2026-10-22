import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'net';
import request from 'supertest';
import { SseModule } from '../src/sse/sse.module.js';

const getEventData = (text: string) =>
  text.match(/^data: .*$/gm)?.map(line => line.slice('data: '.length));

describe('Server-sent events', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [SseModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('should not cache server-sent event streams', async () => {
    const first = await request(server).get('/events').expect(200);
    const second = await request(server).get('/events').expect(200);

    expect(getEventData(first.text)).toEqual(['0-1', '0-2', '0-3']);
    expect(getEventData(second.text)).toEqual(['1-1', '1-2', '1-3']);
  });

  afterEach(async () => {
    await app.close();
  });
});
