import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_CLEAN_METADATA, CACHE_MANAGER } from '../cache.constants';

/**
 * Interceptor that cleans (removes) cache entries when a route returns
 * a successful response.
 *
 * @see [Caching](https://docs.nestjs.com/techniques/caching)
 *
 * @publicApi
 */
@Injectable()
export class CacheCleanInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: any,
    protected readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const cacheCleanKey = this.reflector.get(
      CACHE_CLEAN_METADATA,
      context.getHandler(),
    );

    if (!cacheCleanKey) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async response => {
        try {
          const httpContext = context.switchToHttp();
          const httpResponse = httpContext.getResponse();

          const isSuccessfulResponse = this.isSuccessfulResponse(
            httpResponse,
            response,
          );

          if (isSuccessfulResponse) {
            await this.cacheManager.del(cacheCleanKey);
          }
        } catch (err) {
          Logger.error(
            `An error has occurred when cleaning cache key: ${cacheCleanKey}`,
            err.stack,
            'CacheCleanInterceptor',
          );
        }
      }),
    );
  }

  private isSuccessfulResponse(httpResponse: any, response: any): boolean {
    if (httpResponse && httpResponse.statusCode) {
      return httpResponse.statusCode >= 200 && httpResponse.statusCode < 300;
    }

    if (response !== null && response !== undefined) {
      if (response instanceof Error) {
        return false;
      }

      if (response.error || response.statusCode >= 400) {
        return false;
      }

      return true;
    }

    return false;
  }
}
