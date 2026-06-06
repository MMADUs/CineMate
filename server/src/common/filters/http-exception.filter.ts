import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // get http response context
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // get status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // get error body
    const body =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // send response
    response.status(status).json({
      success: false,
      error: typeof body === 'string' ? { message: body } : body,
    });
  }
}
