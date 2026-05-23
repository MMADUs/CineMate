import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAccessGuard } from '../common/guards/jwt-access.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { CreateFnbOrderDto } from './dto/create-fnb-order.dto';
import { FnbOrderResponseDto } from './dto/fnb-order-response.dto';
import { FnbOrdersService } from './fnb-orders.service';

@UseGuards(JwtAccessGuard)
@ApiTags('F&B Orders')
@Controller('fnb-orders')
export class FnbOrdersController {
  constructor(private readonly fnbOrdersService: FnbOrdersService) {}

  /* Create FNB Order Controller
   * @desc: Create an F&B order
   * @route: /fnb-orders
   * @param: AuthUser, CreateFnbOrderDto
   * @returns: FnbOrderResponseDto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create F&B order' })
  @ApiCreatedResponse({ type: FnbOrderResponseDto })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateFnbOrderDto,
  ): FnbOrderResponseDto {
    return this.fnbOrdersService.create(user.userId, dto);
  }
}
