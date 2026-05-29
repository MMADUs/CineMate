import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { FnbOrdersController } from './fnb-orders.controller';
import { FnbOrdersService } from './fnb-orders.service';

@Module({
  imports: [PaymentsModule],
  controllers: [FnbOrdersController],
  providers: [FnbOrdersService],
})
export class FnbOrdersModule {}
