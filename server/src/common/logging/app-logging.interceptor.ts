import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AppLoggingService } from './app-logging.service';

type RequestWithUser = Request & {
  user?: { userId?: string; adminId?: number };
};

@Injectable()
export class AppLoggingInterceptor implements NestInterceptor {
  constructor(private readonly appLoggingService: AppLoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.appLoggingService.isEnabled()) {
      return next.handle() as Observable<unknown>;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse<Response>();
    const requestId = this.getRequestId(request);
    const startedAt = Date.now();

    response.setHeader('X-Request-Id', requestId);

    return (next.handle() as Observable<unknown>).pipe(
      tap(() => {
        this.logRequest(request, response, requestId, startedAt);
      }),
      catchError((error: unknown) => {
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;
        this.logRequest(
          request,
          response,
          requestId,
          startedAt,
          error,
          statusCode,
        );

        return throwError(() => error);
      }),
    );
  }

  /* Log Request Helper
   * @desc: Write a request log only for meaningful operational events
   * @param: request, response, request ID, start time, optional error/status
   * @returns: void
   */
  private logRequest(
    request: RequestWithUser,
    response: Response,
    requestId: string,
    startedAt: number,
    error?: unknown,
    errorStatusCode?: number,
  ): void {
    const statusCode = errorStatusCode ?? response.statusCode;
    const durationMs = Date.now() - startedAt;

    if (
      !this.shouldLog(request.method, statusCode, durationMs, Boolean(error))
    ) {
      return;
    }

    this.appLoggingService.writeRequestLog({
      event: 'http_request',
      requestId,
      method: request.method,
      path: request.originalUrl.split('?')[0],
      statusCode,
      durationMs,
      actor: this.getActor(request),
      ip: this.getClientIp(request),
      userAgent: request.get('user-agent'),
      idempotencyKey: Boolean(request.header('Idempotency-Key')),
      error: error ? this.serializeError(error) : undefined,
    });
  }

  /* Should Log Helper
   * @desc: Keep logs focused on mutating requests, errors, and slow GETs
   * @param: method, status code, duration, error state
   * @returns: boolean
   */
  private shouldLog(
    method: string,
    statusCode: number,
    durationMs: number,
    hasError: boolean,
  ): boolean {
    if (hasError || statusCode >= 400) return true;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return true;

    return (
      method === 'GET' &&
      durationMs >= this.appLoggingService.getSlowThresholdMs()
    );
  }

  /* Get Request ID Helper
   * @desc: Use incoming request ID when present, otherwise generate one
   * @param: request
   * @returns: string
   */
  private getRequestId(request: Request): string {
    const requestId = request.header('X-Request-Id');

    return requestId?.trim() || randomUUID();
  }

  /* Get Actor Helper
   * @desc: Resolve authenticated user/admin identity for logs
   * @param: request
   * @returns: string | undefined
   */
  private getActor(request: RequestWithUser): string | undefined {
    if (request.user?.userId) return `user:${request.user.userId}`;
    if (request.user?.adminId) return `admin:${request.user.adminId}`;

    return undefined;
  }

  /* Get Client IP Helper
   * @desc: Resolve the best available client IP
   * @param: request
   * @returns: string | undefined
   */
  private getClientIp(request: Request): string | undefined {
    const forwardedFor = request
      .header('x-forwarded-for')
      ?.split(',')[0]
      ?.trim();

    return forwardedFor || request.ip;
  }

  /* Serialize Error Helper
   * @desc: Keep error logs short and avoid stack traces in request logs
   * @param: error
   * @returns: serialized error
   */
  private serializeError(error: unknown): { name: string; message: string } {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
      };
    }

    return {
      name: 'Error',
      message: 'Unknown error',
    };
  }
}
