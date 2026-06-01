import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { CinemasService } from './cinemas.service';
import { CinemaResponseDto } from './dto/cinema-response.dto';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';

@UseGuards(AdminJwtGuard)
@ApiTags('Cinemas')
@Controller('admin/cinemas')
export class CinemasController {
  constructor(private readonly cinemasService: CinemasService) {}

  /* Find All Cinemas Controller
   * @desc: List all cinemas
   * @route: /admin/cinemas
   * @returns: Promise<CinemaResponseDto[]>
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List cinemas' })
  @ApiOkResponse({ type: [CinemaResponseDto] })
  findAll(): Promise<CinemaResponseDto[]> {
    return this.cinemasService.findAll();
  }

  /* Create Cinema Controller
   * @desc: Create a cinema
   * @route: /admin/cinemas
   * @param: CreateCinemaDto
   * @returns: Promise<CinemaResponseDto>
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create cinema' })
  @ApiCreatedResponse({ type: CinemaResponseDto })
  create(@Body() dto: CreateCinemaDto): Promise<CinemaResponseDto> {
    return this.cinemasService.create(dto);
  }

  /* Update Cinema Controller
   * @desc: Update a cinema
   * @route: /admin/cinemas/:cinemaId
   * @param: cinemaId, UpdateCinemaDto
   * @returns: Promise<CinemaResponseDto>
   */
  @Put(':cinemaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update cinema' })
  @ApiOkResponse({ type: CinemaResponseDto })
  update(
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
    @Body() dto: UpdateCinemaDto,
  ): Promise<CinemaResponseDto> {
    return this.cinemasService.update(cinemaId, dto);
  }

  /* Remove Cinema Controller
   * @desc: Delete a cinema
   * @route: /admin/cinemas/:cinemaId
   * @param: cinemaId
   * @returns: Promise<CinemaResponseDto>
   */
  @Delete(':cinemaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete cinema' })
  @ApiOkResponse({ type: CinemaResponseDto })
  remove(
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
  ): Promise<CinemaResponseDto> {
    return this.cinemasService.remove(cinemaId);
  }
}
