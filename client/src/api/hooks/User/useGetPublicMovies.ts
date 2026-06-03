import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface PublicMovieResponse {
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
}

export const useGetPublicMovies = (status?: 'NOW_PLAYING' | 'UPCOMING') => {
    return useQuery<PublicMovieResponse[], Error>({
        queryKey: ['publicMovies', status],
        queryFn: async () => {
            const response = await api.get<PublicMovieResponse[]>('/movies', {
                params: status ? { status } : {} 
            });
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};