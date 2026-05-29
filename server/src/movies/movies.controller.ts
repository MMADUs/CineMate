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
import { CreateMovieDto } from './dto/create-movie.dto';
import {
  MovieDetailResponseDto,
  MovieResponseDto,
} from './dto/movie-response.dto';
import { QueryMovieDto } from './dto/query-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoviesService } from './movies.service';

@ApiTags('Movies')
@Controller()
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  /* Find All Movies Controller
   * @desc: List public movies
   * @route: /movies
   * @param: QueryMovieDto
   * @returns: Promise<MovieResponseDto[]>
   */
  @Get('movies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List public movies' })
  @ApiOkResponse({ type: [MovieResponseDto] })
  findAll(@Query() query: QueryMovieDto): Promise<MovieResponseDto[]> {
    return this.moviesService.findAll(query);
  }

  /* Find One Movie Controller
   * @desc: Get public movie detail
   * @route: /movies/:movieId
   * @param: movieId
   * @returns: Promise<MovieDetailResponseDto>
   */
  @Get('movies/:movieId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get movie detail' })
  @ApiOkResponse({ type: MovieDetailResponseDto })
  findOne(
    @Param('movieId', ParseIntPipe) movieId: number,
  ): Promise<MovieDetailResponseDto> {
    return this.moviesService.findOne(movieId);
  }

  /* Admin Find All Movies Controller
   * @desc: List all movies for admin
   * @route: /admin/movies
   * @returns: Promise<MovieResponseDto[]>
   */
  @UseGuards(AdminJwtGuard)
  @Get('admin/movies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all movies for admin' })
  @ApiOkResponse({ type: [MovieResponseDto] })
  adminFindAll(): Promise<MovieResponseDto[]> {
    return this.moviesService.findAll({});
  }

  /* Create Movie Controller
   * @desc: Create a movie
   * @route: /admin/movies
   * @param: CreateMovieDto
   * @returns: Promise<MovieResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Post('admin/movies')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create movie' })
  @ApiCreatedResponse({ type: MovieResponseDto })
  create(@Body() dto: CreateMovieDto): Promise<MovieResponseDto> {
    return this.moviesService.create(dto);
  }

  /* Update Movie Controller
   * @desc: Update a movie
   * @route: /admin/movies/:movieId
   * @param: movieId, UpdateMovieDto
   * @returns: Promise<MovieResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Put('admin/movies/:movieId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update movie' })
  @ApiOkResponse({ type: MovieResponseDto })
  update(
    @Param('movieId', ParseIntPipe) movieId: number,
    @Body() dto: UpdateMovieDto,
  ): Promise<MovieResponseDto> {
    return this.moviesService.update(movieId, dto);
  }

  /* Remove Movie Controller
   * @desc: Delete a movie
   * @route: /admin/movies/:movieId
   * @param: movieId
   * @returns: Promise<MovieResponseDto>
   */
  @UseGuards(AdminJwtGuard)
  @Delete('admin/movies/:movieId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete movie' })
  @ApiOkResponse({ type: MovieResponseDto })
  remove(
    @Param('movieId', ParseIntPipe) movieId: number,
  ): Promise<MovieResponseDto> {
    return this.moviesService.remove(movieId);
  }
}
