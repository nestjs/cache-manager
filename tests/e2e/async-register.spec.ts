import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AsyncRegisterModule } from '../src/async-register/async-register.module';

describe('Async Register', () => {
  let server: any;
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AsyncRegisterModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it(`should return empty`, async () => {
    return request(server).get('/').expect(200, 'Not found');
  });

  it(`should return data`, async () => {
    return request(server).get('/').expect(200, 'value');
  });

  afterAll(async () => {
    await app.close();
  });
});
