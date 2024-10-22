import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
  Optional,
  StreamableFile,
} from '@nestjs/common';
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CACHE_KEY_METADATA,
  CACHE_MANAGER,
  CACHE_TTL_METADATA,
} from '../cache.constants';

/**
 * @see [Caching](https://docs.nestjs.com/techniques/caching)
 *
 * @publicApi
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  @Optional()
  @Inject()
  protected readonly httpAdapterHost: HttpAdapterHost;

  protected allowedMethods = ['GET'];

  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: any,
    protected readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key = this.trackBy(context);
    const ttlValueOrFactory =
      this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) ??
      this.reflector.get(CACHE_TTL_METADATA, context.getClass()) ??
      null;

    if (!key) {
      return next.handle();
    }
    try {
      const value = await this.cacheManager.get(key);
      this.setHeadersWhenHttp(context, value);

      if (!isNil(value)) {
        return of(value);
      }
      const ttl = isFunction(ttlValueOrFactory)
        ? await ttlValueOrFactory(context)
        : ttlValueOrFactory;

      return next.handle().pipe(
        tap(async response => {
          if (response instanceof StreamableFile) {
            return;
          }

          const args = [key, response];
          if (!isNil(ttl)) {
            args.push(ttl);
          }

          try {
            await this.cacheManager.set(...args);
          } catch (err) {
            Logger.error(
              `An error has occurred when inserting "key: ${key}", "value: ${response}"`,
              err.stack,
              'CacheInterceptor',
            );
          }
        }),
      );
    } catch {
      return next.handle();
    }
  }

  protected trackBy(context: ExecutionContext): string | undefined {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
    const cacheMetadata = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    if (!isHttpApp || cacheMetadata) {
      return cacheMetadata;
    }

    const request = context.getArgByIndex(0);
    if (!this.isRequestCacheable(context)) {
      return undefined;
    }
    return httpAdapter.getRequestUrl(request);
  }

  protected isRequestCacheable(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    return this.allowedMethods.includes(req.method);
  }

  protected setHeadersWhenHttp(context: ExecutionContext, value: any): void {
    if (!this.httpAdapterHost) {
      return;
    }
    const { httpAdapter } = this.httpAdapterHost;
    if (!httpAdapter) {
      return;
    }
    const response = context.switchToHttp().getResponse();
    httpAdapter.setHeader(response, 'X-Cache', isNil(value) ? 'MISS' : 'HIT');
  }
}
