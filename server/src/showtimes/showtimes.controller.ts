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
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { QueryShowtimeDto } from './dto/query-showtime.dto';
import {
  ShowtimeResponseDto,
  ShowtimeSeatsResponseDto,
} from './dto/showtime-response.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { ShowtimesService } from './showtimes.service';

@ApiTags('Showtimes')
@Controller()
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  /* Find All Showtimes Controller
   * @desc: List public showtimes
   * @route: /showtimes
   * @param: QueryShowtimeDto
   * @returns: Promise<ShowtimeResponseDto[]>
   */
  @Get('showtimes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List public showtimes' })
  @ApiOkResponse({ type: [ShowtimeResponseDto] })
  findAll(@Query() query: QueryShowtimeDto): Promise<ShowtimeResponseDto[]> {
    return this.showtimesService.findAll(query);
  }

  /* Get Showtime Seats Controller
   * @desc: Get studio layout and seat availability
   * @route: /showtimes/:showtimeId/seats
   * @param: showtimeId
   * @returns: Promise<ShowtimeSeatsResponseDto>
   */
  @Get('showtimes/:showtimeId/seats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get showtime seat availability' })
  @ApiOkResponse({ type: ShowtimeSeatsResponseDto })
  getSeats(
    @Param('showtimeId', ParseIntPipe) showtimeId: number,
  ): Promise<ShowtimeSeatsResponseDto> {
    return this.showtimesService.getSeats(showtimeId);
  }

  /* Admin Find All Showtimes Controller
   * @desc: List all showtimes for admin
   * @route: /admin/showtimes
   * @returns: Promise<ShowtimeResponseDto[]>
   */
  @UseGuards(AdminJwtGuard)
  @Get('admin/showtimes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all showtimes for admin' })
  @ApiOkResponse({ type: [ShowtimeResponseDto] })
  adminFindAll(): Promise<ShowtimeResponseDto[]> {
    return this.showtimesService.findAll({});
  }

  /* Create Showtime Controller
   * @desc: Create a showtime
   * @route: /admin/showtimes
   * @param: CreateShowtimeDto
   * @returns: Promise<ShowtimeResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Post('admin/showtimes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create showtime' })
  @ApiCreatedResponse({ type: ShowtimeResponseDto })
  create(@Body() dto: CreateShowtimeDto): Promise<ShowtimeResponseDto> {
    return this.showtimesService.create(dto);
  }

  /* Update Showtime Controller
   * @desc: Update a showtime
   * @route: /admin/showtimes/:showtimeId
   * @param: showtimeId, UpdateShowtimeDto
   * @returns: Promise<ShowtimeResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Put('admin/showtimes/:showtimeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update showtime' })
  @ApiOkResponse({ type: ShowtimeResponseDto })
  update(
    @Param('showtimeId', ParseIntPipe) showtimeId: number,
    @Body() dto: UpdateShowtimeDto,
  ): Promise<ShowtimeResponseDto> {
    return this.showtimesService.update(showtimeId, dto);
  }

  /* Remove Showtime Controller
   * @desc: Delete a showtime
   * @route: /admin/showtimes/:showtimeId
   * @param: showtimeId
   * @returns: Promise<ShowtimeResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Delete('admin/showtimes/:showtimeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete showtime' })
  @ApiOkResponse({ type: ShowtimeResponseDto })
  remove(
    @Param('showtimeId', ParseIntPipe) showtimeId: number,
  ): Promise<ShowtimeResponseDto> {
    return this.showtimesService.remove(showtimeId);
  }
}
