import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DefaultTtlModule } from '../src/default-ttl/default-ttl.module';

describe('Caching Default TTL', () => {
  let server: any;
  let app: INestApplication;

  describe('should use the same default ttl in every cach manager', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [DefaultTtlModule],
      }).compile();

      app = module.createNestApplication();
      server = app.getHttpServer();
      await app.init();
    });

    it(`should use default ttl in first test`, async () => {
      await request(server).get('/').expect(200, 'Not found');
      await new Promise(resolve => setTimeout(resolve, 400));
      await request(server).get('/').expect(200, 'value');
      await new Promise(resolve => setTimeout(resolve, 5000));
      await request(server).get('/').expect(200, 'Not found');
    }, 8000);

    it(`should use default ttl in second test`, async () => {
      await request(server).get('/').expect(200, 'Not found');
      await new Promise(resolve => setTimeout(resolve, 400));
      await request(server).get('/').expect(200, 'value');
      await new Promise(resolve => setTimeout(resolve, 5000));
      await request(server).get('/').expect(200, 'Not found');
    }, 8000);

    afterEach(async () => {
      await app.close();
    });
  });

});
