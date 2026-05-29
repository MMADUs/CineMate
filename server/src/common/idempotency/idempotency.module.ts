import { Module } from '@nestjs/common';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { IdempotencyService } from './idempotency.service';

@Module({
  providers: [IdempotencyInterceptor, IdempotencyService],
  exports: [IdempotencyInterceptor, IdempotencyService],
})
export class IdempotencyModule {}
