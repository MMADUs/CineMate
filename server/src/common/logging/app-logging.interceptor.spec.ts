import { HttpException, HttpStatus } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { AppLoggingInterceptor } from './app-logging.interceptor';
import type { AppLoggingService } from './app-logging.service';

interface AppLoggingServiceMock {
  isEnabled: jest.MockedFunction<() => boolean>;
  getSlowThresholdMs: jest.MockedFunction<() => number>;
  writeRequestLog: jest.MockedFunction<(log: unknown) => void>;
}

describe('AppLoggingInterceptor', () => {
  const createContext = (method: string, statusCode = 200) => {
    const request = {
      method,
      originalUrl: '/api/test?x=1',
      ip: '127.0.0.1',
      user: { userId: '550e8400-e29b-41d4-a716-446655440000' },
      header: jest.fn((name: string) => {
        const headers: Record<string, string> = {
          'user-agent': 'jest',
          'x-forwarded-for': '10.0.0.1',
        };
        return headers[name.toLowerCase()];
      }),
      get: jest.fn((name: string) =>
        name === 'user-agent' ? 'jest' : undefined,
      ),
    };
    const response = {
      statusCode,
      setHeader: jest.fn(),
    };

    return {
      context: {
        switchToHttp: () => ({
          getRequest: () => request,
          getResponse: () => response,
        }),
      } as unknown as ExecutionContext,
      response,
    };
  };

  const createInterceptor = () => {
    const service: AppLoggingServiceMock = {
      isEnabled: jest.fn(() => true),
      getSlowThresholdMs: jest.fn(() => 1000),
      writeRequestLog: jest.fn(() => undefined),
    };

    return {
      service,
      interceptor: new AppLoggingInterceptor(
        service as unknown as AppLoggingService,
      ),
    };
  };

  it('logs successful mutating requests', async () => {
    const { service, interceptor } = createInterceptor();
    const { context, response } = createContext('POST', 201);

    await lastValueFrom(
      interceptor.intercept(context, { handle: () => of({ ok: true }) }),
    );

    expect(response.setHeader).toHaveBeenCalledWith(
      'X-Request-Id',
      expect.any(String),
    );
    expect(service.writeRequestLog).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        statusCode: 201,
        actor: 'user:550e8400-e29b-41d4-a716-446655440000',
      }),
    );
  });

  it('does not log fast successful GET requests', async () => {
    const { service, interceptor } = createInterceptor();
    const { context } = createContext('GET', 200);

    await lastValueFrom(
      interceptor.intercept(context, { handle: () => of({ ok: true }) }),
    );

    expect(service.writeRequestLog).not.toHaveBeenCalled();
  });

  it('logs failed requests with short error details', async () => {
    const { service, interceptor } = createInterceptor();
    const { context } = createContext('GET', 200);
    const error = new HttpException('Nope', HttpStatus.BAD_REQUEST);

    await expect(
      lastValueFrom(
        interceptor.intercept(context, {
          handle: () => throwError(() => error),
        }),
      ),
    ).rejects.toBe(error);
    const logged = service.writeRequestLog.mock.calls[0]?.[0] as {
      method: string;
      statusCode: number;
      error?: { name: string };
    };

    expect(logged).toMatchObject({
      method: 'GET',
      statusCode: 400,
    });
    expect(logged.error?.name).toBe('HttpException');
  });
});
