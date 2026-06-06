import { Module } from '@nestjs/common';
import { AppLoggingInterceptor } from './app-logging.interceptor';
import { AppLoggingService } from './app-logging.service';

@Module({
  providers: [AppLoggingInterceptor, AppLoggingService],
  exports: [AppLoggingInterceptor, AppLoggingService],
})
export class AppLoggingModule {}
