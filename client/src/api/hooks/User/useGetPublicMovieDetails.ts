import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface PublicCinema {
    cinemaId: number;
    cinemaName: string;
    location: string;
}

export interface PublicStudio {
    studioId: number;
    cinemaId: number;
    studioName: string;
    totalRows: number;
    seatsPerRow: number;
    cinema: PublicCinema;
}

export interface PublicShowtime {
    showtimeId: number;
    movieId: number;
    studioId: number; 
    showDate: string;
    showTime: string;
    price: string;
    studio: PublicStudio; 
}

export interface PublicMovieDetails {
    movieId: number;
    title: string;
    description: string;
    genre: string;
    ageRate: string;
    durationMinutes: number;
    imageKey: string;
    imageUrl: string;
    trailerUrl: string;
    releaseDate: string;
    endDate: string;
    status: string;
    showtimes: PublicShowtime[]; 
}

export const useGetPublicMovieDetails = (movieId?: string) => {
    return useQuery<PublicMovieDetails, Error>({
        queryKey: ['publicMovieDetails', movieId],
        queryFn: async () => {
            const response = await api.get<PublicMovieDetails>(`/movies/${movieId}`);
            return response.data;
        },
        enabled: !!movieId, 
        refetchOnWindowFocus: false,
    });
};