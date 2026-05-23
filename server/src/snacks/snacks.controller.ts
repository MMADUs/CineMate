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
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { CreateSnackDto } from './dto/create-snack.dto';
import { QuerySnackDto } from './dto/query-snack.dto';
import { SnackResponseDto } from './dto/snack-response.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';
import { SnacksService } from './snacks.service';

@Controller()
export class SnacksController {
  constructor(private readonly snacksService: SnacksService) {}

  /* Find All Snacks Controller
   * @desc: List public snacks
   * @route: /snacks
   * @param: QuerySnackDto
   * @returns: SnackResponseDto[]
   */
  @Get('snacks')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: QuerySnackDto): SnackResponseDto[] {
    return this.snacksService.findAll(query);
  }

  /* Admin Find All Snacks Controller
   * @desc: List all snacks for admin
   * @route: /admin/snacks
   * @returns: SnackResponseDto[]
   */
  @UseGuards(AdminJwtGuard)
  @Get('admin/snacks')
  @HttpCode(HttpStatus.OK)
  adminFindAll(): SnackResponseDto[] {
    return this.snacksService.findAll({});
  }

  /* Create Snack Controller
   * @desc: Create a snack
   * @route: /admin/snacks
   * @param: CreateSnackDto
   * @returns: SnackResponseDto
   */
  @UseGuards(AdminJwtGuard)
  @Post('admin/snacks')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSnackDto): SnackResponseDto {
    return this.snacksService.create(dto);
  }

  /* Update Snack Controller
   * @desc: Update a snack
   * @route: /admin/snacks/:snackId
   * @param: snackId, UpdateSnackDto
   * @returns: SnackResponseDto
   */
  @UseGuards(AdminJwtGuard)
  @Put('admin/snacks/:snackId')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('snackId', ParseIntPipe) snackId: number,
    @Body() dto: UpdateSnackDto,
  ): SnackResponseDto {
    return this.snacksService.update(snackId, dto);
  }

  /* Remove Snack Controller
   * @desc: Delete a snack
   * @route: /admin/snacks/:snackId
   * @param: snackId
   * @returns: SnackResponseDto
   */
  @UseGuards(AdminJwtGuard)
  @Delete('admin/snacks/:snackId')
  @HttpCode(HttpStatus.OK)
  remove(@Param('snackId', ParseIntPipe) snackId: number): SnackResponseDto {
    return this.snacksService.remove(snackId);
  }
}
