import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { CinemaHallsService } from './cinema-halls.service';
import { CreateHallDto } from './dto/create-hall.dto';
import { HallResponseDto } from './dto/hall-response.dto';
import { UpdateHallDto } from './dto/update-hall.dto';

@UseGuards(AdminJwtGuard)
@ApiTags('Cinema Halls')
@Controller('admin/halls')
export class CinemaHallsController {
  constructor(private readonly cinemaHallsService: CinemaHallsService) {}

  /* Find All Halls Controller
   * @desc: List all cinema halls
   * @route: /admin/halls
   * @returns: Promise<HallResponseDto[]>
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List cinema halls' })
  @ApiOkResponse({ type: [HallResponseDto] })
  findAll(): Promise<HallResponseDto[]> {
    return this.cinemaHallsService.findAll();
  }

  /* Create Hall Controller
   * @desc: Create a cinema hall and generate seats
   * @route: /admin/halls
   * @param: CreateHallDto
   * @returns: Promise<HallResponseDto>
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create cinema hall and generate seats' })
  @ApiCreatedResponse({ type: HallResponseDto })
  create(@Body() dto: CreateHallDto): Promise<HallResponseDto> {
    return this.cinemaHallsService.create(dto);
  }

  /* Update Hall Controller
   * @desc: Update a cinema hall
   * @route: /admin/halls/:hallId
   * @param: hallId, UpdateHallDto
   * @returns: Promise<HallResponseDto>
   */
  @Put(':hallId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update cinema hall' })
  @ApiOkResponse({ type: HallResponseDto })
  update(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Body() dto: UpdateHallDto,
  ): Promise<HallResponseDto> {
    return this.cinemaHallsService.update(hallId, dto);
  }

  /* Remove Hall Controller
   * @desc: Delete a cinema hall
   * @route: /admin/halls/:hallId
   * @param: hallId
   * @returns: Promise<HallResponseDto>
   */
  @Delete(':hallId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete cinema hall' })
  @ApiOkResponse({ type: HallResponseDto })
  remove(
    @Param('hallId', ParseIntPipe) hallId: number,
  ): Promise<HallResponseDto> {
    return this.cinemaHallsService.remove(hallId);
  }
}
