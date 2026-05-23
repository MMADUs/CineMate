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
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { CinemaHallsService } from './cinema-halls.service';
import { CreateHallDto } from './dto/create-hall.dto';
import { HallResponseDto } from './dto/hall-response.dto';
import { UpdateHallDto } from './dto/update-hall.dto';

@UseGuards(AdminJwtGuard)
@Controller('admin/halls')
export class CinemaHallsController {
  constructor(private readonly cinemaHallsService: CinemaHallsService) {}

  /* Find All Halls Controller
   * @desc: List all cinema halls
   * @route: /admin/halls
   * @returns: HallResponseDto[]
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): HallResponseDto[] {
    return this.cinemaHallsService.findAll();
  }

  /* Create Hall Controller
   * @desc: Create a cinema hall and generate seats
   * @route: /admin/halls
   * @param: CreateHallDto
   * @returns: HallResponseDto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateHallDto): HallResponseDto {
    return this.cinemaHallsService.create(dto);
  }

  /* Update Hall Controller
   * @desc: Update a cinema hall
   * @route: /admin/halls/:hallId
   * @param: hallId, UpdateHallDto
   * @returns: HallResponseDto
   */
  @Put(':hallId')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Body() dto: UpdateHallDto,
  ): HallResponseDto {
    return this.cinemaHallsService.update(hallId, dto);
  }

  /* Remove Hall Controller
   * @desc: Delete a cinema hall
   * @route: /admin/halls/:hallId
   * @param: hallId
   * @returns: HallResponseDto
   */
  @Delete(':hallId')
  @HttpCode(HttpStatus.OK)
  remove(@Param('hallId', ParseIntPipe) hallId: number): HallResponseDto {
    return this.cinemaHallsService.remove(hallId);
  }
}
