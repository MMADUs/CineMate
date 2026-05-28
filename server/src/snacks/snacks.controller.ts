import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { CreateSnackDto } from './dto/create-snack.dto';
import { QuerySnackDto } from './dto/query-snack.dto';
import { SnackResponseDto } from './dto/snack-response.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';
import { SnacksService } from './snacks.service';

@ApiTags('Snacks')
@Controller()
export class SnacksController {
  constructor(private readonly snacksService: SnacksService) {}

  /* Find All Snacks Controller
   * @desc: List public snacks
   * @route: /snacks
   * @param: QuerySnackDto
   * @returns: Promise<SnackResponseDto[]>
   */
  @Get('snacks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List public snacks' })
  @ApiOkResponse({ type: [SnackResponseDto] })
  findAll(@Query() query: QuerySnackDto): Promise<SnackResponseDto[]> {
    return this.snacksService.findAll(query);
  }

  /* Admin Find All Snacks Controller
   * @desc: List all snacks for admin
   * @route: /admin/snacks
   * @returns: Promise<SnackResponseDto[]>
   */
  @UseGuards(AdminJwtGuard)
  @Get('admin/snacks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all snacks for admin' })
  @ApiOkResponse({ type: [SnackResponseDto] })
  adminFindAll(): Promise<SnackResponseDto[]> {
    return this.snacksService.findAll({});
  }

  /* Create Snack Controller
   * @desc: Create a snack
   * @route: /admin/snacks
   * @param: CreateSnackDto
   * @returns: Promise<SnackResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Post('admin/snacks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create snack' })
  @ApiCreatedResponse({ type: SnackResponseDto })
  create(@Body() dto: CreateSnackDto): Promise<SnackResponseDto> {
    return this.snacksService.create(dto);
  }

  /* Update Snack Controller
   * @desc: Update a snack
   * @route: /admin/snacks/:snackId
   * @param: snackId, UpdateSnackDto
   * @returns: Promise<SnackResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Put('admin/snacks/:snackId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update snack' })
  @ApiOkResponse({ type: SnackResponseDto })
  update(
    @Param('snackId', ParseIntPipe) snackId: number,
    @Body() dto: UpdateSnackDto,
  ): Promise<SnackResponseDto> {
    return this.snacksService.update(snackId, dto);
  }

  /* Remove Snack Controller
   * @desc: Delete a snack
   * @route: /admin/snacks/:snackId
   * @param: snackId
   * @returns: Promise<SnackResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Delete('admin/snacks/:snackId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete snack' })
  @ApiOkResponse({ type: SnackResponseDto })
  remove(
    @Param('snackId', ParseIntPipe) snackId: number,
  ): Promise<SnackResponseDto> {
    return this.snacksService.remove(snackId);
  }
}
