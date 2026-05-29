import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AppRequestLog {
  event: 'http_request';
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  actor?: string;
  ip?: string;
  userAgent?: string;
  idempotencyKey?: boolean;
  error?: {
    name: string;
    message: string;
  };
}

@Injectable()
export class AppLoggingService {
  constructor(private readonly configService: ConfigService) {}

  /* Is Enabled Helper
   * @desc: Check whether application request logging is enabled
   * @param: none
   * @returns: boolean
   */
  isEnabled(): boolean {
    return this.configService.get<string>('APP_LOGGING_FLAG') === 'true';
  }

  /* Slow Threshold Helper
   * @desc: Get the minimum GET duration that should be logged
   * @param: none
   * @returns: number
   */
  getSlowThresholdMs(): number {
    return Number(
      this.configService.get<number>('APP_LOGGING_SLOW_MS') ?? 1000,
    );
  }

  /* Write Request Log Service
   * @desc: Write a concise structured request log to stdout/stderr
   * @param: AppRequestLog
   * @returns: void
   */
  writeRequestLog(log: AppRequestLog): void {
    const level = this.resolveLevel(log.statusCode, log.error);
    const payload = {
      ts: new Date().toISOString(),
      level,
      ...log,
    };
    const line = JSON.stringify(payload);

    if (level === 'error') {
      console.error(line);
      return;
    }

    if (level === 'warn') {
      console.warn(line);
      return;
    }

    console.log(line);
  }

  /* Resolve Level Helper
   * @desc: Convert status/error information into a log level
   * @param: status code, optional error
   * @returns: string
   */
  private resolveLevel(
    statusCode: number,
    error?: AppRequestLog['error'],
  ): 'info' | 'warn' | 'error' {
    if (error || statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';

    return 'info';
  }
}
