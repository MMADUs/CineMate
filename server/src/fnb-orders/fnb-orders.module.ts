import { Module } from '@nestjs/common';
import { FnbOrdersController } from './fnb-orders.controller';
import { FnbOrdersService } from './fnb-orders.service';

@Module({ controllers: [FnbOrdersController], providers: [FnbOrdersService] })
export class FnbOrdersModule {}
