import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import {
  insertReturning,
  mutation,
  selectWhere,
} from '../test-utils/mock-drizzle';

describe('Movies feature', () => {
  const movie = {
    movieId: 1,
    title: 'Interstellar',
    description: 'Space',
    genre: 'Sci-Fi',
    ageRate: 'PG-13',
    durationMinutes: 169,
    imageKey: 'movies/135c66f9-c917-43b9-a869-a5f5dc08efcc.jpg',
    imageUrl:
      'http://localhost:3000/api/assets/images/movies/135c66f9-c917-43b9-a869-a5f5dc08efcc.jpg',
    trailerUrl: '',
    releaseDate: '2026-05-01',
    endDate: '2026-06-01',
    status: 'NOW_PLAYING',
  };
  const showtime = {
    showtimeId: 1,
    movieId: 1,
    studioId: 1,
    showDate: '2026-05-23',
    showTime: '19:30',
    price: '50000',
  };
  const cinema = {
    cinemaId: 1,
    cinemaName: 'CineMate',
    location: 'Jakarta',
  };
  const studio = {
    studioId: 1,
    cinemaId: 1,
    studioName: 'Studio 1',
    totalRows: 8,
    seatsPerRow: 12,
  };
  const showtimeDetail = {
    ...showtime,
    studio: {
      ...studio,
      cinema,
    },
  };
  const movieDetail = { ...movie, showtimes: [showtimeDetail] };

  it('controller delegates public and admin movie operations', async () => {
    const moviesService = {
      findAll: jest.fn().mockResolvedValue([movie]),
      findOne: jest.fn().mockResolvedValue(movieDetail),
      create: jest.fn().mockResolvedValue(movie),
      update: jest.fn().mockResolvedValue(movie),
      remove: jest.fn().mockResolvedValue(movie),
    };
    const controller = new MoviesController(
      moviesService as unknown as MoviesService,
    );

    await expect(
      controller.findAll({ status: 'NOW_PLAYING' }),
    ).resolves.toEqual([movie]);
    await expect(controller.findOne(1)).resolves.toEqual(movieDetail);
    await expect(controller.adminFindAll()).resolves.toEqual([movie]);
    await expect(controller.create(movie)).resolves.toEqual(movie);
    await expect(
      controller.update(1, { title: 'Interstellar' }),
    ).resolves.toEqual(movie);
    await expect(controller.remove(1)).resolves.toEqual(movie);
  });

  it('service creates, updates, and removes movies', async () => {
    const db = {
      select: jest
        .fn()
        .mockReturnValueOnce(selectWhere([movie]))
        .mockReturnValueOnce(selectWhere([{ showtime, studio, cinema }]))
        .mockReturnValueOnce(selectWhere([movie]))
        .mockReturnValueOnce(selectWhere([{ showtime, studio, cinema }]))
        .mockReturnValueOnce(selectWhere([movie]))
        .mockReturnValueOnce(selectWhere([{ showtime, studio, cinema }]))
        .mockReturnValueOnce(selectWhere([movie]))
        .mockReturnValueOnce(selectWhere([{ showtime, studio, cinema }])),
      insert: jest.fn().mockReturnValue(insertReturning({ movieId: 1 })),
      update: jest.fn().mockReturnValue(mutation()),
      delete: jest.fn().mockReturnValue(mutation()),
    };
    const storageService = {
      buildImageUrl: jest.fn().mockReturnValue(movie.imageUrl),
    };
    const service = new MoviesService(db, storageService as never);

    await expect(
      service.create({
        title: movie.title,
        description: movie.description,
        genre: movie.genre,
        ageRate: movie.ageRate,
        durationMinutes: movie.durationMinutes,
        imageKey: movie.imageKey,
        trailerUrl: movie.trailerUrl,
        releaseDate: movie.releaseDate,
        endDate: movie.endDate,
        status: movie.status,
      }),
    ).resolves.toEqual(movieDetail);
    await expect(service.update(1, { title: 'Interstellar' })).resolves.toEqual(
      movieDetail,
    );
    await expect(service.remove(1)).resolves.toEqual(movieDetail);
  });
});
