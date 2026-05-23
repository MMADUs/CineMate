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
import { CreateMovieDto } from './dto/create-movie.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { QueryMovieDto } from './dto/query-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoviesService } from './movies.service';

@Controller()
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  /* Find All Movies Controller
   * @desc: List public movies
   * @route: /movies
   * @param: QueryMovieDto
   * @returns: MovieResponseDto[]
   */
  @Get('movies')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: QueryMovieDto): MovieResponseDto[] {
    return this.moviesService.findAll(query);
  }

  /* Find One Movie Controller
   * @desc: Get public movie detail
   * @route: /movies/:movieId
   * @param: movieId
   * @returns: MovieResponseDto
   */
  @Get('movies/:movieId')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('movieId', ParseIntPipe) movieId: number): MovieResponseDto {
    return this.moviesService.findOne(movieId);
  }

  /* Admin Find All Movies Controller
   * @desc: List all movies for admin
   * @route: /admin/movies
   * @returns: MovieResponseDto[]
   */
  @UseGuards(AdminJwtGuard)
  @Get('admin/movies')
  @HttpCode(HttpStatus.OK)
  adminFindAll(): MovieResponseDto[] {
    return this.moviesService.findAll({});
  }

  /* Create Movie Controller
   * @desc: Create a movie
   * @route: /admin/movies
   * @param: CreateMovieDto
   * @returns: MovieResponseDto
   */
  @UseGuards(AdminJwtGuard)
  @Post('admin/movies')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateMovieDto): MovieResponseDto {
    return this.moviesService.create(dto);
  }

  /* Update Movie Controller
   * @desc: Update a movie
   * @route: /admin/movies/:movieId
   * @param: movieId, UpdateMovieDto
   * @returns: MovieResponseDto
   */
  @UseGuards(AdminJwtGuard)
  @Put('admin/movies/:movieId')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('movieId', ParseIntPipe) movieId: number,
    @Body() dto: UpdateMovieDto,
  ): MovieResponseDto {
    return this.moviesService.update(movieId, dto);
  }

  /* Remove Movie Controller
   * @desc: Delete a movie
   * @route: /admin/movies/:movieId
   * @param: movieId
   * @returns: MovieResponseDto
   */
  @UseGuards(AdminJwtGuard)
  @Delete('admin/movies/:movieId')
  @HttpCode(HttpStatus.OK)
  remove(@Param('movieId', ParseIntPipe) movieId: number): MovieResponseDto {
    return this.moviesService.remove(movieId);
  }
}
