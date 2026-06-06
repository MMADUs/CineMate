import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, like } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import { cinemas, movies, showtimes, studios } from '../database/schema';
import { StorageService } from '../storage/storage.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import {
  MovieDetailResponseDto,
  MovieResponseDto,
} from './dto/movie-response.dto';
import { QueryMovieDto } from './dto/query-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: MySql2Database<typeof schema>,
    private readonly storageService: StorageService,
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
    const result = filters.length
      ? await this.db
          .select()
          .from(movies)
          .where(and(...filters))
      : await this.db.select().from(movies);

    return result.map((movie) => this.toResponse(movie));
  }

  /* Find One Movie Service
   * @desc: Get movie detail by ID
   * @param: movieId
   * @returns: MovieDetailResponseDto
   */
  async findOne(movieId: number): Promise<MovieDetailResponseDto> {
    const [movie] = await this.db
      .select()
      .from(movies)
      .where(eq(movies.movieId, movieId));

    // check if movie doesn't exist
    if (!movie) throw new NotFoundException('Movie not found');

    const movieShowtimes = await this.db
      .select({
        showtime: showtimes,
        studio: studios,
        cinema: cinemas,
      })
      .from(showtimes)
      .innerJoin(studios, eq(showtimes.studioId, studios.studioId))
      .innerJoin(cinemas, eq(studios.cinemaId, cinemas.cinemaId))
      .where(eq(showtimes.movieId, movieId));

    return {
      ...this.toResponse(movie),
      showtimes: movieShowtimes.map((row) => ({
        ...row.showtime,
        studio: {
          ...row.studio,
          cinema: row.cinema,
        },
      })),
    };
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
        imageKey: dto.imageKey ?? '',
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

  /* To Response Helper
   * @desc: Map movie database row into API response with public image URL
   * @param: movie row
   * @returns: MovieResponseDto
   */
  private toResponse(movie: typeof movies.$inferSelect): MovieResponseDto {
    return {
      ...movie,
      imageUrl: this.storageService.buildImageUrl(movie.imageKey),
    };
  }
}
