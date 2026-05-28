import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import {
  catchError,
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { IDEMPOTENT_METADATA_KEY } from '../decorators/idempotent.decorator';
import { IdempotencyService } from './idempotency.service';

type RequestWithUser = Request & { user?: unknown };

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isIdempotent = this.reflector.getAllAndOverride<boolean>(
      IDEMPOTENT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isIdempotent || !this.idempotencyService.isEnabled()) {
      return next.handle() as Observable<unknown>;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse<Response>();
    const key = request.header('Idempotency-Key');

    if (!key) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    const scope = this.idempotencyService.buildScope(request.user);
    const method = request.method;
    const route = request.originalUrl.split('?')[0];
    const requestHash = this.idempotencyService.hashRequest(
      method,
      route,
      request.body,
    );

    return from(
      this.idempotencyService.createProcessingRecord({
        key,
        scope,
        method,
        route,
        requestHash,
      }),
    ).pipe(
      switchMap((record) => {
        if (!record) {
          return from(this.idempotencyService.findRecord(scope, key)).pipe(
            switchMap((existing) => {
              const cachedBody = this.idempotencyService.resolveDuplicateRecord(
                existing,
                requestHash,
              );

              if (existing?.responseStatus)
                response.status(existing.responseStatus);

              return of(cachedBody);
            }),
          );
        }

        return (next.handle() as Observable<unknown>).pipe(
          mergeMap((body) =>
            from(
              this.idempotencyService.completeRecord(
                record.idempotencyKeyId,
                response.statusCode,
                body,
              ),
            ).pipe(map((): unknown => body)),
          ),
          catchError((error: unknown) => {
            void this.idempotencyService.failRecord(record.idempotencyKeyId);
            return throwError(() => error);
          }),
        );
      }),
    );
  }
}
