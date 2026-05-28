import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, like } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import { movies } from '../database/schema';
import { CreateMovieDto } from './dto/create-movie.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { QueryMovieDto } from './dto/query-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: MySql2Database<typeof schema>,
  ) {}

  /* Find All Movies Service
   * @desc: List movies with optional status/search filters
   * @param: QueryMovieDto
   * @returns: MovieResponseDto[]
   */
  async findAll(query: QueryMovieDto = {}): Promise<MovieResponseDto[]> {
    // get query filters
    const filters = [
      query.status ? eq(movies.status, query.status) : undefined,
      query.search ? like(movies.title, `%${query.search}%`) : undefined,
    ].filter(Boolean);

    // apply filters
    return filters.length
      ? await this.db
          .select()
          .from(movies)
          .where(and(...filters))
      : await this.db.select().from(movies);
  }

  /* Find One Movie Service
   * @desc: Get movie detail by ID
   * @param: movieId
   * @returns: MovieResponseDto
   */
  async findOne(movieId: number): Promise<MovieResponseDto> {
    const [movie] = await this.db
      .select()
      .from(movies)
      .where(eq(movies.movieId, movieId));

    // check if movie doesn't exist
    if (!movie) throw new NotFoundException('Movie not found');

    return movie;
  }

  /* Create Movie Service
   * @desc: Create a movie
   * @param: CreateMovieDto
   * @returns: MovieResponseDto
   */
  async create(dto: CreateMovieDto): Promise<MovieResponseDto> {
    // create movie
    const [insertedMovie] = await this.db
      .insert(movies)
      .values({
        ...dto,
        posterUrl: dto.posterUrl ?? '',
        trailerUrl: dto.trailerUrl ?? '',
      })
      .$returningId();

    return this.findOne(insertedMovie.movieId);
  }

  /* Update Movie Service
   * @desc: Update a movie by ID
   * @param: movieId, UpdateMovieDto
   * @returns: MovieResponseDto
   */
  async update(
    movieId: number,
    dto: UpdateMovieDto,
  ): Promise<MovieResponseDto> {
    await this.findOne(movieId);
    await this.db.update(movies).set(dto).where(eq(movies.movieId, movieId));

    return this.findOne(movieId);
  }

  /* Remove Movie Service
   * @desc: Delete a movie by ID
   * @param: movieId
   * @returns: MovieResponseDto
   */
  async remove(movieId: number): Promise<MovieResponseDto> {
    const movie = await this.findOne(movieId);
    await this.db.delete(movies).where(eq(movies.movieId, movieId));

    return movie;
  }
}
