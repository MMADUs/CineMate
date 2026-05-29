import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Idempotent } from '../common/decorators/idempotent.decorator';
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
   * @returns: Promise<FnbOrderResponseDto>
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Idempotent()
  @ApiOperation({ summary: 'Create F&B order' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description:
      'Required only when IDEMPOTENCY_FLAG=true. Reuse the same UUID for retries of the same F&B order request.',
  })
  @ApiCreatedResponse({ type: FnbOrderResponseDto })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateFnbOrderDto,
  ): Promise<FnbOrderResponseDto> {
    return this.fnbOrdersService.create(user.userId, dto);
  }

  /* Find User FNB Orders Controller
   * @desc: List authenticated user's F&B orders
   * @route: /fnb-orders
   * @param: AuthUser
   * @returns: Promise<FnbOrderResponseDto[]>
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List authenticated user's F&B orders" })
  @ApiOkResponse({ type: [FnbOrderResponseDto] })
  findMine(@CurrentUser() user: AuthUser): Promise<FnbOrderResponseDto[]> {
    return this.fnbOrdersService.findUserOrders(user.userId);
  }

  /* Find User FNB Order Controller
   * @desc: Get authenticated user's F&B order detail
   * @route: /fnb-orders/:fnbOrderId
   * @param: AuthUser, fnbOrderId
   * @returns: Promise<FnbOrderResponseDto>
   */
  @Get(':fnbOrderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get authenticated user's F&B order detail" })
  @ApiOkResponse({ type: FnbOrderResponseDto })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('fnbOrderId') fnbOrderId: string,
  ): Promise<FnbOrderResponseDto> {
    return this.fnbOrdersService.findUserOrder(user.userId, fnbOrderId);
  }
}
