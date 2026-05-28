import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  { success: boolean; data: T }
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ success: boolean; data: T }> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof StreamableFile) return data;

        return { success: true, data };
      }),
    ) as Observable<{ success: boolean; data: T }>;
  }
}
