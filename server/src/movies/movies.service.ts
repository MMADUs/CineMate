import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, like } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
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
    private readonly db: BetterSQLite3Database<typeof schema>,
  ) {}

  /* Find All Movies Service
   * @desc: List movies with optional status/search filters
   * @param: QueryMovieDto
   * @returns: MovieResponseDto[]
   */
  findAll(query: QueryMovieDto = {}): MovieResponseDto[] {
    // get query filters
    const filters = [
      query.status ? eq(movies.status, query.status) : undefined,
      query.search ? like(movies.title, `%${query.search}%`) : undefined,
    ].filter(Boolean);

    // apply filters
    return filters.length
      ? this.db
          .select()
          .from(movies)
          .where(and(...filters))
          .all()
      : this.db.select().from(movies).all();
  }

  /* Find One Movie Service
   * @desc: Get movie detail by ID
   * @param: movieId
   * @returns: MovieResponseDto
   */
  findOne(movieId: number): MovieResponseDto {
    const movie = this.db
      .select()
      .from(movies)
      .where(eq(movies.movieId, movieId))
      .get();

    // check if movie doesn't exist
    if (!movie) throw new NotFoundException('Movie not found');

    return movie;
  }

  /* Create Movie Service
   * @desc: Create a movie
   * @param: CreateMovieDto
   * @returns: MovieResponseDto
   */
  create(dto: CreateMovieDto): MovieResponseDto {
    // create movie
    const movie = this.db
      .insert(movies)
      .values({
        ...dto,
        posterUrl: dto.posterUrl ?? '',
        trailerUrl: dto.trailerUrl ?? '',
      })
      .returning()
      .get();

    return movie;
  }

  /* Update Movie Service
   * @desc: Update a movie by ID
   * @param: movieId, UpdateMovieDto
   * @returns: MovieResponseDto
   */
  update(movieId: number, dto: UpdateMovieDto): MovieResponseDto {
    const movie = this.db
      .update(movies)
      .set(dto)
      .where(eq(movies.movieId, movieId))
      .returning()
      .get();

    // check if movie doesn't exist
    if (!movie) throw new NotFoundException('Movie not found');

    return movie;
  }

  /* Remove Movie Service
   * @desc: Delete a movie by ID
   * @param: movieId
   * @returns: MovieResponseDto
   */
  remove(movieId: number): MovieResponseDto {
    const movie = this.db
      .delete(movies)
      .where(eq(movies.movieId, movieId))
      .returning()
      .get();

    // check if movie doesn't exist
    if (!movie) throw new NotFoundException('Movie not found');

    return movie;
  }
}
