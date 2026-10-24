import { INestApplication } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import { Test } from '@nestjs/testing';
import { defer, lastValueFrom, of } from 'rxjs';
import { CacheInterceptor } from '../../lib/index.js';
import { NonHttpContextController } from '../src/non-http-context/non-http-context.controller.js';
import { NonHttpContextModule } from '../src/non-http-context/non-http-context.module.js';

describe('Caching non-HTTP contexts', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [NonHttpContextModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it.each(['rpc', 'ws'] as const)(
    'should cache %s handlers in an HTTP app',
    async type => {
      const interceptor = app.get(CacheInterceptor);
      const controller = app.get(NonHttpContextController);
      const context = new ExecutionContextHost(
        [{}, {}],
        NonHttpContextController,
        controller.getNumber,
      );
      context.setType(type);
      const next = { handle: () => defer(() => of(controller.getNumber())) };

      await lastValueFrom(await interceptor.intercept(context, next));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(
        await lastValueFrom(await interceptor.intercept(context, next)),
      ).toBe(0);
    },
  );

  afterEach(async () => {
    await app.close();
  });
});
